import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('calls the beforeBroadcastStateless hook', async t => {
  await new Promise(async resolve => {
    const payloadToSend = 'STATELESS-MESSAGE'
    const server = await newCollabApi(t, {
      async beforeBroadcastStateless({ payload }) {
        t.is(payload, payloadToSend)
        t.pass()
        resolve('done')
      },
    })

    newCollabApiProvider(t, server, {
      onSynced() {
        server.documents.get('collab-api-test')?.broadcastStateless(payloadToSend)
      },
    })
  })
})
