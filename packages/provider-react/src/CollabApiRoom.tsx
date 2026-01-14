"use client";

import { CollabApiProvider } from "@collab-api/provider";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { CollabApiContext, CollabApiRoomContext } from "./context.ts";
import type { CollabApiProviderEvents, CollabApiRoomProps } from "./types.ts";

/**
 * Mapping from CollabApiRoom `on*` prop names to provider event names.
 */
const EVENT_PROP_MAP: Record<string, keyof CollabApiProviderEvents> = {
	onOpen: "open",
	onConnect: "connect",
	onClose: "close",
	onDisconnect: "disconnect",
	onStatus: "status",
	onSynced: "synced",
	onUnsyncedChanges: "unsyncedChanges",
	onMessage: "message",
	onOutgoingMessage: "outgoingMessage",
	onStateless: "stateless",
	onAuthenticated: "authenticated",
	onAuthenticationFailed: "authenticationFailed",
	onAwarenessUpdate: "awarenessUpdate",
	onAwarenessChange: "awarenessChange",
	onDestroy: "destroy",
};

/**
 * CollabApiRoom manages the connection to a specific document.
 *
 * It uses the shared WebSocket from CollabApiProviderWebsocketComponent and creates a document-specific
 * provider that connects on mount and disconnects on unmount.
 *
 * This component handles React's StrictMode gracefully by using deferred destruction,
 * preventing unnecessary reconnections during development double-mounts.
 *
 * @example
 * ```tsx
 * <CollabApiProviderWebsocketComponent url="ws://localhost:1234">
 *   <CollabApiRoom
 *     name="document-1"
 *     onAuthenticationFailed={(data) => console.error(data.reason)}
 *   >
 *     <Editor />
 *   </CollabApiRoom>
 * </CollabApiProviderWebsocketComponent>
 * ```
 */
export function CollabApiRoom({
	children,
	name,
	document,
	token,
	...eventHandlers
}: CollabApiRoomProps) {
	const collabApiContext = useContext(CollabApiContext);

	if (!collabApiContext) {
		throw new Error(
			"CollabApiRoom must be used within a CollabApiProviderWebsocketComponent",
		);
	}

	const { websocketProvider } = collabApiContext;

	const [provider, setProvider] = useState(
		() =>
			new CollabApiProvider({
				name,
				websocketProvider,
				document,
				token,
			}),
	);

	const destroyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Recreate provider when name, document, or token changes.
	// Only compare `document`/`token` when the caller actually provided them —
	// otherwise the provider's constructor-initialized defaults (auto-created
	// Y.Doc, null token) will never match the undefined prop, causing a destroy
	// on every render (and in StrictMode, a stray CloseMessage for the current
	// doc once the provider is already attached).
	// biome-ignore lint/correctness/useExhaustiveDependencies: provider.configuration holds the previous values we compare against — not a reactive dependency
	useEffect(() => {
		const shouldRecreate =
			provider.configuration.name !== name ||
			(document !== undefined &&
				provider.configuration.document !== document) ||
			(token !== undefined && provider.configuration.token !== token) ||
			provider.configuration.websocketProvider !== websocketProvider;

		if (shouldRecreate) {
			provider.destroy();
			setProvider(
				new CollabApiProvider({
					name,
					websocketProvider,
					document,
					token,
				}),
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, document, token, websocketProvider]);

	// Attach/detach lifecycle with deferred destruction for StrictMode
	useEffect(() => {
		if (destroyTimeoutRef.current) {
			clearTimeout(destroyTimeoutRef.current);
			destroyTimeoutRef.current = null;
		}

		provider.attach();

		return () => {
			destroyTimeoutRef.current = setTimeout(() => {
				provider.destroy();
			}, 0);
		};
	}, [provider]);

	// Wire up on* event handler props with stable refs
	const handlersRef = useRef(eventHandlers);
	handlersRef.current = eventHandlers;

	useEffect(() => {
		const cleanups: (() => void)[] = [];

		for (const [propName, eventName] of Object.entries(EVENT_PROP_MAP)) {
			const listener = (...args: unknown[]) => {
				const handler = handlersRef.current[
					propName as keyof typeof handlersRef.current
				] as ((...a: unknown[]) => void) | undefined;
				handler?.(...args);
			};
			provider.on(eventName, listener);
			cleanups.push(() => provider.off(eventName, listener));
		}

		return () => {
			for (const cleanup of cleanups) {
				cleanup();
			}
		};
	}, [provider]);

	const contextValue = useMemo(
		() => ({
			provider,
		}),
		[provider],
	);

	return (
		<CollabApiRoomContext.Provider value={contextValue}>
			{children}
		</CollabApiRoomContext.Provider>
	);
}
