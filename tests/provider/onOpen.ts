import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('onOpen callback is executed', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    newCollabApiProvider(t, server, {
      onOpen() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test("on('open') callback is executed", async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server)

    provider.on('open', () => {
      t.pass()
      resolve('done')
    })
  })
})
