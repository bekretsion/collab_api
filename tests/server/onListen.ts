import test from 'ava'
import { newCollabApi } from '../utils/index.ts'

test('executes the onListen callback', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onListen() {
        t.pass()
        resolve('done')
      },
    })
  })
})

test('executes the onListen callback from an extension', async t => {
  await new Promise(async resolve => {
    class CustomExtension {
      async onListen() {
        t.pass()
        resolve('done')
      }
    }

    newCollabApi(t, {
      extensions: [
        new CustomExtension(),
      ],
    })
  })
})

test('has the configuration', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onListen({ configuration }) {
        t.is(configuration.quiet, true)
        resolve('done')
      },
    })
  })
})

test('has the port', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onListen({ port }) {
        t.truthy(port)
        resolve('done')
      },
    })
  })
})
