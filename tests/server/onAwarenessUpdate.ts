import test from 'ava'
import type { onAwarenessUpdatePayload } from '@collab-api/server'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onAwarenessUpdate callback', async t => {
  await new Promise(async resolve => {
    let resolved = false

    const server = await newCollabApi(t, {
      async onAwarenessUpdate({ states }) {
        if (resolved) return
        resolved = true

        t.is(states.length, 1)
        t.is(states[0].foo, 'bar')

        resolve('done')
      },
    })

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.setAwarenessField('foo', 'bar')
      },
    })
  })
})

test('executes the onAwarenessUpdate callback from a custom extension', async t => {
  await new Promise(async resolve => {
    let resolved = false

    class CustomExtension {
      async onAwarenessUpdate({ states }: onAwarenessUpdatePayload) {
        if (resolved) return
        resolved = true

        t.is(states.length, 1)
        t.is(states[0].foo, 'bar')

        resolve('done')
      }
    }

    const server = await newCollabApi(t, {
      extensions: [
        new CustomExtension(),
      ],
    })

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.setAwarenessField('foo', 'bar')
      },
    })
  })
})
