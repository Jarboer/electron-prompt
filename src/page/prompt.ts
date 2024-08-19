import fs from 'fs';
import ipcRenderer from 'electron';

import { ElectronPromptOptions } from '../electron-prompt';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

/**
 * The options for configuring the prompt, retrieved from the main process.
 */
let promptOptions: ElectronPromptOptions | null = null;

/**
 * Sends an error message back to the main process.
 *
 * @param error - The error object or message to send.
 */
function promptError(error: Error | string) {
	if (error instanceof Error) {
		error = error.message;
	}

	ipcRenderer.sendSync('prompt-error:' + promptId, error);
}

/**
 * Cancels the prompt and sends a null response back to the main process.
 */
function promptCancel() {
	ipcRenderer.sendSync('prompt-post-data:' + promptId, null);
}

/**
 * Submits the data from the prompt input to the main process.
 */
function promptSubmit() {
	const dataElement = document.querySelector('#data') as HTMLElement | null;
	let data: string | (string | null)[] | null = null; // TODO: Simplify

	if (dataElement === null) {
		return promptError("Error: Unable to find the #data element!");
	} else if (promptOptions === null) {
		return promptError("Error: promptOptions is null!");
	} else if (promptOptions.type === undefined) {
		return promptError("Error: promptOptions.type is undefined!");
	}

	if (promptOptions.type === 'input') {
		const InputElement = dataElement as HTMLInputElement;

		// Handle file input or text input
		if (InputElement.files != undefined || InputElement.files != null) {
			data = InputElement.files[0].path;
		} else {
			data = InputElement.value;
		}
	} else if (promptOptions.type === 'select') {
		const selectElement = dataElement as HTMLSelectElement;

		// Handle single or multiple select
		if (promptOptions.selectMultiple) {
			data = Array.from(selectElement.querySelectorAll('option[selected]')).map(el => el.getAttribute('value'));
		} else {
			data = selectElement.value;
		}
	}

	ipcRenderer.sendSync('prompt-post-data:' + promptId, data);
}

/**
 * Creates an input element based on the prompt options.
 *
 * @returns {HTMLInputElement} The created input element.
 */
function promptCreateInput() {
	const dataElement = document.createElement('input');
	dataElement.setAttribute('type', 'text');

	if (promptOptions === null) {
		return promptError("Error: promptOptions is null!");
	}

	// Set input's value if provided, otherwise, set it to a blank string
	dataElement.value = promptOptions.value ?? '';


	// Set input's placeholder if provided, otherwise, set it to a blank string
	dataElement.placeholder = promptOptions.placeholder ?? '';

	// Apply additional input attributes if provided
	if (promptOptions.inputAttrs && typeof promptOptions.inputAttrs === 'object') {
		for (const k in promptOptions.inputAttrs) {
			if (Object.prototype.hasOwnProperty.call(promptOptions.inputAttrs, k)) {
				const value = promptOptions.inputAttrs[k as keyof typeof promptOptions.inputAttrs];

				if (value !== undefined && value !== null) {
					dataElement.setAttribute(k, String(value));
				}
			}
		}
	}

	// Add event listeners for cancel and submit actions
	dataElement.addEventListener('keyup', event => {
		if (event.key === 'Escape') {
			promptCancel();
		}
	});

	dataElement.addEventListener('keypress', event => {
		if (event.key === 'Enter') {
			event.preventDefault();

			let okBtn = document.querySelector('#ok') as HTMLButtonElement | null;
			okBtn?.click();
		}
	});

	return dataElement;
}

/**
 * Creates a select element based on the prompt options.
 *
 * @returns {HTMLSelectElement} The created select element.
 */
function promptCreateSelect() {
	const dataElement = document.createElement('select');

	if (promptOptions === null) {
		return promptError("Error: promptOptions is null!");
	}

	// Populate the select element with options
	for (const [key, text] of Object.entries(promptOptions.selectOptions ?? {})) {
		const optionElement = document.createElement('option');
		optionElement.value = key;
		optionElement.textContent = text;
	
		if (key === promptOptions.value) {
			optionElement.selected = true;
		}
	
		dataElement.append(optionElement);
	}

	if (promptOptions.selectOptions == undefined) {
		console.warn("Warning: selectOptions is undefined. The select element will be empty.");
	}

	return dataElement;
}

/**
 * Registers the prompt window and initializes it based on the retrieved options.
 */
function promptRegister() {
	// Extract the prompt ID from the URL hash
	promptId = document.location.hash.replace('#', '');

	try {
		// Retrieve prompt options from the main process
		promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:' + promptId));
	} catch (error) {
		return promptError(error);
	}

	if (promptOptions === null) {
		return promptError("Error: promptOptions is null!");
	}

	const label = document.querySelector('#label');

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
		const okBtn = document.querySelector('#ok');

		if (okBtn) {
			okBtn.textContent = promptOptions.buttonLabels.ok;
		}
	}

	// Set the Cancel button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.cancel) {
		const cancelBtn = document.querySelector('#cancel');

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
		return promptError(error);
	}

	// Attach event listeners to the cancel button
	const cancelBtn = document.querySelector('#cancel');
	if (cancelBtn) {
		cancelBtn.addEventListener('click', promptCancel);
	}
	// Attach event listeners to the form button
	const formBtn = document.querySelector('#form');
	if (formBtn) {
		formBtn.addEventListener('submit', promptSubmit);
	}

	
	// Create and append the appropriate input element based on the prompt type
	let dataElement;
	if (promptOptions.type === 'input') {
		dataElement = promptCreateInput();
	} else if (promptOptions.type === 'select') {
		dataElement = promptCreateSelect();
	} else {
		return promptError(`Unhandled input type '${promptOptions.type}'`);
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
 * Global error handler for the prompt window, reports errors back to the main process.
 */
window.addEventListener('error', error => {
	if (promptId) {
		promptError('An error has occurred on the prompt window: \n' + error.message);
	}
});

/**
 * Registers the prompt when the DOM content is fully loaded.
 */
document.addEventListener('DOMContentLoaded', promptRegister);
