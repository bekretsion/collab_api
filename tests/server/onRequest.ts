import test from 'ava'
import type { onRequestPayload } from '@collab-api/server'
import { newCollabApi } from '../utils/index.ts'

test('executes the onRequest callback', async t => {
  await new Promise(async resolve => {
    const collabApi = await newCollabApi(t, {
      async onRequest({ request }: onRequestPayload) {
        t.is(request.url, '/foobar')

        resolve('done')
      },
    })

    fetch(`${collabApi.server!.httpURL}/foobar`).catch(() => {})
  })
})

test('executes the onRequest callback of a custom extension', async t => {
  await new Promise(async resolve => {
    class CustomExtension {
      async onRequest({ response }: onRequestPayload) {
        return new Promise((resolve, reject) => {

          response.writeHead(200, { 'Content-Type': 'text/plain' })
          response.end('I like cats.')

          return reject()
        })
      }
    }

    const collabApi = await newCollabApi(t, {
      extensions: [
        new CustomExtension(),
      ],
    })

    const response = await fetch(collabApi.server!.httpURL)
    t.is(await response.text(), 'I like cats.')
    resolve('done')
  })
})

test('can intercept specific URLs', async t => {
  await new Promise(async resolve => {
    const collabApi = await newCollabApi(t, {
      async onRequest({ response, request }: onRequestPayload) {
        if (request.url === '/foobar') {
          return new Promise((resolve, reject) => {

            response.writeHead(200, { 'Content-Type': 'text/plain' })
            response.end('I like cats.')

            return reject()
          })
        }
      },
    })

    const interceptedResponse = await fetch(`${collabApi.server!.httpURL}/foobar`)
    t.is(await interceptedResponse.text(), 'I like cats.')

    const regularResponse = await fetch(collabApi.server!.httpURL)
    t.is(await regularResponse.text(), 'Welcome to CollabApi!')
    resolve('done')
  })
})

test('has the instance', async t => {
  await new Promise(async resolve => {
    const collabApi = await newCollabApi(t, {
      async onRequest({ instance }) {
        t.is(instance, collabApi)
        resolve('done')
      },
    })

    fetch(`${collabApi.server!.httpURL}/foobar`).catch(() => {})
  })
})
