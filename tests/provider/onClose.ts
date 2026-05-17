import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('onClose callback is executed', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.configuration.websocketProvider.disconnect()
      },
      onClose() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test("on('close') callback is executed", async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server)

    provider.on('connect', () => {
      provider.configuration.websocketProvider.disconnect()
    })

    provider.on('close', () => {
      t.pass()
      resolve('done')
    })
  })
})
