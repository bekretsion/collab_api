import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onUpgrade callback', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {
      async onUpgrade() {
        t.pass()
        resolve('done')
      },
    })

    newCollabApiProvider(t, server)
  })
})

test('executes the onUpgrade callback from an extension', async t => {
  await new Promise(async resolve => {
    class CustomExtension {
      async onUpgrade() {
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

test('has the server instance', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {

      async onUpgrade({ instance }) {
        t.is(instance, server)
        resolve('done')
      },
    })

    newCollabApiProvider(t, server)
  })
})

test('has the request', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {

      async onUpgrade({ request }) {
        t.is(request.url, '/')
        resolve('done')
      },
    })

    newCollabApiProvider(t, server)
  })
})

test('has the socket', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {

      async onUpgrade({ socket }) {
        t.truthy(socket)
        resolve('done')
      },
    })

    newCollabApiProvider(t, server)
  })
})

test('has the head', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, {

      async onUpgrade({ head }) {
        t.truthy(head)
        resolve('done')
      },
    })

    newCollabApiProvider(t, server)
  })
})
