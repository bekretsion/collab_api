# Collab API

A production-grade real-time collaboration backend built on [Y.js](https://github.com/yjs/yjs) CRDTs.

[![Version](https://img.shields.io/npm/v/@collab-api/server.svg?label=version)](https://www.npmjs.com/package/@collab-api/server)
[![Downloads](https://img.shields.io/npm/dm/@collab-api/server.svg)](https://npmcharts.com/compare/@collab-api/server?minimal=true)
[![License](https://img.shields.io/npm/l/@collab-api/server.svg)](https://www.npmjs.com/package/@collab-api/server)

## How it works

Most "real-time" collaboration systems rely on operational transforms (OT) — a fragile, order-dependent algorithm that breaks under network partitions and requires a central authority to sequence operations. Collab API takes a different approach.

Every document is a **Y.js CRDT** (Conflict-free Replicated Data Type). Updates are encoded as compact binary diffs, broadcast over WebSocket, and merged on every client independently — with mathematical guarantees of convergence. No central sequencer. No conflict resolution logic. No last-write-wins races.

The sync protocol runs in two phases:

1. **State vector exchange** — clients exchange compressed state vectors to identify missing updates without transmitting full document state
2. **Diff application** — only the missing binary diffs are transmitted, applied, and re-broadcast

This makes both initial sync and incremental updates bandwidth-optimal, regardless of document size or connection history.

## Architecture

┌─────────────────────────────────────────────────┐
│                  CollabApi                       │
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌─────────────┐  │
│  │ Document │   │ Document │   │   Document  │  │
│  │  (Y.Doc) │   │  (Y.Doc) │   │   (Y.Doc)   │  │
│  └────┬─────┘   └────┬─────┘   └──────┬──────┘  │
│       │              │                │          │
│  ┌────▼──────────────▼────────────────▼──────┐   │
│  │           Extension Pipeline              │   │
│  │  Logger → Auth → Database → Redis → S3   │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
▲                   ▲
WebSocket           DirectConnection
(external)           (internal API)



Each `Document` is an in-memory Y.Doc shared across all connected clients. When the last client disconnects, a debounced `onStoreDocument` hook fires, persists the state, and the document is evicted from memory — keeping the server footprint flat under variable load.

## Packages

| Package | Description |
|---|---|
| `@collab-api/server` | Core WebSocket server and document lifecycle |
| `@collab-api/provider` | WebSocket client provider with reconnection and sync |
| `@collab-api/provider-react` | React hooks wrapping the provider |
| `@collab-api/common` | Shared types, auth helpers, CRDT utilities |
| `@collab-api/transformer` | Prosemirror / Tiptap ↔ Y.js document transformer |
| `@collab-api/extension-sqlite` | SQLite persistence via better-sqlite3 |
| `@collab-api/extension-database` | Generic database persistence interface |
| `@collab-api/extension-redis` | Redis pub/sub adapter for horizontal scaling |
| `@collab-api/extension-s3` | S3-compatible document storage |
| `@collab-api/extension-webhook` | Webhook delivery on document lifecycle events |
| `@collab-api/extension-throttle` | Rate limiting and connection banning |
| `@collab-api/extension-logger` | Structured request and event logging |

## Quick Start

```bash
npm install @collab-api/server @collab-api/extension-sqlite

import { Server } from '@collab-api/server'
import { SQLite } from '@collab-api/extension-sqlite'

const server = new Server({
  port: 1234,

  async onAuthenticate({ token, documentName }) {
    const user = await verifyJWT(token)
    if (!user.canAccess(documentName)) {
      throw new Error('Forbidden')
    }
  },

  async onLoadDocument({ document, documentName }) {
    const data = await db.get(documentName)
    if (data) Y.applyUpdate(document, data)
  },

  async onStoreDocument({ document, documentName }) {
    await db.set(documentName, Y.encodeStateAsUpdate(document))
  },

  extensions: [
    new SQLite({ database: 'db.sqlite' }),
  ],
})

server.listen()
Horizontal Scaling with Redis
A single Collab API node keeps all documents in memory. To scale across multiple nodes, the Redis extension fans out Y.js binary updates via pub/sub — every node receives every update and applies it to its local in-memory copy, keeping all instances converged without sticky sessions or a shared memory layer.


import { Server } from '@collab-api/server'
import { Redis } from '@collab-api/extension-redis'
import { S3 } from '@collab-api/extension-s3'

const server = new Server({
  port: 1234,
  extensions: [
    new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
    }),
    new S3({
      bucket: process.env.S3_BUCKET,
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  ],
})

server.listen()
Deploy N instances behind a load balancer with no affinity rules — any node can serve any client.

Direct Connections (Server-side Document Access)
Beyond WebSocket clients, Collab API exposes a DirectConnection API for server-side processes to read and write documents programmatically — useful for export jobs, AI pipelines, or administrative mutations:


const connection = await server.openDirectConnection('document-id', context)

connection.transact((doc) => {
  const text = doc.getText('content')
  text.insert(0, 'Server-injected content')
})

await connection.disconnect()
Transactions are applied as Y.js transactions with a local origin and propagate to all connected WebSocket clients in real time.

Extension Pipeline
Extensions execute as an ordered async middleware chain. Each hook receives the same payload and can short-circuit the chain by throwing SkipFurtherHooksError:


import { SkipFurtherHooksError } from '@collab-api/common'

class CacheExtension {
  async onLoadDocument({ document, documentName }) {
    const cached = await redis.getBuffer(documentName)
    if (cached) {
      Y.applyUpdate(document, cached)
      throw new SkipFurtherHooksError() // skip remaining onLoadDocument hooks
    }
  }
}
Control execution order across extensions with priority:


class HighPriorityAuth {
  priority = 200 // higher runs first (default: 100)

  async onAuthenticate({ token }) {
    // always runs before lower-priority extensions
  }
}
Lifecycle Hooks
Hook	Triggered
onConfigure	Once at server startup
onListen	When the HTTP server binds
onUpgrade	On WebSocket upgrade request
onConnect	On every new client connection
onAuthenticate	Before document access is granted
onLoadDocument	First time a document is requested
afterLoadDocument	After document is fully loaded
beforeHandleMessage	Before each incoming message is processed
beforeSync	Before initial sync step
onChange	On every Y.js document update
onStoreDocument	Debounced — after changes settle
afterStoreDocument	After persistence completes
onAwarenessUpdate	On cursor / presence state changes
onStateless	On custom stateless messages
beforeUnloadDocument	Before document is evicted from memory
afterUnloadDocument	After document is evicted
onDisconnect	On client disconnect
onRequest	On raw HTTP requests (non-WebSocket)
onDestroy	On server shutdown
Awareness & Presence
Collab API syncs Y.js awareness state alongside document state — enabling cursors, selections, online indicators, and any ephemeral per-user data with no extra infrastructure:


// client
provider.awareness.setLocalStateField('user', {
  name: 'Alice',
  color: '#ff0000',
  cursor: { anchor: 42, head: 56 },
})

// server
async onAwarenessUpdate({ states, documentName }) {
  const online = states.map(s => s.user?.name)
  console.log(`${online.length} users in ${documentName}`)
}
Debounced Persistence
onStoreDocument is intentionally debounced. High-frequency edits collapse into a single store call after the configured idle window — preventing write amplification while guaranteeing the final state is always persisted:


const server = new Server({
  debounce: 2000,     // wait 2s after last change
  maxDebounce: 10000, // always flush within 10s regardless
})
On graceful shutdown, flushPendingStores() drains all pending debounced writes before the process exits.

Running the Playground

pnpm install
pnpm playground              # default Node.js + Next.js frontend
pnpm playground:redis        # with Redis
pnpm playground:express      # with Express
pnpm playground:s3           # with S3
pnpm playground:webhook      # with webhooks
pnpm playground:bun          # Bun runtime
pnpm playground:deno         # Deno runtime
Requirements
Node.js >= 22
Contributing
Issues and pull requests welcome at github.com/bekretsion/collab_api.



