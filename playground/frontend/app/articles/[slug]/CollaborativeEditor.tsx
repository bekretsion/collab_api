"use client";

import type { CollabApiProvider } from "@collab-api/provider";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import * as Y from "yjs";

const initialContent = [
	1, 3, 223, 175, 255, 141, 2, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116, 3,
	9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 223, 175, 255, 141, 2, 0,
	6, 4, 0, 223, 175, 255, 141, 2, 1, 17, 72, 101, 108, 108, 111, 32, 87, 111,
	114, 108, 100, 33, 32, 240, 159, 140, 142, 0,
];

const CollaborativeEditor = (props: {
	slug: string;
	provider: CollabApiProvider;
}) => {
	Y.applyUpdate(props.provider.document, Uint8Array.from(initialContent));

	const editor = useEditor(
		{
			extensions: [
				StarterKit.configure({ undoRedo: false }),
				Collaboration.configure({ document: props.provider.document }),
				CollaborationCaret.configure({ provider: props.provider }),
			],
			immediatelyRender: false,
			editorProps: {
				attributes: {
					class:
						"focus:outline-none min-h-[420px] px-6 py-6 text-[14px] leading-relaxed text-white/90",
				},
			},
		},
		[props.provider.document],
	);

	return <EditorContent editor={editor} />;
};

export default CollaborativeEditor;
