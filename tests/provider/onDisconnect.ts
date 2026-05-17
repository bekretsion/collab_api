import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('onDisconnect callback is executed', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.configuration.websocketProvider.disconnect()
        provider.disconnect()
      },
      onDisconnect() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test("on('disconnect') callback is executed", async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server)

    provider.on('connect', () => {
      provider.configuration.websocketProvider.disconnect()
      provider.disconnect()
    })
    provider.on('disconnect', () => {
      t.pass()
      resolve('done')
    })
  })
})
