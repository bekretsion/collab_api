# @collab-api/extension-logger
[![Version](https://img.shields.io/npm/v/@collab-api/extension-logger.svg?label=version)](https://www.npmjs.com/package/@collab-api/extension-logger)
[![Downloads](https://img.shields.io/npm/dm/@collab-api/extension-logger.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@collab-api/extension-logger.svg)](https://www.npmjs.com/package/@collab-api/extension-logger)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

Logs connection, document, and lifecycle events for a [Collab API](https://github.com/ueberdosis/collab-api) server to the console. Useful during development and debugging to see when clients connect, documents load and store, and changes come in.

## Installation

```bash
npm install @collab-api/extension-logger
```

## Usage

```js
import { Server } from "@collab-api/server"
import { Logger } from "@collab-api/extension-logger"

const server = new Server({
  extensions: [new Logger()],
})

server.listen()
```

### Silence specific hooks

Pass booleans per hook to quiet down the ones you don't care about:

```js
new Logger({
  onConnect: false,
  onDisconnect: false,
  onChange: false,
})
```

### Use a custom log function

Route output to your own logger (pino, winston, structured JSON, etc.):

```js
new Logger({
  log: (...args) => myLogger.info({ msg: args.join(" ") }),
})
```

## Documentation

Full options reference: [tiptap.dev/docs/collab-api/server/extensions/logger](https://tiptap.dev/docs/collab-api/server/extensions/logger).

## License

MIT — see [LICENSE.md](https://github.com/ueberdosis/collab-api/blob/main/LICENSE.md).
