import { useContext } from "react";

import { CollabApiRoomContext } from "../context.ts";

/**
 * Access the CollabApiProvider instance for the current room.
 *
 * Must be used within a CollabApiRoom component.
 *
 * @returns The CollabApiProvider instance
 * @throws Error if used outside of CollabApiRoom
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const provider = useCollabApiProvider()
 *
 *   const editor = useEditor({
 *     extensions: [
 *       Collaboration.configure({ document: provider.document }),
 *       CollaborationCursor.configure({ provider }),
 *     ],
 *   })
 *
 *   return <EditorContent editor={editor} />
 * }
 * ```
 */
export function useCollabApiProvider() {
	const context = useContext(CollabApiRoomContext);

	if (!context) {
		throw new Error("useCollabApiProvider must be used within a CollabApiRoom");
	}

	return context.provider;
}
