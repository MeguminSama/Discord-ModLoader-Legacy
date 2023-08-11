import { hashIntegration, Route, Router, Routes } from "@solidjs/router";
import { Home } from "./Home";
import { ManageProfile } from "./ManageProfile";

export function App() {
	return (
		<div>
			<Header />
			<main class="container w-full mx-auto">
				<Router source={hashIntegration()}>
					<Routes>
						<Route path="/" component={Home} />
						<Route path="/manage" component={ManageProfile} />
						<Route path="/manage/:id" component={ManageProfile} />
					</Routes>
				</Router>
			</main>
		</div>
	);
}

function Header() {
	return (
		<header class="bg-gray-800 py-4 px-6 mb-5 select-none">
			<h1 class="text-2xl">Discord Modloader</h1>
		</header>
	);
}

export default App;
