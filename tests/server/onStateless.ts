import test from 'ava'
import type { onStatelessPayload } from '@collab-api/server'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('broadcast stateless message to all connections', async t => {
  await new Promise(async resolve => {
    const payloadToSend = 'STATELESS-MESSAGE'
    const server = await newCollabApi(t, {
      onStateless: async ({ document }) => {
        await document.broadcastStateless(payloadToSend)
      },
    })

    let count = 2
    const onStatelessCallback = (payload: string) => {
      t.is(payload, payloadToSend)
      count -= 1
      if (count === 0) {
        t.pass()
        resolve('done')
      }
    }

    newCollabApiProvider(t, server, { onStateless: ({ payload }) => onStatelessCallback(payload) })
    const provider = newCollabApiProvider(t, server, {
      onStateless: ({ payload }) => onStatelessCallback(payload),
      onSynced: () => {
        provider.sendStateless(payloadToSend)
      },
    })
  })
})

test('send a stateless message to a specific connection', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      onStateless: async ({ connection }: onStatelessPayload) => {
        connection.sendStateless('This is a specific message.')
      },
    })

    await newCollabApiProvider(t, server, {
      onStateless: async () => {
        throw Error('The provider1 should not receive messages')
      },
    })

    const provider = await newCollabApiProvider(t, server, {
      onSynced: () => {
        provider.sendStateless('Send stateless message, and then a stateless message is will be received')
      },
      onStateless: () => {
        t.pass()
        resolve('done')
      },
    })
  })
})

test('calls the onStateless hook', async t => {
  await new Promise(async resolve => {
    const payloadToSend = 'STATELESS-MESSAGE'
    class CustomExtension {
      async onStateless({ payload }: onStatelessPayload) {
        t.is(payload, payloadToSend)
        t.pass()
        resolve('done')
      }
    }

    const server = await newCollabApi(t, {
      extensions: [
        new CustomExtension(),
      ],
    })

    const provider = await newCollabApiProvider(t, server, {
      onSynced: async () => {
        provider.sendStateless(payloadToSend)
      },
    })
  })
})

test('the server actively sends a stateless message', async t => {
  const payloadToSend = 'STATELESS-MESSAGE'
  const server = await newCollabApi(t)

  await new Promise(resolve => {
    newCollabApiProvider(t, server, {
      onSynced: async () => {
        server.documents.get('collab-api-test')?.broadcastStateless(payloadToSend)
      },
      onStateless: async ({ payload }) => {
        t.is(payload, payloadToSend)
        t.pass()
        resolve('done')
      },
    })
  })
})
