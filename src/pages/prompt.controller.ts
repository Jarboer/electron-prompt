import fs from 'fs';
import { ipcRenderer } from 'electron';

import { ElectronPromptOptions } from '../electron-prompt';
import { promptCreateInput, promptCreateSelect, promptSubmit } from './prompt/prompt';
import { loginPromptSubmit } from './login-prompt/login-prompt';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

/**
 * Registers the prompt window and initializes it based on the retrieved options.
 */
function promptRegister() {
	// Extract the prompt ID from the URL hash
	let promptId: string | null = document.location.hash.replace('#', '');

	let promptOptions: ElectronPromptOptions;

	try {
		// Retrieve prompt options from the main process
		promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + promptId));
	} catch (error) {
		return promptError((error as any), promptId);
	}

	const title = document.getElementById("title") as HTMLHeadingElement | null;

	// Set the title in the prompt window
	if (title && promptOptions.title) {
		if (promptOptions.useHtmlLabel) {
			title.innerHTML = promptOptions.title;
		} else {
			title.textContent = promptOptions.title;
		}
	}

	const label = document.getElementById("label") as HTMLHeadingElement | null;

	// Set the label in the prompt window
	if (label && promptOptions.label) {
		if (promptOptions.useHtmlLabel) {
			label.innerHTML = promptOptions.label;
		} else {
			label.textContent = promptOptions.label;
		}
	}

	// Set the OK button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.ok) {
		const okBtn = document.getElementById('ok');

		if (okBtn) {
			okBtn.textContent = promptOptions.buttonLabels.ok;
		}
	}

	// Set the Cancel button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.cancel) {
		const cancelBtn = document.getElementById('cancel');

		if (cancelBtn) {
			cancelBtn.textContent = promptOptions.buttonLabels.cancel;
		}
	}

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
	const cancelBtn = document.getElementById('cancel');
	if (cancelBtn) {
		cancelBtn.addEventListener('click', () => {
			promptCancel(promptId);
		});
	}

	// Attach event listeners to the form
	const form = document.getElementById('form');
	if (form) {
		form.addEventListener('submit', () => {
			
			if (promptOptions.type === 'input' || promptOptions.type === 'select') {
				promptSubmit(promptOptions, promptId);
			} else if (promptOptions.type === 'login') {
				loginPromptSubmit(promptOptions, promptId);
			} 
		});
	} else {
		return promptError(`Unable to find the form element!`, promptId);
	}

	// Create and append the appropriate input element based on the prompt type
	let dataElement;
	if (promptOptions.type === 'input') {
		dataElement = promptCreateInput(promptOptions, promptId);
	} else if (promptOptions.type === 'select') {
		dataElement = promptCreateSelect(promptOptions);
	} else if (promptOptions.type === 'login') {
    	// dataElement = promptSetupLogin(promptOptions);
  	} else {
		return promptError(`Unhandled input type '${promptOptions.type}'`, promptId);
	}
	
	const dataContainerElement = document.querySelector('#data-container') as HTMLDivElement | null;
	
	if (dataContainerElement) {
		dataElement = dataElement as HTMLInputElement | HTMLSelectElement; // TODO: Change

		dataContainerElement.append(dataElement);
		dataElement.className = 'block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500';
		dataElement.setAttribute('id', 'data');

		// Focus and select the input element if applicable
		dataElement.focus();
		if (promptOptions.type === 'input') {
			
			(dataElement as HTMLInputElement).select();
		}
	}
}

/**
 * Sends an error message back to the main process.
 *
 * @param error - The error object or message to send.
 */
export function promptError(error: Error | string, promptId: string | null) {
	if (error instanceof Error) {
		error = error.message;
	}

	ipcRenderer.sendSync('prompt-error:' + promptId, error);
}

/**
 * Cancels the prompt and sends a null response back to the main process.
 */
export function promptCancel(promptId: string | null) {
	ipcRenderer.sendSync('prompt-post-data:' + promptId, null);
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