import { contextBridge, ipcRenderer } from "electron";
import type { Mods, Profile } from "modhook";
import { IPC } from "./types";

type P<T> = Promise<T>;

export const ModHook = {
	discord: {
		getInstances: (): P<Record<string, string>> => ipcRenderer.invoke(IPC.DISCORD_GET_INSTANCES)
	},
	downloader: {
		download: (mod: Mods): P<string> => ipcRenderer.invoke(IPC.DOWNLOADER_DOWNLOAD_MOD, mod)
	},
	getProfiles: (): P<Profile[]> => ipcRenderer.invoke(IPC.GET_PROFILES),
	getProfile: (id: string): P<Profile> => ipcRenderer.invoke(IPC.GET_PROFILE, id),
	addProfile: (options: Omit<Profile, "id">): P<Profile> => ipcRenderer.invoke(IPC.ADD_PROFILE, options),
	updateProfile: (profile: Profile): P<Profile> => ipcRenderer.invoke(IPC.UPDATE_PROFILE, profile),
	deleteProfile: (id: string): P<void> => ipcRenderer.invoke(IPC.DELETE_PROFILE, id),
	startProfile: (id: string, discordPath: string, rebuild?: boolean): P<number> => ipcRenderer.invoke(IPC.START_PROFILE, id, discordPath, rebuild),
	createDesktopShortcut: (id: string, executablePath: string): P<unknown> => ipcRenderer.invoke(IPC.CREATE_DESKTOP_SHORTCUT, id, executablePath),
};

contextBridge.exposeInMainWorld("ModHook", ModHook);
