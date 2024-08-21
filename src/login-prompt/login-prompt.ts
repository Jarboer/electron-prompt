/**
 * This file is used to bring functionality to the login-prompt modal page
 */

import { ipcRenderer } from 'electron';

import { ElectronPromptOptions } from '../electron-prompt';
import { promptError, promptCancel, promptRegister } from '../helpers/prompt.helper';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

/**
 * Submits the data from the prompt input to the main process.
 */
export function loginPromptSubmit(promptOptions: ElectronPromptOptions) {
  let data: (string | null)[] | null = null;

  let usernameField = document.getElementById('username-field') as HTMLInputElement | null;
  let passwordField = document.getElementById('password-field') as HTMLInputElement | null;

	if (usernameField === null) {
		return promptError("Error: Unable to find the username-field element!", promptId);
	} else if (passwordField === null) {
		return promptError("Error: Unable to find the password-field element!", promptId);
	}

	if (promptOptions.type === 'login') {
		const username = usernameField.value;
		const password = passwordField.value

		if (data === null) {
			data = []
		}

		if (username !== "") {
			data.push(username);
		} else {
			// NOTE: This is kinda unneeded because the form contents must be filled out to be submitted. This would only occur if the user is modifying the site
			data.push(null); 
		}

		if (password !== "") {
			data.push(password);
		} else {
			data.push(null);
		}
	}

	ipcRenderer.sendSync('prompt-post-data:' + promptId, data);
}

// TODO: Change
/**
 * Creates an input element based on the prompt options.
 *
 * @returns {HTMLInputElement} The created input element.
 */
// function promptSetupLogin(promptOptions: ElectronPromptOptions) {
// 	const dataElement = document.getElementById('username-field');

// 	// Set input's value if provided, otherwise, set it to a blank string
// 	dataElement.value = promptOptions.value ?? '';

// 	// Set input's placeholder if provided, otherwise, set it to a blank string
// 	dataElement.placeholder = promptOptions.placeholder ?? '';

// 	// Apply additional input attributes if provided
// 	if (promptOptions.inputAttrs && typeof promptOptions.inputAttrs === 'object') {
// 		for (const k in promptOptions.inputAttrs) {
// 			if (Object.prototype.hasOwnProperty.call(promptOptions.inputAttrs, k)) {
// 				const value = promptOptions.inputAttrs[k as keyof typeof promptOptions.inputAttrs];

// 				if (value !== undefined && value !== null) {
// 					dataElement.setAttribute(k, String(value));
// 				}
// 			}
// 		}
// 	}

// 	// Add event listeners for cancel and submit actions
// 	dataElement.addEventListener('keyup', event => {
// 		if (event.key === 'Escape') {
// 			promptCancel(promptId);
// 		}
// 	});

// 	// dataElement.addEventListener('keypress', event => {
// 	// 	if (event.key === 'Enter') {
// 	// 		event.preventDefault();

// 	// 		let saveBtn = document.getElementById('save-btn') as HTMLButtonElement | null;
// 	// 		saveBtn?.click();
// 	// 	}
// 	// });

// 	return dataElement;
// }

/**
 * Global error handler for the prompt window, reports errors back to the main process.
 */
window.addEventListener('error', error => {
	if (promptId) {
		promptError('An error has occurred on the prompt window: \n' + error.message, promptId);
	}
});

/**
 * Registers the prompt when the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
	promptId = promptRegister();
});
