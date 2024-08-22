import path from 'path';
import electron, { BrowserWindow, BrowserWindowConstructorOptions, IpcMainEvent } from 'electron';

// import { ElectronPromptOptions } from './electron-prompt-type';

/**
 * The default height of the prompt window.
*/
const DEFAULT_HEIGHT = 200;
/**
 * The default width of the prompt window.
 */
const DEFAULT_WIDTH = 390;

/**
 * The default height of the login prompt window.
 */
const DEFAULT_LOGIN_HEIGHT = 540;
/**
 * The default width of the login prompt window.
 */
const DEFAULT_LOGIN_WIDTH = 600;

/**
 * Used to define an input element's type
 */
// prettier-ignore
export type InputElement = 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' |
    'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week';

/**
 * Used to define a string dictionary where the key and value are strings.
 */
export type StringDictionary = {
	[key: string]: string;
}

export interface LabelData {
	/**
	 * The label which appears on the prompt for the input field. Defaults to nothing/undefined.
	 */
	content?: string;
	/**
	 * Defines which html element the label is for. Defaults to nothing/undefined.
	 */
	htmlFor?: string;
	/**
	 * Whether the label should be interpreted as HTML or not. Defaults to false.
	 */
	useHtmlLabel?: boolean;
}

// TODO: Allow undefined?
interface InputAttrs {
	/**
	 * Define the input element's type.
	 */
	type: InputElement;
	/**
	 * Define if the input element is required to be completed in a form.
	 */
	required: boolean;
}

export interface InputData {
	/**
	 * The id for the input element which appears on the prompt for the input field. The name will 
	 * also be set to this (for labels). Defaults to nothing/undefined.
	 */
	id?: string;
	/**
	 * The placeholder which appears on the prompt for the input field. Defaults to being blank/undefined.
	 */
	placeholder?: string;
	/**
	 * The default value for the input field. Defaults to being blank/undefined.
	 */
	value?: string;
	/**
	 * The attributes of the input field, analogous to the HTML attributes: `{type: 'text', required: true}` -> `<input type="text" required>`.
	 * Used if the `type` is 'input'.
	 */
	inputAttrs?: InputAttrs;
}

interface ButtonLabels  {
	/**
	 * Define the display text for the submit button.
	 */
	submit?: string;
	/**
	 * Define the display text for the cancel button.
	 */
	cancel?: string;
}

/**
 * Used to define the prompt's information object
 */
export interface ElectronPromptOptions {
	/**
	 * The title of the prompt window. Defaults to 'Prompt', or to 'Sign into your Account' for the 'login' `type`.
	 */
	title?: string;
	/**
	 * Whether the `title` should be interpreted as HTML or not. Defaults to false.
	 */
	useHtmlTitle?: boolean;
	/**
	 * The subtitle of the prompt window. Defaults to 'Please input a value', or to 'Enter your account credentials' for the 'login' `type`.
	 */
	subtitle?: string;
	/**
	 * Whether the `subtitle` should be interpreted as HTML or not. Defaults to false.
	 */
	useHtmlSubtitle?: boolean;
	/**
	 * The type of input field/prompt, enter 'input' for a standard text input field, 
	 * 'select' for a dropdown type input, or 'login' for a prompt with 2 input fields 
	 * setup to take a username/email and password. Defaults to 'input'.
	 */
	type?: 'input' | 'select' | 'login';
	/**
	 * The options for the label(s). Defaults to nothing/undefined for the 'input' `type`, or stuff relating to username, and password for 'login'.
	 */
	labelOptions?: LabelData[];
	/**
	 * The options for the text input(s). Defaults to text and required for the 'input' `type`, or text and password for a username and password respectively for 'login'.
	 */
	inputTextOptions?: InputData[];
	/**
	 * The text for the submit/cancel buttons. Defaults to 'Ok' and 'Cancel', or to 
	 * 'Sign in' for the 'login' `type` (note: the cancel button isn't shown for 'login').
	 */
	buttonLabels?: ButtonLabels;
	/**
	 * The items for the select dropdown if using the 'select' `type` in the format '`<value>`': '`<display text>`',
	 * where the `<value>` is what will be given to the then block and the `<display text>` is what the user will see. Defaults to nothing/undefined.
	*/
	selectOptions?: StringDictionary;
	/**
	 * The default option to select when using the 'select' `type`. Defaults to nothing/undefined.
	 */
	defaultSelectOption?: string;
	/**
	 * Allows multiple options to be selected when using the 'select' `type`. Defaults to nothing/undefined.
	 */
	selectMultiple?: boolean;
	/**
	 * The height of the prompt window. Defaults to 180, or to 540 for the 'login' `type`.
	*/
	height?: number;
	/**
	 * The minimum allowed height for the prompt window. Same default value as height.
	*/
	minHeight?: number;
	/**
	 * The width of the prompt window. Defaults to 390, or to 600 for the 'login' `type`.
	 */
	width?: number;
	/**
	 * The minimum allowed width for the prompt window. Same default value as width.
	 */
	minWidth?: number;
	/**
	 * Whether the prompt window can be resized or not (also sets `useContentSize`). Defaults to false.
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
	 * Whether the window should always stay on top of other windows. Defaults to false.
	 */
	alwaysOnTop?: boolean;
	/**
	 * The path to an icon image to use in the title bar. Defaults to undefined and uses electron's icon.
	 */
	icon?: string;
	/**
	 * The local path of a CSS file to stylize the prompt window. Defaults to undefined.
	 */
	customStylesheet?: string;
	/**
	 * Whether to show the menubar or not. Defaults to false.
	 */
	menuBarVisible?: boolean;
	/**
	 * Whether to not show the prompt window icon on taskbar. Defaults to true.
	 */
	skipTaskbar?: boolean;
	/**
	 * Whether to only show the prompt window once content is loaded. Defaults to false.
	 */
	showWhenReady?: boolean;
	/**
	 * Whether to enable dev tools for the prompt window (also shows the menu bar).
	 * You'll probably want to enable resizing. Defaults to false.
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
export function electronPrompt(options: ElectronPromptOptions, parentWindow?: BrowserWindow): Promise<string | (string | null)[] | null> {
	return new Promise((resolve, reject) => {
		const id = `${Date.now()}-${Math.random()}`;

		// NOTE: BrowserWindowConstructorOptions is the type for the BrowserWindow options

		let defaultValues: ElectronPromptOptions;

		if (options.type === "login") {
			defaultValues = {
				title: 'Sign into your Account',
				useHtmlTitle: false,
				subtitle: 'Enter your account credentials',
				useHtmlSubtitle: false,
				labelOptions: [
					{
						content: "Username",
						htmlFor: "username-field",
						useHtmlLabel: false
					},
					{
						content: "Password",
						htmlFor: "username-field",
						useHtmlLabel: false
					}
				],
				inputTextOptions: [
					{
						id: "username-field",
						placeholder: "username",
						inputAttrs: {
							type: "text",
							required: true
						}
					},
					{
						id: "password-field",
						placeholder: "••••••••",
						inputAttrs: {
							type: "password",
							required: true
						}
					}
				],
				height: DEFAULT_LOGIN_HEIGHT,
				width: DEFAULT_LOGIN_WIDTH,
				minHeight: DEFAULT_LOGIN_HEIGHT,
				minWidth: DEFAULT_LOGIN_WIDTH,
				resizable: false,
				minimizable: false,
				fullscreenable: false,
				maximizable: false,
				alwaysOnTop: false,
				menuBarVisible: false,
				skipTaskbar: true,
				showWhenReady: false,
				devMode: false
			}
		} else {
			defaultValues = {
				title: 'Prompt',
				useHtmlTitle: false,
				subtitle: 'Please input a value',
				useHtmlSubtitle: false,
				type: 'input',
				inputTextOptions: [
					{
						inputAttrs: {
							type: "text",
							required: true
						}
					}
				],
				height: DEFAULT_HEIGHT,
				width: DEFAULT_WIDTH,
				minHeight: DEFAULT_HEIGHT,
				minWidth: DEFAULT_WIDTH,
				resizable: false,
				minimizable: false,
				fullscreenable: false,
				maximizable: false,
				alwaysOnTop: false,
				menuBarVisible: false,
				skipTaskbar: true,
				showWhenReady: false,
				devMode: false
			}
		}

		// Merge user-provided options with defaults
		let options_: ElectronPromptOptions = Object.assign(defaultValues, options || {});

		// TODO: Add type check for inputTextOptions

		// Validate select options if the prompt type is 'select'
		if (options_.type === 'select' && (options_.selectOptions === null || typeof options_.selectOptions !== 'object')) {
			reject(new Error('"selectOptions" must be an object'));
			return;
		}

		let promptWindow = new BrowserWindowRef({
			height: options_.height,
			width: options_.width,
			minHeight: options_.minHeight,
			minWidth: options_.minWidth,
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
		} as BrowserWindowConstructorOptions) as BrowserWindow | null;

		if (!options_.devMode) {
			promptWindow!.setMenu(null);
			promptWindow!.setMenuBarVisibility(options_.menuBarVisible!);
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
		const postDataListener = (event: IpcMainEvent, value: string | (string | null)[] | null) => {
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
		promptWindow!.on('unresponsive', unresponsiveListener);

		// Handle the prompt window closing event
		promptWindow!.on('closed', () => {
			promptWindow = null;
			cleanup();
			resolve(null);
		});

		// Show the prompt window when ready if the option is set
		if (options_.showWhenReady) {
			promptWindow!.once('ready-to-show', () => {
				promptWindow!.show();
			});
		}

		let pagePath: string;

		if (options_.type === "login") {
			// path = "C:/Users/jboersen/Developer/Node.js/electron-prompt/lib/pages/login-prompt/login-prompt.html";
			pagePath = "pages/login-prompt/login-prompt.html";
		} else {
			// path = "C:/Users/jboersen/Developer/Node.js/electron-prompt/lib/pages/prompt/prompt.html";
			pagePath = "pages/prompt/prompt.html";
		}

		// Load the HTML file for the prompt window
		promptWindow!.loadFile(
			path.join(__dirname, pagePath), // pagePath,
			{hash: id},
		);
	});
}

/**
 * This method is used as a wrapper to create a better prompt
 *
 * @param promptOptions The PromptInfo object to define how the prompt will look
 * @param window The window to display the prompt on
 * @returns The result of the prompt after the user interacts with it
 */
export async function betterPrompt(promptOptions: ElectronPromptOptions, window?: BrowserWindow): Promise<string | (string | null)[] | null> {
	// Used to store the result from the user
	let result: string | (string | null)[] | null = null;

	// Prompt for the user's password
	await electronPrompt(promptOptions, window)
		.then((r: any) => {
			// If the result is null then the user canceled
			if (r === null) {
				// Used to store the message about the prompt that was canceled
				let msg = `The user canceled the ${promptOptions.type ?? 'input'} prompt`;

				if (promptOptions.title !== undefined && promptOptions.subtitle !== undefined) {
					msg += ` with the title "${promptOptions.title}" and the subtitle "${promptOptions.subtitle}"`;
				} else if (promptOptions.title !== undefined) {
					msg += ` with the title "${promptOptions.title}"`;
				} else if (promptOptions.subtitle !== undefined) {
					msg += ` with the subtitle "${promptOptions.subtitle}"`;
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
