const path = require('path');
const electron = require('electron');

/**
 * The default width of the prompt window.
 * @constant {number}
 */
const DEFAULT_WIDTH = 370;

/**
 * The default height of the prompt window.
 * @constant {number}
 */
const DEFAULT_HEIGHT = 162;

/**
 * Retrieves an export from the Electron main process, either directly or via `@electron/remote` for use in the renderer process.
 *
 * @param {string} id - The identifier of the Electron export to retrieve.
 * @returns {*} The requested Electron export.
 * @throws {Error} If the requested export is not available or if `@electron/remote` is not set up correctly.
 */
function getElectronMainExport(id) {
	if (electron[id]) {
		return electron[id];
	}

	let remote = electron.remote;
	if (!remote) {
		try {
			remote = require('@electron/remote');
		} catch (originalError) {
			const error = new Error(
				'Install and set-up package `@electron/remote` to use this module from a renderer process.\n'
				+ 'It is preferable to set up message exchanges for this using `ipcMain.handle()` and `ipcRenderer.invoke()`,\n'
				+ 'avoiding remote IPC overhead costs, and one more package dependency.\n\n'
				+ 'Original error message:\n\n'
				+ originalError.message,
			);

			error.originalError = originalError;
			throw error;
		}
	}

	if (remote && remote[id]) {
		return remote[id];
	}

	throw new Error('Unknown electron export: ' + String(id));
}

/**
 * Reference to Electron's `BrowserWindow` class, which can create and control browser windows.
 * @constant {BrowserWindow}
 */
const BrowserWindow = getElectronMainExport('BrowserWindow');

/**
 * Reference to Electron's `ipcMain` module, which handles inter-process communication (IPC) from the main process.
 * @constant {ipcMain}
 */
const ipcMain = getElectronMainExport('ipcMain');

/**
 * Displays a prompt window with various customization options.
 *
 * @param {Object} options - Configuration options for the prompt window.
 * @param {Electron.BrowserWindow} [parentWindow] - The parent window to which the prompt window will be modal.
 * @returns {Promise<string|null>} Resolves with the value entered by the user or null if the window is closed.
 */
function electronPrompt(options, parentWindow) {
	return new Promise((resolve, reject) => {
		const id = `${Date.now()}-${Math.random()}`;

		// Merge user-provided options with defaults
		const options_ = Object.assign(
			{
				width: DEFAULT_WIDTH,
				height: DEFAULT_HEIGHT,
				minWidth: DEFAULT_WIDTH,
				minHeight: DEFAULT_HEIGHT,
				resizable: false,
				title: 'Prompt',
				label: 'Please input a value:',
				buttonLabels: null,
				alwaysOnTop: false,
				value: null,
				type: 'input',
				selectOptions: null,
				icon: null,
				useHtmlLabel: false,
				customStylesheet: null,
				menuBarVisible: false,
				skipTaskbar: true,
				showWhenReady: false,
			},
			options || {},
		);

		// Validate select options if the prompt type is 'select'
		if (options_.type === 'select' && (options_.selectOptions === null || typeof options_.selectOptions !== 'object')) {
			reject(new Error('"selectOptions" must be an object'));
			return;
		}

		/** @type {Electron.BrowserWindow|null} */
		let promptWindow = new BrowserWindow({
			width: options_.width,
			height: options_.height,
			minWidth: options_.minWidth,
			minHeight: options_.minHeight,
			resizable: true, // options_.resizable, // TODO: Switch back later
			minimizable: false,
			fullscreenable: false,
			maximizable: false,
			show: !options_.showWhenReady,
			parent: parentWindow,
			skipTaskbar: options_.skipTaskbar,
			alwaysOnTop: options_.alwaysOnTop,
			useContentSize: options_.resizable,
			modal: Boolean(parentWindow),
			title: options_.title,
			icon: options_.icon || undefined,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				devTools: true, // TODO: Remove later
			},
		});

		// TODO: Re-enable later
		// promptWindow.setMenu(null);
		// promptWindow.setMenuBarVisibility(options_.menuBarVisible);

		/**
		 * Sends the prompt options to the renderer process when requested.
		 * @param {Electron.IpcMainEvent} event - The IPC event.
		 */
		const getOptionsListener = event => {
			event.returnValue = JSON.stringify(options_);
		};

		/**
		 * Cleans up listeners and closes the prompt window.
		 */
		const cleanup = () => {
			ipcMain.removeListener('prompt-get-options:' + id, getOptionsListener);
			ipcMain.removeListener('prompt-post-data:' + id, postDataListener);
			ipcMain.removeListener('prompt-error:' + id, errorListener);

			if (promptWindow) {
				promptWindow.close();
				promptWindow = null;
			}
		};

		/**
		 * Handles the data sent from the prompt and resolves the promise with the entered value.
		 * @param {Electron.IpcMainEvent} event - The IPC event.
		 * @param {string} value - The value entered by the user.
		 */
		const postDataListener = (event, value) => {
			resolve(value);
			event.returnValue = null;
			cleanup();
		};

		/**
		 * Rejects the promise if the prompt window becomes unresponsive.
		 */
		const unresponsiveListener = () => {
			reject(new Error('Window was unresponsive'));
			cleanup();
		};

		/**
		 * Handles errors from the prompt window and rejects the promise with the error message.
		 * @param {Electron.IpcMainEvent} event - The IPC event.
		 * @param {string} message - The error message.
		 */
		const errorListener = (event, message) => {
			reject(new Error(message));
			event.returnValue = null;
			cleanup();
		};

		// Attach IPC listeners for handling prompt window actions
		ipcMain.on('prompt-get-options:' + id, getOptionsListener);
		ipcMain.on('prompt-post-data:' + id, postDataListener);
		ipcMain.on('prompt-error:' + id, errorListener);
		promptWindow.on('unresponsive', unresponsiveListener);

		// Handle the prompt window closing event
		promptWindow.on('closed', () => {
			promptWindow = null;
			cleanup();
			resolve(null);
		});

		// Show the prompt window when ready if the option is set
		if (options_.showWhenReady) {
			promptWindow.once('ready-to-show', () => {
				promptWindow.show();
			});
		}

		const devPath = "C:\\Users\\jboersen\\Developer\\Node.js\\electron-prompt\\lib\\page\\prompt.html";

		// Load the HTML file for the prompt window
		promptWindow.loadFile(
			devPath, // TODO: Change back later
			// path.join(__dirname, 'page', 'prompt.html'),
			{hash: id},
		);
	});
}

module.exports = electronPrompt;
