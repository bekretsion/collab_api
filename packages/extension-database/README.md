# @collab-api/extension-database
[![Version](https://img.shields.io/npm/v/@collab-api/extension-database.svg?label=version)](https://www.npmjs.com/package/@collab-api/extension-database)
[![Downloads](https://img.shields.io/npm/dm/@collab-api/extension-database.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@collab-api/extension-database.svg)](https://www.npmjs.com/package/@collab-api/extension-database)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

A generic persistence base class for [Collab API](https://github.com/ueberdosis/collab-api). Provide your own `fetch` and `store` functions to plug any database into the collaboration backend — Postgres, MySQL, MongoDB, a REST API, etc.

## Installation

```bash
npm install @collab-api/extension-database
```

## Usage

Plug in any storage backend by implementing two async functions:

```js
import { Server } from "@collab-api/server"
import { Database } from "@collab-api/extension-database"

const server = new Server({
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        // return a Uint8Array of the stored Y.js update, or null for new documents
        return await yourDb.findDocument(documentName)
      },
      store: async ({ documentName, state }) => {
        // persist the binary Y.js state wherever you like
        await yourDb.upsertDocument(documentName, state)
      },
    }),
  ],
})

server.listen()
```

`state` is a `Buffer` containing the encoded Y.js update. Store it as-is and return it unchanged from `fetch`.

For dedicated storage drivers, see [`@collab-api/extension-sqlite`](../extension-sqlite) or [`@collab-api/extension-s3`](../extension-s3), both of which extend this base class.

## Documentation

Persistence patterns and performance tips: [tiptap.dev/docs/collab-api/guides/persistence](https://tiptap.dev/docs/collab-api/guides/persistence).

## License

MIT — see [LICENSE.md](https://github.com/ueberdosis/collab-api/blob/main/LICENSE.md).