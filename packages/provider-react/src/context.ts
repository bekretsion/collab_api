import { createContext } from "react";

import type {
	CollabApiContextValue,
	CollabApiRoomContextValue,
} from "./types.ts";

/**
 * Context for the WebSocket connection shared across rooms
 */
export const CollabApiContext =
	createContext<CollabApiContextValue | null>(null);

/**
 * Context for the room/document provider
 */
export const CollabApiRoomContext =
	createContext<CollabApiRoomContextValue | null>(null);
