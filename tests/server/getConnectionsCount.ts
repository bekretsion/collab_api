import test from 'ava'
import { retryableAssertion } from '../utils/retryableAssertion.ts'
import { newCollabApi, newCollabApiProvider, newCollabApiProviderWebsocket } from '../utils/index.ts'

test('returns 0 connections when there’s no one connected', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    t.is(server.getConnectionsCount(), 0)

    resolve('done')
  })
})

test('close connection open when it fails', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      async onConnect() {
        throw new Error()
      },
    })

    newCollabApiProvider(t, server, {
      onAuthenticationFailed() {
        t.is(server.getConnectionsCount(), 0)
        resolve('done')
      },
    })
  })
})

test('dont close connection open when it fails but socket is external', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      async onConnect() {
        throw new Error()
      },
    })

    newCollabApiProvider(t, server, {
      onAuthenticationFailed() {
        t.is(server.getConnectionsCount(), 0)
        resolve('done')
      },
    })
  })
})

test('outputs the total connections', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    newCollabApiProvider(t, server, {
      onSynced() {
        t.is(server.getConnectionsCount(), 1)

        newCollabApiProvider(t, server, {
          onSynced() {
            t.is(server.getConnectionsCount(), 2)

            resolve('done')
          },
        })
      },
    })
  })
})

test('total connections includes direct connections', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, { name: 'collab-api-test' })

    await server.openDirectConnection('collab-api-test')
    t.is(server.getConnectionsCount(), 1)

    newCollabApiProvider(t, server, {
      onSynced() {
        t.is(server.getConnectionsCount(), 2)

        resolve('done')
      },
    })
  })
})

test('adds and removes connections properly', async t => {
  const server = await newCollabApi(t)

  const providers = [
    newCollabApiProvider(t, server),
    newCollabApiProvider(t, server),
    newCollabApiProvider(t, server),
    newCollabApiProvider(t, server),
    newCollabApiProvider(t, server),
  ]

  await retryableAssertion(t, tt => {
    tt.is(server.getConnectionsCount(), 5)
  })

  providers.forEach(provider => { provider.disconnect(); provider.configuration.websocketProvider.disconnect() })

  await retryableAssertion(t, tt => {
    tt.is(server.getConnectionsCount(), 0)
  })
})

test('multiplexed connections counts properly', async t => {
  const server = await newCollabApi(t)
  const socket = newCollabApiProviderWebsocket(t, server)

  const providers = [
    newCollabApiProvider(t, server, { name: 'mux-1' }, {}, socket),
    newCollabApiProvider(t, server, { name: 'mux-2' }, {}, socket),
    newCollabApiProvider(t, server, { name: 'mux-3' }, {}, socket),
    newCollabApiProvider(t, server),
    newCollabApiProvider(t, server),

  ]

  await retryableAssertion(t, tt => {
    tt.is(server.getConnectionsCount(), 3)
  })

  providers.forEach(provider => { provider.disconnect(); provider.configuration.websocketProvider.disconnect() })

  await retryableAssertion(t, tt => {
    tt.is(server.getConnectionsCount(), 0)
  })
})
