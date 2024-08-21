import { ipcRenderer } from 'electron';

import { ElectronPromptOptions } from '../../electron-prompt';
import { promptError, promptCancel } from '../prompt.controller';

/**
 * Submits the data from the prompt input to the main process.
 */
export function promptSubmit(promptOptions: ElectronPromptOptions, promptId: string) {
	const dataElement = document.querySelector('#data') as HTMLElement | null;
	let data: string | (string | null)[] | null = null; // TODO: Simplify

	if (dataElement === null) {
		return promptError("Error: Unable to find the #data element!", promptId);
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
export function promptCreateInput(promptOptions: ElectronPromptOptions, promptId: string) {
	const dataElement = document.createElement('input');
	dataElement.setAttribute('type', 'text');

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
			promptCancel(promptId);
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
export function promptCreateSelect(promptOptions: ElectronPromptOptions) {
	const dataElement = document.createElement('select');

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
