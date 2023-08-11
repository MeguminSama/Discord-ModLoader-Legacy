import { Link, useNavigate } from "@solidjs/router";
import type { Profile } from "modhook";
import { Accessor, createEffect, createSignal, For, Show } from "solid-js";

interface DiscordInstances {
	[instanceName: string]: string;
}

export function Home() {
	const [discordInstances, setDiscordInstances] = createSignal<DiscordInstances>({});
	const [profiles, setProfiles] = createSignal<Profile[]>([]);

	const [selectedInstance, setSelectedInstance] = createSignal<string | null>(null);
	const [selectedProfile, setSelectedProfile] = createSignal<Profile | null>(null);

	async function getDiscordInstances() {
		const instances = await ModHook.discord.getInstances();
		setDiscordInstances(instances);
	}

	async function getProfiles() {
		const profiles = await ModHook.getProfiles();

		setProfiles(profiles);
	}

	createEffect(() => {
		getDiscordInstances();
		getProfiles();
	})

	function createShortcut() {
		if (!selectedProfile()?.id || !selectedInstance()) {
			alert("Please select a profile and instance to create a shortcut for.");
			return;
		}

		ModHook.createDesktopShortcut(selectedProfile()?.id, discordInstances()[selectedInstance()]);
	}

	function runProfile() {
		if (!selectedProfile()?.id || !selectedInstance()) {
			alert("Please select a profile and instance to run.");
			return;
		}

		ModHook.startProfile(selectedProfile()?.id, discordInstances()[selectedInstance()], false);
	}

	return (
		<div>
			<div class="p-4 bg-gray-700 hover:bg-gray-800 text-blue-200 flex rounded-lg grid grid-cols-2">
				<div class="grid grid-cols-[auto_1fr] gap-3">
					<h1 class="text-2xl">Currently Selected Instance:</h1>
					<h1 class="text-2xl">{selectedInstance() || "None Selected"}</h1>
				</div>
				<div class="grid grid-cols-[auto_1fr] gap-3">
					<h1 class="text-2xl">Currently Selected Profile:</h1>
					<h1 class="text-2xl">{selectedProfile()?.name || "None Selected"}</h1>
				</div>
			</div>


			<div
				class="p-4 mt-4 mr-4 bg-gray-700 hover:bg-gray-800 text-blue-200 inline-block rounded-lg cursor-pointer"
				onClick={createShortcut}>
				Create Shortcut for Selected Profile
			</div>

			<div
				class="p-4 mt-4 bg-gray-700 hover:bg-gray-800 text-blue-200 inline-block rounded-lg cursor-pointer"
				onClick={runProfile}>
				Run Selected Profile
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
				<div>
					<h1 class="text-2xl select-none">Discord Instances</h1>
					<For each={Object.entries(discordInstances())}>
						{([name, path]) => (
							<DiscordInstance name={name} path={path} onClick={(instance) => setSelectedInstance(instance)} selected={selectedInstance} />
						)}
					</For>
				</div>
				<div>
					<h1 class="text-2xl select-none">Profiles</h1>
					<Show when={profiles().length === 0}>
						<p class="select-none">No profiles found.</p>
					</Show>
					<div>
						<Link href="/manage" class="text-blue-300 hover:underline bg-gray-700 hover:bg-gray-800 rounded-lg p-4 my-4 block">
							New Profile
						</Link>
					</div>
					<For each={profiles()}>
						{(profile) => (
							<ModProfile profile={profile} onClick={(profile) => setSelectedProfile(profile)} selected={selectedProfile} />
						)}
					</For>
				</div>
			</div>
		</div>
	);
}

interface DiscordInstanceProps {
	name: string;
	path: string;
	onClick?: (name: string) => void;
	selected?: Accessor<string>;
}

function DiscordInstance({ name, path, onClick, selected }: DiscordInstanceProps) {
	const cssClass = "rounded-lg p-4 my-4 cursor-pointer ";

	return (
		<div class={cssClass + (selected() === name ? "bg-green-700 hover:bg-green-800" : "bg-gray-700 hover:bg-gray-800")} onClick={() => onClick(name)}>
			<h2 class="text-xl">{name}</h2>
			<p class="clip break-words">{path}</p>
		</div>
	);
}

interface ModProfileProps {
	onClick?: (profile: Profile) => void;
	profile: Profile;
	selected?: Accessor<Profile>;
}

function ModProfile(props: ModProfileProps) {
	const cssClass = "p-4 rounded-lg ";

	return (
		<div class="my-4 grid grid-cols-[1fr_150px] gap-2">
			<div
				onClick={() => props.onClick?.(props.profile)}
				class={cssClass + (props.selected()?.id === props.profile?.id ? "bg-green-700 hover:bg-green-800" : "bg-gray-700 hover:bg-gray-800")}>
				<h2 class="text-xl">{props.profile.name}</h2>
				<p class="clip break-words">{props.profile.description}</p>
				<p class="clip break-words">Loading <code>{props.profile.originalAsarName}</code></p>
			</div>
			<div class="grid grid-cols-1 gap-1">
				<Link href={`/manage/${props.profile.id}`} class="bg-gray-700 hover:bg-gray-800 text-blue-300 flex rounded-lg">
					<div class="m-auto">
						Edit Profile
					</div>
				</Link>
				<div
					class="bg-red-700 hover:bg-red-800 text-blue-200 flex rounded-lg"
					onClick={() => {
						if (confirm("Are you sure you want to delete this profile?")) {
							ModHook.deleteProfile(props.profile.id)
								.then(() => {
									window.location.reload();
								})
								.catch((err) => {
									console.error(err);
									alert("Failed to delete profile.");
								});
						}
					}}>
					<div class="m-auto">
						Delete Profile
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
