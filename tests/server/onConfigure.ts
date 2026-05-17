import test from 'ava'
import type { CollabApi } from '@collab-api/server'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('onConfigure callback is executed', async t => {
  await new Promise(async resolve => {
    let givenInstance = null

    const server = await newCollabApi(t, {
      async onConfigure({ instance }) {
        givenInstance = instance
      },
    })

    t.is(givenInstance as unknown as CollabApi, server)
    resolve('done')
  })
})

test('executes onConfigure callback from an extension', async t => {
  await new Promise(async resolve => {
    class CustomExtension {
      async onConfigure() {
        t.pass()
        resolve('done')
      }
    }

    const server = await newCollabApi(t, {
      extensions: [
        new CustomExtension(),
      ],
    })

    newCollabApiProvider(t, server)
  })
})

test('has the configuration', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      debounce: 2001,
      async onConfigure({ configuration }) {
        t.is(configuration.debounce, 2001)

        resolve('done')
      },
    })
  })
})

test('has the version', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onConfigure({ version }) {
        t.truthy(version)

        resolve('done')
      },
    })
  })
})
