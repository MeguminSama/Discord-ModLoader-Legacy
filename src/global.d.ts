import type { ModHook as OriginalModHook } from "./preload";

declare global {
	const ModHook = OriginalModHook;
	interface Window {
		ModHook: typeof ModHook;
	}
}

export { };
