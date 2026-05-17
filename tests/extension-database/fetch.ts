import test from 'ava'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Database } from '@collab-api/extension-database'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('fetch has the document name', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      extensions: [
        new Database({
          async fetch({ documentName }) {
            t.is(documentName, 'my-unique-document-name')

            resolve('done')

            return null
          },
        }),
      ],
    })

    newCollabApiProvider(t, server, {
      name: 'my-unique-document-name',
    })
  })
})

test('passes context from onAuthenticate to fetch', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      extensions: [
        new Database({
          async fetch({ context }) {
            t.deepEqual(context, {
              user: 123,
            })

            resolve('done')

            return null
          },
        }),
      ],
      async onAuthenticate() {
        return {
          user: 123,
        }
      },
    })

    newCollabApiProvider(t, server, {
      token: 'SUPER-SECRET-TOKEN',
      name: 'my-unique-document-name',
    })
  })
})
