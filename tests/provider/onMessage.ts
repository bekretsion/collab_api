import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onMessage callback', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, { })

    newCollabApiProvider(t, server, {
      onMessage() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test("executes the on('message') callback", async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server)

    provider.on('message', () => {
      t.pass()
      resolve('done')
    })
  })
})
