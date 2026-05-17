"use client";

import type { CollabApiProviderWebsocket } from "@collab-api/provider";
import { createContext } from "react";

export const SocketContext2 = createContext<CollabApiProviderWebsocket | null>(
	null,
);
