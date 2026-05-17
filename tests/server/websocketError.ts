import test from 'ava'
import type { onAuthenticatePayload } from '@collab-api/server'
import { newCollabApi, newCollabApiProvider, newCollabApiProviderWebsocket } from '../utils/index.ts'

test('does not crash when malformed message is sent pre-authentication', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      async onAuthenticate(data: onAuthenticatePayload) {
        return new Promise(async resolve => {
          setTimeout(resolve, 2000)
        })
      },
    })

    const socket = newCollabApiProviderWebsocket(t, server)

    let interval: ReturnType<typeof setInterval>

    const provider = newCollabApiProvider(t, server, {
      websocketProvider: socket,
      onClose({ event }) {
        t.is(event.code, 4401)
        clearInterval(interval)
        provider.destroy()
      },
      onDestroy() {
        t.pass()
        resolve(true)
      },
    })

    interval = setInterval(() => {
      if (socket.webSocket) {
        socket.webSocket.send('ϩ') // eslint-disable-line
      }
    }, 500)
  })
})