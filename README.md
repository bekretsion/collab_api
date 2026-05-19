# Collab API

> Real-time collaborative document sync backend — WebSocket server built on Collab API and Yjs CRDT.

**Live backend:** [collab-api-jayn.onrender.com](https://collab-api-jayn.onrender.com)  
**Live playground:** [collab-api-frontend.vercel.app](https://collab-api-frontend.vercel.app)

---

## What it is

A WebSocket backend for real-time collaborative editing. Multiple clients connect, make changes simultaneously, and all changes merge automatically without conflicts — no matter the order they arrive.

Built on a production WebSocket server architecture for Yjs CRDT documents.

---

## Why this is senior-level work

Most developers reach for socket.io and build a naive broadcast system. This is architecturally different:

**CRDT-based conflict resolution**  
Uses Yjs — a battle-tested Conflict-free Replicated Data Type implementation. Two users typing at the same position simultaneously always merge correctly. No "last write wins", no data loss, no manual conflict handling.

**Binary protocol, not JSON**  
Document state travels as `Uint8Array` — Yjs binary encoding. More efficient than JSON, designed for partial state sync (only deltas are sent, not full document on every change).

**Awareness protocol**  
Cursor positions and presence (who is online, where their cursor is) run on a separate ephemeral channel inside the same WebSocket connection — never persisted, zero overhead on the persistence layer.

**Hook-based extension architecture**  
The server lifecycle is fully hookable: `onConnect → onAuthenticate → onLoadDocument → onChange → onStoreDocument → onDisconnect`. Each hook receives typed context — this is the pattern used to enforce multi-tenancy, auth, and custom persistence in production.

**Horizontal scaling ready**  
The Redis pub/sub adapter pattern means this server can run as multiple instances behind a load balancer — all instances share document state through Redis without sticky sessions.

---

## Current state

This repository is the **playground phase** — the live deployment demonstrates the core real-time sync working end-to-end.

**In progress:**
- `onAuthenticate` — JWT verification, returning `{ userId, tenantId }` as context
- Schema-per-tenant PostgreSQL with Prisma + row-level security
- `onLoadDocument` / `onStoreDocument` — binary state persistence to Postgres
- Redis extension for horizontal scaling
- REST API alongside WebSocket (document CRUD, user management)
- Pino structured logging with correlation IDs
- Docker + full deployment pipeline

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| WebSocket | Collab API |
| CRDT | Yjs |
| Scaling | Redis pub/sub adapter |
| Persistence | PostgreSQL + Prisma *(in progress)* |
| Auth | JWT RS256 + RBAC *(in progress)* |
| Deployment | Render (backend) · Vercel (playground) |

---

## Running Locally

```bash
git clone https://github.com/bekretsion/collab_api
cd collab_api
npm install
npm start
```

Server runs on `ws://localhost:1234`

---

## Architecture (target)

```
Clients (Browser / Mobile)
        │  WebSocket
        ▼
  Collab API Server
        │
   ┌────┴──────────────────────────┐
   │         Hook Lifecycle        │
   │  onAuthenticate  (JWT + RBAC) │
   │  onLoadDocument  (Postgres)   │
   │  onChange        (broadcast)  │
   │  onStoreDocument (Postgres)   │
   └────────────────────────────── ┘
        │                │
      Redis            PostgreSQL
   (pub/sub sync)   (binary doc state)
   multi-instance    schema-per-tenant
```
