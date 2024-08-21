/**
 * This file is used to bring functionality to the login-prompt modal page
 */

import fs from 'fs';
import { ipcRenderer } from 'electron';

import { ElectronPromptOptions } from '../electron-prompt';
import { promptError, promptCancel } from '../helpers/prompt.helper';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

/**
 * Submits the data from the prompt input to the main process.
 */
function promptSubmit(promptOptions: ElectronPromptOptions) {
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

		if (password != null) {
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
 * Registers the prompt window and initializes it based on the retrieved options.
 */
function promptRegister() {
	// Extract the prompt ID from the URL hash
	promptId = document.location.hash.replace('#', '');

	let promptOptions: ElectronPromptOptions;

	try {
		// Retrieve prompt options from the main process
		promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + promptId));
	} catch (error) {
		return promptError((error as any), promptId);
	}

	// const label = document.querySelector('#label');

	// Set the label in the prompt window
	// if (label && promptOptions.label) {
	// 	if (promptOptions.useHtmlLabel) {
	// 		label.innerHTML = promptOptions.label;
	// 	} else {
	// 		label.textContent = promptOptions.label;
	// 	}
	// }

	// Set the OK button label if provided
	// if (promptOptions.buttonLabels && promptOptions.buttonLabels.ok) {
	// 	const okBtn = document.querySelector('#ok');

	// 	if (okBtn) {
	// 		okBtn.textContent = promptOptions.buttonLabels.ok;
	// 	}
	// }

	// Set the Cancel button label if provided
	// if (promptOptions.buttonLabels && promptOptions.buttonLabels.cancel) {
	// 	const cancelBtn = document.querySelector('#cancel');

	// 	if (cancelBtn) {
	// 		cancelBtn.textContent = promptOptions.buttonLabels.cancel;
	// 	}
	// }

	// Apply a custom stylesheet if provided
	try {
		if (promptOptions.customStylesheet) {
			const customStyleContent = fs.readFileSync(promptOptions.customStylesheet, 'utf-8');

			if (customStyleContent) {
				const customStyle = document.createElement('style');
				customStyle.setAttribute('rel', 'stylesheet');
				customStyle.append(document.createTextNode(customStyleContent));
				document.head.append(customStyle);
			}
		}
	} catch (error) {
		return promptError((error as any), promptId);
	}

	// Attach event listeners to the cancel button
	// const cancelBtn = document.querySelector('#cancel');
	// if (cancelBtn) {
	// 	cancelBtn.addEventListener('click', () => {
	// 		promptCancel(promptId);
	// 	});
	// }
	// Attach event listeners to the form
	const form = document.getElementById('login-form');
	if (form) {
		form.addEventListener('submit', () => {
      console.log("Attempting to send form info.");
			promptSubmit(promptOptions);
		});
	} else {
		return promptError(`Unable to find the login-form element!`, promptId);
	}

	// Create and append the appropriate input element based on the prompt type
	let dataElement;
	if (promptOptions.type === 'login') {
    // dataElement = promptSetupLogin(promptOptions);
  } else {
		return promptError(`Unhandled input type '${promptOptions.type}'`, promptId);
	}
	
	// const dataContainerElement = document.querySelector('#data-container') as HTMLDivElement | null;
	
	// if (dataContainerElement) {
	// 	dataElement = dataElement as HTMLInputElement | HTMLSelectElement; // TODO: Change

	// 	dataContainerElement.append(dataElement);
	// 	dataElement.className = 'block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500';
	// 	dataElement.setAttribute('id', 'data');

	// 	// Focus and select the input element if applicable
	// 	dataElement.focus();
	// }
}

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
document.addEventListener('DOMContentLoaded', promptRegister);
