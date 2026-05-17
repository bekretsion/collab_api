import test from 'ava'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

test('executes the onAuthenticationFailed callback', async t => {
  await new Promise(async resolve => {
    newCollabApi(t, {
      async onAuthenticate({ token }) {
        throw new Error()
      },
    }).then(server => {
      newCollabApiProvider(t, server, {
        token: 'SUPER-SECRET-TOKEN',
        onAuthenticationFailed() {
          t.pass()
          resolve('done')
        },
      })
    })
  })
})
