"use client";

import type { CollabApiProviderWebsocket } from "@collab-api/provider";
import { createContext } from "react";

export const SocketContext1 = createContext<CollabApiProviderWebsocket | null>(
	null,
);
