import test from 'ava'
import { newCollabApi } from '../utils/index.ts'

test('returns a dynamic HTTP/WebSocket address with the correct port', async t => {
  const collabApi = await newCollabApi(t, {
    port: 4010,
  })

  t.is(collabApi.server!.address.port, 4010)
  t.is(collabApi.server!.httpURL, 'http://0.0.0.0:4010')
  t.is(collabApi.server!.webSocketURL, 'ws://0.0.0.0:4010')

  t.pass()
})
