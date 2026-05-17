import test from 'ava'
import { WebSocketStatus } from '@collab-api/provider'
import {
  newCollabApi, newCollabApiProvider, newCollabApiProviderWebsocket, sleep,
} from '../utils/index.ts'
import { retryableAssertion } from '../utils/retryableAssertion.ts'

// test('closes all connections', async t => {
//   const server = await newCollabApi(t)
//   const socket = newCollabApiProviderWebsocket(t, server)
//   const socket2 = newCollabApiProviderWebsocket(t, server)

//   const provider = newCollabApiProvider(t, server, {
//     name: 'collab-api-test',
//     onClose() {
//       // Make sure it doesn’t reconnect.
//       socket.disconnect()
//     },
//     websocketProvider: socket,
//   })

//   const anotherProvider = newCollabApiProvider(t, server, {
//     name: 'collab-api-test-2',
//     onClose() {
//       // Make sure it doesn’t reconnect.
//       socket2.disconnect()
//     },
//     websocketProvider: socket2,
//   })

//   await sleep(100)

//   server.closeConnections()

//   t.is(server.documents.size, 1)
// })

test('closes a specific connection when a documentName is passed', async t => {
  const server = await newCollabApi(t)
  const socket = newCollabApiProviderWebsocket(t, server)
  const socket2 = newCollabApiProviderWebsocket(t, server)

  const provider = newCollabApiProvider(t, server, {
    name: 'collab-api-test',
    onClose() {
      // Make sure it doesn’t reconnect.
      socket.disconnect()
    },
    websocketProvider: socket,
  })

  const anotherProvider = newCollabApiProvider(t, server, {
    name: 'collab-api-test-2',
    websocketProvider: socket2,
  })

  await sleep(100)

  server.closeConnections('collab-api-test')

  await retryableAssertion(t, tt => {
    tt.is(socket.status, WebSocketStatus.Disconnected)
    tt.is(socket2.status, WebSocketStatus.Connected)
  })
})

// test('uses a proper close event', async t => {
//   await new Promise(async resolve => {
//     const server = await newCollabApi(t)

//     newCollabApiProvider(t, server, {
//       name: 'collab-api-test',
//       onSynced() {
//         server.closeConnections()
//       },
//       onClose({ event }) {
//         // Make sure it doesn’t reconnect.
//         t.is(event.code, 1000)
//         t.is(event.reason, 'Reset Connection')

//         resolve('done')
//       },
//     })
//   })
// })
