import test from 'ava'
import { AwarenessError } from '@collab-api/provider'
import { newCollabApi, newCollabApiProvider, sleep } from '../utils/index.ts'

test('onAwarenessUpdate callback is executed', async t => {
  await new Promise(async resolve => {
    let resolved = false
    const server = await newCollabApi(t, { })

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.setAwarenessField('foo', 'bar')
      },
      onAwarenessUpdate: ({ states }) => {
        if (resolved) return
        resolved = true

        t.is(states.length, 1)
        t.is(states[0].foo, 'bar')

        resolve('done')
      },
    })
  })
})

test('shares awareness state with other users', async t => {
  await new Promise(async resolve => {
    let resolved = false
    const server = await newCollabApi(t, { })

    const provider = newCollabApiProvider(t, server, {
      onConnect() {
        provider.setAwarenessField('name', 'player1')
      },
      onAwarenessUpdate: ({ states }) => {
        if (resolved) return
        const player2 = !!states.filter(state => state.name === 'player2').length

        if (player2) {
          resolved = true
          t.is(player2, true)
          resolve('done')
        }
      },
    })

    const anotherProvider = newCollabApiProvider(t, server, {
      onConnect() {
        anotherProvider.setAwarenessField('name', 'player2')
      },
      onAwarenessUpdate: ({ states }) => {
        if (resolved) return
        const player1 = !!states.filter(state => state.name === 'player1').length

        if (player1) {
          t.is(player1, true)
        }
      },
    })
  })
})

test('does not share awareness state with users in other documents', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, { })

    newCollabApiProvider(t, server, {
      async onConnect() {
        await sleep(100)

        t.pass()
        resolve('done')
      },
      onAwarenessUpdate: ({ states }) => {
        const player2 = !!states.filter(state => state.name === 'player2').length

        if (player2) {
          throw new Error('Awareness state leaked!')
        }
      },
    })

    const anotherProvider = newCollabApiProvider(t, server, {
      name: 'collab-api-completely-different-and-unrelated-document',
      onConnect() {
        anotherProvider.setAwarenessField('name', 'player2')
      },
    })
  })
})

test('allows awareness to be null', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t, { })

    newCollabApiProvider(t, server, {
      awareness: null,
      async onConnect() {
        await sleep(100)

        t.pass()
        resolve('done')
      },
    })
  })
})

test('throws an error in setAwarenessFields if awareness is null', async t => {
  await new Promise(async resolve => {
    const server = await newCollabApi(t)

    const provider = newCollabApiProvider(t, server, {
      awareness: null,
      onConnect() {
        try {
          provider.setAwarenessField('foo', 'bar')
          t.fail()
        } catch (err: any) {
          if (err instanceof AwarenessError) {
            t.pass()
          } else {
            t.fail()
          }
        } finally {
          resolve('done')
        }
      },
    })
  })
})
