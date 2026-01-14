import { useEffect, useRef } from "react";

import type { CollabApiProviderEvents } from "../types.ts";
import { useCollabApiProvider } from "./useCollabApiProvider.ts";

/**
 * Subscribe to events from the CollabApiProvider for the current room.
 *
 * The handler is stored in a ref so the subscription stays stable even if
 * the handler identity changes between renders.
 *
 * Must be used within a CollabApiRoom component.
 *
 * @param event - The event name to subscribe to
 * @param handler - Callback invoked when the event fires
 *
 * @example
 * ```tsx
 * function AuthGuard() {
 *   useCollabApiEvent('authenticationFailed', (data) => {
 *     console.error('Auth failed:', data.reason)
 *     redirectToLogin()
 *   })
 *
 *   useCollabApiEvent('close', (data) => {
 *     console.log('Connection closed', data.event)
 *   })
 *
 *   return null
 * }
 * ```
 */
export function useCollabApiEvent<E extends keyof CollabApiProviderEvents>(
	event: E,
	handler: CollabApiProviderEvents[E] extends undefined
		? () => void
		: (data: CollabApiProviderEvents[E]) => void,
): void {
	const provider = useCollabApiProvider();
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		const listener = (...args: unknown[]) => {
			(handlerRef.current as (...a: unknown[]) => void)(...args);
		};
		provider.on(event, listener);
		return () => {
			provider.off(event, listener);
		};
	}, [provider, event]);
}
