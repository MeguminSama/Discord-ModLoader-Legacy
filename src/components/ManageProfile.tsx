import { Link, useNavigate, useParams } from "@solidjs/router";
import type { Profile } from "modhook";
import { createEffect, createSignal, JSX, Show } from "solid-js";

export function ManageProfile() {
	const { id } = useParams<{ id: string }>();

	const [profile, setProfile] = createSignal<Partial<Profile> | null>(id ? null : {});
	const [loaded, setLoaded] = createSignal(false);

	createEffect(async () => {
		if (!id) return;
		const profile = await ModHook.getProfile(id);
		setProfile(profile);
	});

	createEffect(() => {
		if (loaded() === null) return;
		setLoaded(true);
	}, [profile()]);

	return (
		<main>
			<Link href="/" class="text-blue-300 hover:underline bg-gray-700 hover:bg-gray-800 rounded-lg p-4 my-4 inline-block">
				Return Home
			</Link>
			<Show when={loaded()}>
				<ManageProfileForm profile={profile()} />
			</Show>
		</main>
	);
}

interface FormItemProps {
	label: string;
	value?: string;
	placeholder?: string;
	required?: boolean;
	help?: string | JSX.Element;
	onChange: (value: string) => void;
	type: "text" | "file";
}


function FormItem(props: FormItemProps) {
	const cssClass = "shadow appearance-none border rounded w-full py-2 px-3 font-medium leading-tight focus:outline-none focus:shadow-outline "
		+ (props.type === "file" ? "text-white" : "text-black");
	return (
		<div class="mb-4">
			<label class="block text-sm font-bold mb-2" for="name">
				{props.label}
			</label>
			<input
				class={cssClass}
				id="name"
				type={props.type}
				required={props.required ?? false}
				placeholder={props.placeholder ?? props.label}
				{...(props.type === "text" && { value: props.value })}
				onInput={(e) => {
					if (props.type === "text")
						props.onChange(e.currentTarget.value);
					else if (props.type === "file")
						props.onChange(e.currentTarget.files?.[0]?.path ?? "")
				}}
			/>
			<Show when={typeof props.help === "string"}>
				<p class="italic">{props.help}</p>
			</Show>
			<Show when={typeof props.help === "object"}>
				{props.help}
			</Show>
		</div>
	);
}


interface ManageProfileFormProps {
	profile: Partial<Profile>;
}

function validateProfile(profile: Profile): Profile | null {
	const newProfile = { ...profile };
	if (!profile.name) return null;
	if (!profile.pathToModLoader) return null;
	if (!profile.originalAsarName) return null;
	if (!profile.description) newProfile.description = null;
	console.log(profile);
	if (!profile.customUserDirName) newProfile.customUserDirName = null;
	if (!profile.asarHookToggleQuery) newProfile.asarHookToggleQuery = profile.pathToModLoader;
	return newProfile;
}

function ManageProfileForm(props: ManageProfileFormProps) {
	const navigate = useNavigate();
	const [newProfile, setNewProfile] = createSignal<Profile>(null);
	const [error, setError] = createSignal<string | null>(null);


	function onSubmit(event: Event) {
		event.preventDefault();
		const validatedProfile = validateProfile(newProfile());
		if (!validatedProfile) {
			setError("Invalid profile");
			return;
		}
		setError(null);

		if (validatedProfile.id) {
			ModHook.updateProfile(validatedProfile)
				.then((_profile: Profile) => {
					console.log(_profile)
					navigate("/");
				})
				.catch((err: Error) => {
					setError(err.message);
				});
		} else {
			ModHook.addProfile(validatedProfile)
				.then((_profile: Profile) => {
					navigate("/");
				})
				.catch((err: Error) => {
					setError(err.message);
				});
		}
	}

	createEffect(() => {
		setNewProfile({ ...props.profile as Profile })
	}, [props.profile]);

	return (
		<Show when={newProfile()}>
			<form onSubmit={onSubmit}>
				<Show when={error()}>
					<p class="text-red-500">{error()}</p>
				</Show>
				<div class="grid grid-cols-2 gap-4">
					<FormItem
						label="Name"
						value={newProfile().name}
						help="The name of your mod, this can be anything."
						onChange={(value) => setNewProfile((prev) => ({ ...prev, name: value }))}
						type="text"
						required
					/>
					<FormItem
						label="Mod Entrypoint (.js)"
						help="The entrypoint of your mod, this is the file that will be loaded when the mod starts."
						onChange={(value) => setNewProfile((prev) => ({ ...prev, pathToModLoader: value }))}
						type="file"
					/>
					<FormItem
						label="Description"
						value={newProfile().description}
						help="A description of your mod, this can be anything."
						onChange={(value) => setNewProfile((prev) => ({ ...prev, description: value }))}
						type="text"
					/>
					<FormItem
						label="Custom User Directory Name"
						value={newProfile().customUserDirName}
						placeholder="Default directory"
						help="Leave blank to use the default discord user data directory."
						onChange={(value) => setNewProfile((prev) => ({ ...prev, customUserDirName: value }))}
						type="text"
					/>
					<FormItem
						label="Original ASAR Name"
						value={newProfile().originalAsarName}
						placeholder="The ASAR name that the mod expects to load"
						help="This is the ASAR file that the mod expects to load. Depending on the mod, could be _app.asar or app.orig.asar or something else"
						onChange={(value) => setNewProfile((prev) => ({ ...prev, originalAsarName: value }))}
						type="text"
						required
					/>
					<FormItem
						label="ASAR Hook Toggle Query"
						value={newProfile().asarHookToggleQuery}
						placeholder="The query that the mod uses to toggle the ASAR hook"
						help={
							<div>
								<div>
									If you don't know what this is, leave blank to use the default query (the path to your mod entrypoint).
									You should only need to set this if the defaults do not work.
								</div>
								<div>
									For example, if your mod entrypoint is <code class="select-all">C:\\users\\dummy\\Vencord\\dist\\patcher.js</code>.
									you could set this to <code class="select-all">Vencord\\dist</code>
								</div>
							</div>
						}
						onChange={(value) => setNewProfile((prev) => ({ ...prev, asarHookToggleQuery: value }))}
						type="text"
					/>
					<Show when={newProfile().id}>
						<button
							class="text-blue-200 hover:underline bg-red-700 hover:bg-red-800 rounded-lg p-4 my-4 inline-block cursor-pointer"
							onClick={(e) => {
								e.preventDefault();
								if (!confirm("Are you sure you want to delete this profile?")) return;
								ModHook.deleteProfile(newProfile().id)
									.then(() => {
										navigate("/");
									})
									.catch((err: Error) => {
										setError(err.message);
									});
							}}>
							Delete profile
						</button>
					</Show>
					<button
						type="submit"
						class="text-blue-300 hover:underline bg-gray-700 hover:bg-gray-800 rounded-lg p-4 my-4 inline-block cursor-pointer">
						Save Changes
					</button>
				</div>
			</form>
		</Show>
	)
}

export default ManageProfile;
