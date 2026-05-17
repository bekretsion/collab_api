import test from 'ava'
import type { CollabApiProvider } from '@collab-api/provider'

import { newCollabApi, newCollabApiProvider, sleep } from '../utils/index.ts'

test('executes the afterLoadDocument callback', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      async afterLoadDocument() {
        t.pass()
        resolve('done')
      },
    })

    newCollabApiProvider(t, server, {})
  })
})

test('executes the afterLoadDocument callback in an extension', async t => {
  await new Promise(async resolve => {
    let provider: CollabApiProvider

    class CustomExtension {
      async afterLoadDocument() {
        t.pass()
        resolve('done')
      }
    }

    const server = await newCollabApi(t, {
      extensions: [new CustomExtension()],
    })

    newCollabApiProvider(t, server)
  })
})

test('does not execute the afterLoadDocument callback when document fails to load', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    class CustomExtension {
      async onLoadDocument() {
        throw new Error('oops!')
      }

      async afterLoadDocument() {
        t.fail('this should not be executed')
        resolve('done')
      }
    }

    server.configure({
      extensions: [
        new CustomExtension(),
      ],
    })

    newCollabApiProvider(t, server)

    await sleep(300)
    t.pass()
    resolve('')
  })
})
