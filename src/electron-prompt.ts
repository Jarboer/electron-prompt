import path from 'path';
import electron, { BrowserWindow, IpcMainEvent } from 'electron';

// import { ElectronPromptOptions } from './electron-prompt-type';

/**
 * The default width of the prompt window.
 * @constant {number}
 */
const DEFAULT_WIDTH = 390;

/**
 * The default height of the prompt window.
 * @constant {number}
 */
const DEFAULT_HEIGHT = 180;

/**
 * Used to define an input element's type
 */
// prettier-ignore
export type InputElement = 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' |
    'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week';

interface ButtonLabels  {
	ok?: string;
	cancel?: string;
}

/**
 * Used to define the prompt's information object
 */
export interface ElectronPromptOptions {
	/**
	 * The title of the prompt window. Defaults to 'Prompt'.
	 */
	title?: string;
	/**
	 * The label which appears on the prompt for the input field. Defaults to 'Please input a value:'.
	 */
	label?: string;
	/**
	 * The placeholder which appears on the prompt for the input field. Defaults to blank.
	 */
	placeholder?: string;
	/**
	 * The text for the OK/cancel buttons. Properties are 'ok' and 'cancel'. Defaults to null.
	 */
	buttonLabels?: ButtonLabels | null;
	/**
	 * The default value for the input field. Defaults to null.
	 */
	value?: string;
	/**
	 *  The type of input field, either 'input' for a standard text input field or 'select' for a dropdown type input. Defaults to 'input'.
	 */
	type?: "input" | "select";
	/**
	 * The attributes of the input field, analogous to the HTML attributes: `{type: 'text', required: true}` -> `<input type="text" required>`.
	 * Used if the type is 'input'
	 */
	inputAttrs?: {
		type: InputElement;
		required: boolean;
	};
	/**
	 * The items for the select dropdown if using the 'select' type in the format 'value': 'display text', where the value is what will be given
	 * to the then block and the display text is what the user will see.
	 */
	selectOptions?: object;
	// TODO: Comment on
	selectMultiple?: boolean;
	/**
	 * Whether the label should be interpreted as HTML or not. Defaults to false.
	 */
	useHtmlLabel?: boolean;
	/**
	 * The width of the prompt window. Defaults to 370.
	 */
	width?: number;
	/**
	 * The minimum allowed width for the prompt window. Same default value as width.
	 */
	minWidth?: number;
	/**
	 * The height of the prompt window. Defaults to 130.
	 */
	height?: number;
	/**
	 * The minimum allowed height for the prompt window. Same default value as height.
	 */
	minHeight?: number;
	/**
	 * Whether the prompt window can be resized or not (also sets useContentSize). Defaults to false.
	 */
	resizable?: boolean;
	/**
	 * Whether the minimize button shows on the title bar. You'll want to disable
	 * skipTaskbar so it can't disappear completely. Defaults to false.
	 */
	minimizable?: boolean;
	/**
	 * Whether the prompt can be made fullscreen. Defaults to false.
	 */
	fullscreenable?: boolean;
	/**
	 * Whether the maximize button shows on the title bar. Defaults to false.
	 */
	maximizable?: boolean;
	/**
	 * Whether the window should always stay on top of other windows. Defaults to false
	 */
	alwaysOnTop?: boolean;
	/**
	 * The path to an icon image to use in the title bar. Defaults to null and uses electron's icon.
	 */
	icon?: string;
	/**
	 * The local path of a CSS file to stylize the prompt window. Defaults to null.
	 */
	customStylesheet?: string;
	/**
	 * Whether to show the menubar or not. Defaults to false.
	 */
	menuBarVisible?: boolean;
	/**
	 * Whether to show the prompt window icon in taskbar. Defaults to true.
	 */
	skipTaskbar?: boolean;
	/**
	 * Whether to only show the prompt window once content is loaded. Defaults to false.
	 */
	showWhenReady?: boolean;
	/**
	 * Whether to enable dev tools for the prompt window (also shows the menu bar).
	 * You will want to enable resizing. Defaults to false.
	 */
	devMode?: boolean;
}

/**
 * Retrieves an export from the Electron main process, either directly or via `@electron/remote` for use in the renderer process.
 *
 * @param id - The identifier of the Electron export to retrieve.
 * @returns The requested Electron export.
 * @throws If the requested export is not available or if `@electron/remote` is not set up correctly.
 */
function getElectronMainExport(id: keyof typeof electron): any {
	if (electron[id]) {
		return electron[id];
	}

	let remote = (electron as any).remote; // TODO: Fix using defined typing
	if (!remote) {
		try {
			remote = require('@electron/remote');
		} catch (originalError) {
			const error = new Error(
				'Install and set-up package `@electron/remote` to use this module from a renderer process.\n' +
					'It is preferable to set up message exchanges for this using `ipcMain.handle()` and `ipcRenderer.invoke()`,\n' +
					'avoiding remote IPC overhead costs, and one more package dependency.\n\n' +
					'Original error message:\n\n' +
					(originalError as Error).message, // TODO: Change when the above is fixed
			);

			(error as any).originalError = originalError;
			throw error;
		}
	}

	if (remote && id in remote) {
		return remote[id as keyof typeof remote];
	}

	throw new Error('Unknown electron export: ' + String(id));
}

/**
 * Reference to Electron's `BrowserWindow` class, which can create and control browser windows.
 * @constant {BrowserWindow}
 */
const BrowserWindowRef = getElectronMainExport('BrowserWindow');

/**
 * Reference to Electron's `ipcMain` module, which handles inter-process communication (IPC) from the main process.
 * @constant {ipcMain}
 */
const ipcMainRef = getElectronMainExport('ipcMain');

/**
 * Displays a prompt window with various customization options.
 *
 * @param options - Configuration options for the prompt window.
 * @param parentWindow - The parent window to which the prompt window will be modal.
 * @returns Resolves with the value entered by the user or null if the window is closed.
 */
export function electronPrompt(options: ElectronPromptOptions, parentWindow?: BrowserWindow): Promise<string|null> {
	return new Promise((resolve, reject) => {
		const id = `${Date.now()}-${Math.random()}`;

		// BrowserWindowConstructorOptions is the type for the BrowserWindow options

		// Merge user-provided options with defaults
		const options_ = Object.assign(
			{
				width: DEFAULT_WIDTH,
				height: DEFAULT_HEIGHT,
				minWidth: DEFAULT_WIDTH,
				minHeight: DEFAULT_HEIGHT,
				resizable: false,
				minimizable: false,
				fullscreenable: false,
				maximizable: true,
				title: 'Prompt',
				label: 'Please input a value:',
				placeholder: '',
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
				devMode: false
			},
			options || {},
		) as ElectronPromptOptions;

		// Validate select options if the prompt type is 'select'
		if (options_.type === 'select' && (options_.selectOptions === null || typeof options_.selectOptions !== 'object')) {
			reject(new Error('"selectOptions" must be an object'));
			return;
		}

		let promptWindow = new BrowserWindowRef({
			width: options_.width,
			height: options_.height,
			minWidth: options_.minWidth,
			minHeight: options_.minHeight,
			resizable: options_.resizable,
			minimizable: options_.minimizable,
			fullscreenable: options_.fullscreenable,
			maximizable: options_.maximizable,
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
				devTools: options_.devMode,
			},
		});

		if (!options_.devMode) {
			promptWindow.setMenu(null);
			promptWindow.setMenuBarVisibility(options_.menuBarVisible);
		}

		/**
		 * Sends the prompt options to the renderer process when requested.
		 * @param event - The IPC event.
		 */
		const getOptionsListener = (event: IpcMainEvent) => {
			event.returnValue = JSON.stringify(options_);
		};

		/**
		 * Cleans up listeners and closes the prompt window.
		 */
		const cleanup = () => {
			ipcMainRef.removeListener('prompt-get-options:' + id, getOptionsListener);
			ipcMainRef.removeListener('prompt-post-data:' + id, postDataListener);
			ipcMainRef.removeListener('prompt-error:' + id, errorListener);

			if (promptWindow) {
				promptWindow.close();
				promptWindow = null;
			}
		};

		/**
		 * Handles the data sent from the prompt and resolves the promise with the entered value.
		 * @param event - The IPC event.
		 * @param value - The value entered by the user.
		 */
		const postDataListener = (event: IpcMainEvent, value: string) => {
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
		 * @param event - The IPC event.
		 * @param message - The error message.
		 */
		const errorListener = (event: IpcMainEvent, message: string) => {
			reject(new Error(message));
			event.returnValue = null;
			cleanup();
		};

		// Attach IPC listeners for handling prompt window actions
		ipcMainRef.on('prompt-get-options:' + id, getOptionsListener);
		ipcMainRef.on('prompt-post-data:' + id, postDataListener);
		ipcMainRef.on('prompt-error:' + id, errorListener);
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

		const devPath = "C:\\Users\\jboersen\\Developer\\Node.js\\electron-prompt\\lib\\prompt\\prompt.html";

		// Load the HTML file for the prompt window
		promptWindow.loadFile(
			devPath, // TODO: Change back later
			// path.join(__dirname, 'prompt', 'prompt.html'),
			{hash: id},
		);
	});
}

/**
 * This method is used as a wrapper to create a better prompt
 *
 * @param promptInfo The PromptInfo object to define how the prompt will look
 * @param window The window to display the prompt on
 * @returns The result of the prompt after the user interacts with it
 */
export async function betterPrompt(promptInfo: ElectronPromptOptions, window?: BrowserWindow): Promise<string | null> {
	// Used to store the result from the user
	let result: string | null = null;

	// Prompt for the user's password
	await electronPrompt(promptInfo, window)
		.then((r: any) => {
			// If the result is null then the user canceled
			if (r === null) {
				// Used to store the message about the prompt that was canceled
				let msg = `The user canceled the ${promptInfo.type ?? 'input'} prompt`;

				if (promptInfo.title !== undefined && promptInfo.label !== undefined) {
					msg += ` with the title "${promptInfo.title}" and the label "${promptInfo.label}"`;
				} else if (promptInfo.title !== undefined) {
					msg += ` with the title "${promptInfo.title}"`;
				} else if (promptInfo.label !== undefined) {
					msg += ` with the label "${promptInfo.label}"`;
				}

				// Display the message
				console.log(`${msg}.`)
			}

			// Set the result from the user
			result = r;
		})
		.catch(console.error); // Show the error if one occurred

	return result;
}
