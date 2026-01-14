import { useCallback, useSyncExternalStore } from "react";

import type { ConnectionStatus } from "../types.ts";
import { useCollabApiProvider } from "./useCollabApiProvider.ts";

/**
 * Subscribe to the connection status of the collaboration provider.
 *
 * This hook uses React's useSyncExternalStore for optimal integration with
 * concurrent rendering features.
 *
 * @returns The current connection status: 'connecting', 'connected', or 'disconnected'
 *
 * @example
 * ```tsx
 * function ConnectionIndicator() {
 *   const status = useCollabApiConnectionStatus()
 *
 *   return (
 *     <div className={`status-${status}`}>
 *       {status === 'connected' ? 'Online' : status === 'connecting' ? 'Connecting...' : 'Offline'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCollabApiConnectionStatus(): ConnectionStatus {
	const provider = useCollabApiProvider();

	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			provider.on("status", onStoreChange);
			return () => {
				provider.off("status", onStoreChange);
			};
		},
		[provider],
	);

	const getSnapshot = useCallback(
		(): ConnectionStatus =>
			provider.configuration.websocketProvider.status as ConnectionStatus,
		[provider],
	);

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
