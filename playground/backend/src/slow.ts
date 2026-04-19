import { Server } from '@collab-api/server'
import { Logger } from '@collab-api/extension-logger'
import { SQLite } from '@collab-api/extension-sqlite'

const server = new Server({
  port: 1234,
  extensions: [
    new Logger(),
    new SQLite({
      database: 'db.sqlite',
    }),
  ],

  async onConnect(data) {
    // simulate a very slow authentication process that takes 10 seconds (or more if you want to type more)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    await new Promise((resolve: Function) => {
      setTimeout(() => { resolve() }, 10000)
    })

    return true
  },
})

server.listen()
