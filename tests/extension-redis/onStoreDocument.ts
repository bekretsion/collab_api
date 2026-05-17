import test from 'ava'
import type { onStoreDocumentPayload } from '@collab-api/server'
import { Redis } from '@collab-api/extension-redis'
import type { CollabApiProvider } from '@collab-api/provider'
import { uuidv4 } from 'lib0/random'
import { newCollabApi, newCollabApiProvider, redisConnectionSettings } from '../utils/index.ts'

test('stores documents without conflicts', async t => {
  await new Promise(async resolve => {
    // eslint-disable-next-line prefer-const
    let anotherProvider: CollabApiProvider

    class CustomStorageExtension {
      async onStoreDocument({ document }: onStoreDocumentPayload) {
        t.is(document.getArray('foo').get(0), 'bar')
        t.is(document.getArray('foo').get(0), anotherProvider.document.getArray('foo').get(0))

        resolve('done')
      }
    }

    const server = await newCollabApi(t, {
      name: 'redis-1',
      extensions: [
        new Redis({
          ...redisConnectionSettings,
          identifier: `server${uuidv4()}`,
          prefix: 'extension-redis/onStoreDocument1',
        }),
        new CustomStorageExtension(),
      ],
    })

    const anotherServer = await newCollabApi(t, {
      name: 'redis-2',
      extensions: [
        new Redis({
          ...redisConnectionSettings,
          identifier: `anotherServer${uuidv4()}`,
          prefix: 'extension-redis/onStoreDocument1',
        }),
        new CustomStorageExtension(),
      ],
    })

    newCollabApiProvider(t, server)

    anotherProvider = newCollabApiProvider(t, anotherServer, {
      onSynced() {
        // once we're setup make an edit on anotherProvider, if all succeeds the onStoreDocument
        // callback will be called after the debounce period and all docs will
        // be identical
        anotherProvider.document.getArray('foo').insert(0, ['bar'])
        anotherProvider.disconnect()
      },
    })
  })
})

test('stores documents when the last client disconnects', async t => {
  await new Promise(async resolve => {
    // eslint-disable-next-line prefer-const
    let provider: CollabApiProvider

    const server = await newCollabApi(t, {
      extensions: [
        new Redis({
          prefix: 'extension-redis/onStoreDocument2',
          ...redisConnectionSettings,
        }),
      ],
      onStoreDocument: async ({ document }) => {
        t.is(
          provider.document.getArray('foo').get(0),
          document.getArray('foo').get(0),
        )

        resolve('done')
      },
    })

    provider = newCollabApiProvider(t, server, {
      onSynced() {
        provider.document.getArray('foo').insert(0, ['bar'])
        provider.disconnect()
      },
    })
  })
})

test('document gets unloaded on both servers after disconnection', async t => {
  await new Promise(async resolve => {
    class CustomStorageExtension {
      priority = 10

      onStoreDocument({ document }: onStoreDocumentPayload) {
        console.log('storing')
        return new Promise(resolve2 => {
          setTimeout(() => {
            console.log('stored')

            resolve2('')
          }, 3000)
        })
      }
    }

    const server = await newCollabApi(t, {
      name: 'redis-1',
      extensions: [
        new Redis({
          ...redisConnectionSettings,
          prefix: 'extension-redis/onStoreDocument3',
        }),
        new CustomStorageExtension(),
      ],
    })

    const anotherServer = await newCollabApi(t, {
      name: 'redis-2',
      extensions: [
        new Redis({
          ...redisConnectionSettings,
          prefix: 'extension-redis/onStoreDocument3',
        }),
        new CustomStorageExtension(),
      ],
    })

    const provider = newCollabApiProvider(t, server)

    const anotherProvider = newCollabApiProvider(t, anotherServer, {
      onSynced() {
        // once we're setup make an edit on anotherProvider, if all succeeds the onStoreDocument
        // callback will be called after the debounce period and all docs will
        // be identical
        anotherProvider.document.getArray('foo').insert(0, ['bar'])
        provider.document.getArray('foo2').insert(0, ['bar'])

        setTimeout(() => {
          provider.configuration.websocketProvider.disconnect()
          anotherProvider.configuration.websocketProvider.disconnect()

          setTimeout(() => {
            t.is(anotherServer.documents.size, 0)
            t.is(server.documents.size, 0)

            resolve('')
          }, 10000) // must be higher than CustomStorageExtension delay (3s) + RedisExtension.disconnectDelay (1s)
        }, 1500)

      },
    })
  })
})
