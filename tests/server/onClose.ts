import test from 'ava'
import { WebSocketStatus } from '@collab-api/provider'
import { newCollabApi, newCollabApiProvider, newCollabApiProviderWebsocket } from '../utils/index.ts'
import { retryableAssertion } from '../utils/retryableAssertion.ts'

test('server closes connection when receiving close event from provider', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {})
    const socket = newCollabApiProviderWebsocket(t, server, {})

    const provider1 = newCollabApiProvider(t, server, {
      websocketProvider: socket,
      name: 'collab-api-test',
    })

    await retryableAssertion(t, t2 => {
      t2.is(server.getConnectionsCount(), 1)
    })

    await retryableAssertion(t, t2 => {
      provider1.destroy()
      t2.is(server.getConnectionsCount(), 0)
    })

    resolve('ok')
  })
})

test('server doesnt close connection after receiving close event from all connections', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {})
    const socket = newCollabApiProviderWebsocket(t, server, {})

    const provider1 = newCollabApiProvider(t, server, {
      websocketProvider: socket,
      name: 'collab-api-test',
    })

    const provider2 = newCollabApiProvider(t, server, {
      websocketProvider: socket,
      name: 'collab-api-test2',
    })

    await retryableAssertion(t, t2 => {
      t2.is(server.getConnectionsCount(), 1)
    })

    socket.shouldConnect = false
    provider1.destroy()

    t.is(provider1.configuration.websocketProvider.status, WebSocketStatus.Connected)
    t.is(provider2.configuration.websocketProvider.status, WebSocketStatus.Connected)

    setTimeout(async () => {
      t.is(server.getConnectionsCount(), 1)
      provider2.destroy()

      t.is(provider1.configuration.websocketProvider.status, WebSocketStatus.Connected)
      t.is(provider2.configuration.websocketProvider.status, WebSocketStatus.Connected)

      await retryableAssertion(t, t2 => {
        t2.is(server.getConnectionsCount(), 1)
        t2.is(provider1.configuration.websocketProvider.status, WebSocketStatus.Connected)
        t2.is(provider2.configuration.websocketProvider.status, WebSocketStatus.Connected)
      })

      resolve('ok')
    }, 200)
  })
})
