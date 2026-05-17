import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onStateless callback', async t => {
  const payloadToSend = 'STATELESS-MESSAGE'
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onStateless({ payload }) {
        t.is(payload, payloadToSend)
        t.pass()
        resolve('done')
      },
    }).then(server => {
      const provider = newCollabApiProvider(t, server, {
        onSynced: () => {
          provider.sendStateless(payloadToSend)
        },
      })
    })
  })
})
