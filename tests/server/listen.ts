import test from 'ava'
import { Server } from '@collab-api/server'
import { newCollabApi } from '../utils/index.ts'

test('should respond with OK', async t => {
  const collabApi = await newCollabApi(t)

  const response = await fetch(collabApi.server!.httpURL)

  t.is(await response.text(), 'Welcome to CollabApi!')
})

test('should respond with status 200', async t => {
  const collabApi = await newCollabApi(t)

  const response = await fetch(collabApi.server!.httpURL)

  t.is(await response.status, 200)
})

test('should respond with OK on a custom port', async t => {
  const collabApi = await newCollabApi(t, {
    port: 4000,
  })

  const response = await fetch(collabApi.server!.httpURL)

  t.is(collabApi.server!.address.port, 4000)
  t.is(await response.text(), 'Welcome to CollabApi!')
})

test('should respond with OK on a custom port passed to listen()', async t => {
  const server = new Server({
    port: 0,
    stopOnSignals: false,
  })

  t.teardown(() => server.httpServer.close())

  server.listen(4001)

  const response = await fetch(server.httpURL)

  t.is(server.address.port, 4001)
  t.is(await response.text(), 'Welcome to CollabApi!')
})

test('should take a custom port and a callback', async t => {
  const server = new Server({
    port: 0,
    stopOnSignals: false,
  })

  t.teardown(() => server.httpServer.close())

  await new Promise(async resolve => {
    server.listen(4002, () => {
      resolve('done')
    })
  })

  const response = await fetch(server.httpURL)

  t.is(server.address.port, 4002)
  t.is(await response.text(), 'Welcome to CollabApi!')
})

test('should execute a callback', async t => {
  const server = new Server({
    port: 0,
    stopOnSignals: false,
  })

  t.teardown(() => server.httpServer.close())

  await new Promise(async resolve => {
    server.listen(0, async () => {
      resolve('done')
    })
  })

  const response = await fetch(server.httpURL)

  t.is(await response.text(), 'Welcome to CollabApi!')
})

test('should have the custom port as a parameter in the callback', async t => {
  const server = new Server({
    port: 0,
    stopOnSignals: false,
  })

  t.teardown(() => server.httpServer.close())

  await new Promise(async resolve => {
    server.listen(0, async ({ port }: any) => {
      t.is(port, server.address.port)
      resolve('done')
    })
  })

  const response = await fetch(server.httpURL)

  t.is(await response.text(), 'Welcome to CollabApi!')
})
