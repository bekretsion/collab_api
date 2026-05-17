import test from 'ava'
import sinon from 'sinon'
import { Logger } from '@collab-api/extension-logger'
import { newCollabApi, newCollabApiProvider } from '../utils/index.ts'

const fakeLogger = (message: any) => {
}

test('logs something', async t => {
  await new Promise(async resolve => {
    const spy = sinon.spy(fakeLogger)

    const server = await newCollabApi(t, {
      extensions: [
        new Logger({
          log: spy,
        }),
      ],
    })

    newCollabApiProvider(t, server, {
      onConnect() {
        t.true(spy.callCount > 1, 'Expected the Logger to log something, but didn\'t receive anything.')
        t.true(spy.callCount === 3, `Expected it to log 11 times, but actually logged ${spy.callCount} times`)

        resolve('done')
      },
    })
  })
})

test('uses the global instance name', async t => {
  await new Promise(async resolve => {
    const spy = sinon.spy(fakeLogger)

    const collabApi = await newCollabApi(t, {
      name: 'FOOBAR123',
      extensions: [
        new Logger({
          log: spy,
        }),
      ],
    })

    await collabApi.server!.destroy()

    t.is(spy.args[spy.args.length - 1][0].includes('FOOBAR123'), true, 'Expected the Logger to use the configured instance name.')

    resolve('done')
  })

})

test('doesn\'t log anything if all messages are disabled', async t => {
  await new Promise(async resolve => {
    const spy = sinon.spy(fakeLogger)

    const collabApi = await newCollabApi(t, {
      extensions: [
        new Logger({
          log: spy,
          // TODO: Those hooks aren't triggered anyway.
          // onLoadDocument: false,
          // onChange: false,
          // onConnect: false,
          // onDisconnect: false,
          // onUpgrade: false,
          // onRequest: false,
          // @ts-expect-error
          onListen: false,
          onDestroy: false,
          onConfigure: false,
        }),
      ],
    })

    await collabApi.server!.destroy()

    t.is(spy.callCount, 0, 'Expected the Logger to not log anything.')

    resolve('done')
  })
})
