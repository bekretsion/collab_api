# @collab-api/extension-redis
[![Version](https://img.shields.io/npm/v/@collab-api/extension-redis.svg?label=version)](https://www.npmjs.com/package/@collab-api/extension-redis)
[![Downloads](https://img.shields.io/npm/dm/@collab-api/extension-redis.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@collab-api/extension-redis.svg)](https://www.npmjs.com/package/@collab-api/extension-redis)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

Scale [Collab API](https://github.com/ueberdosis/collab-api) horizontally across multiple server instances. Uses Redis pub/sub to broadcast document updates and awareness between servers, so clients connected to different instances stay in sync on the same document.

## Installation

```bash
npm install @collab-api/extension-redis
```

## Usage

Point every Collab API instance at the same Redis:

```js
import { Server } from "@collab-api/server"
import { Redis } from "@collab-api/extension-redis"

const server = new Server({
  port: 1234,
  extensions: [
    new Redis({
      host: "127.0.0.1",
      port: 6379,
    }),
  ],
})

server.listen()
```

### Bring your own Redis client

If you already have an `ioredis` client (including Cluster), pass it in directly instead of host/port:

```js
import RedisClient from "ioredis"

new Redis({
  redis: new RedisClient({ host: "127.0.0.1", port: 6379 }),
})
```

Redis handles real-time sync — you still need a persistence extension (e.g. [`@collab-api/extension-sqlite`](../extension-sqlite), [`@collab-api/extension-s3`](../extension-s3), or your own [`Database`](../extension-database)) to store documents long-term.

## Documentation

Full scaling architecture and multi-instance deployment guide: [tiptap.dev/docs/collab-api/server/extensions/redis](https://tiptap.dev/docs/collab-api/server/extensions/redis).

## License

MIT — see [LICENSE.md](https://github.com/ueberdosis/collab-api/blob/main/LICENSE.md).
