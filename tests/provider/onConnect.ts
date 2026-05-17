import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onConnect callback', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    newCollabApiProvider(t, server, {
      onConnect() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test("executes the on('connect') callback", async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server)

    provider.on('connect', () => {
      t.pass()
      resolve('done')
    })
  })
})
