"use client";

import { CollabApiProviderWebsocket } from "@collab-api/provider";
import { useEffect, useMemo, useRef } from "react";

import { CollabApiContext } from "./context.ts";
import type { CollabApiProviderWebsocketComponentProps } from "./types.ts";

/**
 * CollabApiProviderWebsocketComponent manages the WebSocket connection that is shared across all rooms.
 *
 * This component creates a single WebSocket connection that can be used by multiple
 * CollabApiRoom components, preventing connection overhead when switching between documents.
 *
 * @example
 * ```tsx
 * <CollabApiProviderWebsocketComponent url="ws://localhost:1234">
 *   <CollabApiRoom name="document-1">
 *     <Editor />
 *   </CollabApiRoom>
 * </CollabApiProviderWebsocketComponent>
 * ```
 */
export function CollabApiProviderWebsocketComponent({
	children,
	url,
	websocketProvider: externalWebsocketProvider,
}: CollabApiProviderWebsocketComponentProps) {
	const websocketRef = useRef<CollabApiProviderWebsocket | null>(null);
	const destroyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Create WebSocket provider once on mount.
	// Safe in StrictMode: useRef persists across double-renders, so the instance
	// is created only once. The deferred destruction in the effect below ensures
	// the second mount cancels the pending destroy before it fires.
	if (!websocketRef.current && !externalWebsocketProvider) {
		websocketRef.current = new CollabApiProviderWebsocket({
			url: url!,
		});
	}

	const websocketProvider =
		externalWebsocketProvider ??
		(websocketRef.current as CollabApiProviderWebsocket);

	// Cleanup on unmount with deferred destruction to handle StrictMode double-mount
	useEffect(() => {
		if (destroyTimeoutRef.current) {
			clearTimeout(destroyTimeoutRef.current);
			destroyTimeoutRef.current = null;
		}

		return () => {
			// Only destroy if we created the websocket (not externally provided)
			if (!externalWebsocketProvider) {
				destroyTimeoutRef.current = setTimeout(() => {
					if (websocketRef.current) {
						websocketRef.current.destroy();
						websocketRef.current = null;
					}
				}, 0);
			}
		};
	}, [externalWebsocketProvider]);

	const contextValue = useMemo(
		() => ({
			websocketProvider,
		}),
		[websocketProvider],
	);

	return (
		<CollabApiContext.Provider value={contextValue}>
			{children}
		</CollabApiContext.Provider>
	);
}
