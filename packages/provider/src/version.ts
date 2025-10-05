export const version: string =
	// @ts-expect-error - __COLLAB_API_VERSION__ is replaced at build time by rolldown
	typeof __COLLAB_API_VERSION__ !== "undefined"
		? // @ts-expect-error - __COLLAB_API_VERSION__ is replaced at build time by rolldown
			__COLLAB_API_VERSION__
		: "unknown";
