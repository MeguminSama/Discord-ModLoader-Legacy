import { dialog, ipcMain, shell } from "electron";
import ModHook, { Mods, Profile } from "modhook";
import path from "path";
import { IPC } from "./types";
import { existsSync, mkdirSync } from "fs";

if (!existsSync(path.resolve(process.env.APPDATA, "DiscordModHook"))) {
	mkdirSync(path.resolve(process.env.APPDATA, "DiscordModHook"), { recursive: true });
}

export const modHook = new ModHook({
	jsTemplateLocation: path.resolve(process.cwd(), "resource.template.js"),
	databasePath: path.resolve(process.env.APPDATA, "DiscordModHook", "DiscordModHook.db"),
	profileDir: path.resolve(process.env.APPDATA, "DiscordModHook", "Profiles"),
});

const IPCMethods = {
	[IPC.DISCORD_GET_INSTANCES]: () => modHook.discord.getInstances(),
	[IPC.DOWNLOADER_DOWNLOAD_MOD]: (mod: Mods) => modHook.downloader.downloadMod(mod),
	[IPC.GET_PROFILES]: () => modHook.getProfiles(),
	[IPC.GET_PROFILE]: (id: string) => modHook.getProfile(id),
	[IPC.ADD_PROFILE]: (options: Omit<Profile, "id">) => modHook.addProfile(options),
	[IPC.UPDATE_PROFILE]: (profile: Profile) => modHook.updateProfile(profile),
	[IPC.DELETE_PROFILE]: (id: string) => modHook.deleteProfile(id),
	[IPC.START_PROFILE]: (id: string, discordPath: string, rebuild?: boolean) => modHook.startProfile(id, discordPath, rebuild),
	[IPC.CREATE_DESKTOP_SHORTCUT]: async (id: string, executablePath: string) => {
		const profile = await modHook.getProfile(id);
		if (!profile) throw new Error("Profile not found");

		const destination = await dialog.showSaveDialog({
			nameFieldLabel: `${profile.name}.lnk`,
			title: "Create desktop shortcut",
			buttonLabel: "Create",
			message: `Create a desktop shortcut for ${profile.name}`,
			filters: [{
				extensions: ["lnk"],
				name: "Shortcut",
			}]
		});

		if (destination.canceled || !destination.filePath) throw new Error("Canceled");

		const result = shell.writeShortcutLink(
			destination.filePath,
			{
				target: process.argv0,
				cwd: process.cwd(),
				args: `--profile="${id}" --discord-path="${executablePath}"`,
				icon: path.resolve(executablePath, "..", "app.ico"),
				description: `Launch Discord with ${profile.name}`,
			}
		);

		if (!result) throw new Error("Failed to create shortcut");

		return true;
	},
}

for (const method of Object.keys(IPCMethods)) {
	ipcMain.handle(method, async (event, ...args) => {
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return await Promise.resolve(IPCMethods[method as IPC](...args));
		} catch (error) {
			return Promise.reject(error);
		}
	});
}
