# @collab-api/provider-react
[![Version](https://img.shields.io/npm/v/@collab-api/provider-react.svg?label=version)](https://www.npmjs.com/package/@collab-api/provider-react)
[![Downloads](https://img.shields.io/npm/dm/@collab-api/provider-react.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@collab-api/provider-react.svg)](https://www.npmjs.com/package/@collab-api/provider-react)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

React bindings for the [Collab API provider](../provider). Wraps the provider in components and hooks so React handles the lifecycle — including StrictMode double-mounts. Built on `useSyncExternalStore`.

## Installation

```bash
npm install @collab-api/provider @collab-api/provider-react yjs
```

Requires React 18 or 19.

## Usage

Wrap your collaborative subtree with `Collab APIProviderWebsocketComponent` (shared WebSocket) and one or more `Collab APIRoom`s (one per document). Inside the room, hooks give you the provider and its state:

```tsx
import {
  CollabApiProviderWebsocketComponent,
  CollabApiRoom,
  useCollabApiProvider,
  useCollabApiConnectionStatus,
} from "@collab-api/provider-react"

function Editor() {
  const provider = useCollabApiProvider()
  const status = useCollabApiConnectionStatus()
  // wire provider.document / provider.awareness into your editor
  return <div>{status}</div>
}

export function App() {
  return (
    <CollabApiProviderWebsocketComponent url="ws://127.0.0.1:1234">
      <CollabApiRoom name="example-document" token="super-secret-token">
        <Editor />
      </CollabApiRoom>
    </CollabApiProviderWebsocketComponent>
  )
}
```

To use with Tiptap, pass `provider.document` into the `Collaboration` extension and `provider` into `CollaborationCaret` — see the [collaborative editing guide](https://tiptap.dev/docs/collab-api/guides/collaborative-editing) for a full example.

## Exports

**Components**

- `Collab APIProviderWebsocketComponent` — manages the shared WebSocket
- `Collab APIRoom` — creates a per-document provider on the shared socket; StrictMode-safe

**Hooks** (must be used inside a `Collab APIRoom`)

- `useCollab APIProvider()` — the `Collab APIProvider` instance
- `useCollab APIConnectionStatus()` — `'connecting' | 'connected' | 'disconnected'`
- `useCollab APISyncStatus()` — `'synced' | 'syncing'`
- `useCollab APIAwareness()` — array of connected users' awareness state
- `useCollab APIEvent(name, handler)` — subscribe to any provider event

## Documentation

Full components, hooks, and patterns reference: [tiptap.dev/docs/collab-api/provider/react](https://tiptap.dev/docs/collab-api/provider/react).

## License

MIT — see [LICENSE.md](https://github.com/ueberdosis/collab-api/blob/main/LICENSE.md).
