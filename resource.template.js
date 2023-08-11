if (CUSTOM_USER_DIR_NAME) {
	const { app } = require("electron");
	const customAppDir = app.getPath("appData") + "\\DiscordModHook\\AppData\\" + CUSTOM_USER_DIR_NAME;
	const _setPath = app.setPath;

	app.setPath = function (name, path) {
		if (name === "userData") {
			_setPath.call(app, name, customAppDir);
		} else {
			_setPath.call(app, name, path);
		}
	};

	app.setPath("userData", customAppDir);
}

require(PATH_TO_CLIENT_MOD);
