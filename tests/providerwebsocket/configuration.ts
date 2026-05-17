import test from 'ava'
import { newCollabApi, newCollabApiProviderWebsocket } from '../utils/index.ts'

test('has default configuration (maxDelay = 30000)', async t => {
  const server = await newCollabApi(t)
  const client = newCollabApiProviderWebsocket(t, server)

  t.is(client.configuration.maxDelay, 30000)
})

test('overwrites the default configuration', async t => {
  const server = await newCollabApi(t)
  const client = newCollabApiProviderWebsocket(t, server, {
    maxDelay: 10000,
  })

  t.is(client.configuration.maxDelay, 10000)
})
