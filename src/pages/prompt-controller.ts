import fs from 'fs';
import { ipcRenderer } from 'electron';

import { ElectronPromptOptions } from '../electron-prompt';
import { promptCreateInput, promptCreateLabel, promptCreateSelect, setupDataContainer } from './prompt-builder';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

/**
 * Submits the data from the prompt input to the main process.
 */
function promptSubmit(promptOptions: ElectronPromptOptions, promptId: string) {
	const dataContainerElement = document.getElementById('data-container') as HTMLDivElement | null;

	let data: string | (string | null)[] | null = null; // TODO: Simplify

	if (dataContainerElement === null) {
		return promptError("Error: Unable to find the data-container!", promptId);
	}

	if (promptOptions.type === 'input' || promptOptions.type === 'login') {
		const inputNodes = dataContainerElement.querySelectorAll('input');

		if (inputNodes.length == 1) {
			let inputData = getInputData(inputNodes[0]);

			if (inputNodes.length > 0) {
				data = inputData;
			} else { // If inputData is undefined then an error occurred so return early
				return promptError("Error: Unable to find the input element!", promptId);
			}
		} else {
			data = [];

			for (let index = 0; index < inputNodes.length; index++) {
				let inputData = getInputData(inputNodes[index]);

				if (inputNodes.length > 0) {
					data.push(inputData);
				} else { // If inputData is undefined then an error occurred so return early
					return promptError(`Error: Unable to find the input element at index ${index}!`, promptId);
				}
			}
		}
	} else if (promptOptions.type === 'select') {
		const selectNodes = dataContainerElement.querySelectorAll('select');

		let selectData = getSelectData(selectNodes[0], promptOptions.selectMultiple);

		if (selectNodes.length > 0) {
			data = selectData;
		} else { // If selectData is undefined then an error occurred so return early
			return promptError("Error: Unable to find the select element!", promptId);
		}
	}

	ipcRenderer.sendSync('prompt-post-data:' + promptId, data);
}

function getInputData(inputNode: HTMLInputElement) {
	let data: string; 
	
	// Handle file input or text input
	if (inputNode.files != undefined || inputNode.files != null) {
		data = inputNode.files[0].path;
	} else {
		data = inputNode.value;
	}
	
	return data;
}

function getSelectData(selectNode: HTMLSelectElement, selectMultiple: boolean | undefined) {
	let data: string | (string | null)[]; 

	// Handle single or multiple select
	if (selectMultiple) {
		data = Array.from(selectNode.querySelectorAll('option[selected]')).map(el => el.getAttribute('value'));
	} else {
		data = selectNode.value;
	}

	return data;
}

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
	
	// Set the title in the prompt window
	const title = document.getElementById("title") as HTMLHeadingElement | null;
	if (title && promptOptions.title) {
		if (promptOptions.useHtmlTitle) {
			title.innerHTML = promptOptions.title;
		} else {
			title.textContent = promptOptions.title;
		}
	}

	// Set the title in the prompt window
	const subtitle = document.getElementById("subtitle") as HTMLHeadingElement | null;
	if (subtitle && promptOptions.subtitle) {
		if (promptOptions.useHtmlSubtitle) {
			subtitle.innerHTML = promptOptions.subtitle;
		} else {
			subtitle.textContent = promptOptions.subtitle;
		}
	}

	// Set the submit button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.submit) {
		const submitBtn = document.getElementById('submit');

		if (submitBtn) {
			submitBtn.textContent = promptOptions.buttonLabels.submit;
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
				// loginPromptSubmit(promptOptions, promptId);
				promptSubmit(promptOptions, promptId);
			} 
		});
	} else {
		return promptError(`Unable to find the form element!`, promptId);
	}

	// Create and append the appropriate input element based on the prompt type
	if (promptOptions.type === 'input' || promptOptions.type === 'login') {
		const inputTextOptions = promptOptions.inputTextOptions;
		const labelOptions = promptOptions.labelOptions;

		if (inputTextOptions === undefined) {
			return promptError(`The inputTextOptions is undefined`, promptId);
		} else if (inputTextOptions && labelOptions && inputTextOptions.length != labelOptions.length) { // TODO: Keep this?
			return promptError(`The inputTextOptions and labelOptions array lengths are not equal`, promptId);
		}

		for (let index = 0; index < inputTextOptions.length; index++) {
			let labelElement: HTMLLabelElement | null = null;

			// Only create a label if the labelOptions are defined and the index is within range
			if (labelOptions && index < labelOptions.length) {
				labelElement = promptCreateLabel(labelOptions[index]);
			}

			const dataElement = promptCreateInput(inputTextOptions[index], promptId);

			setupDataContainer(labelElement, dataElement);

			// Focus on the input element and select its text if it is the first one
			if (index == 0) {
				dataElement.focus();
				dataElement.select();
			}
		}
	} else if (promptOptions.type === 'select') {
		const selectOptions = promptOptions.selectOptions;
		const labelOptions = promptOptions.labelOptions;

		let labelElement: HTMLLabelElement | null = null;

		if (labelOptions) {
			labelElement = promptCreateLabel(labelOptions[0]);
		}

		if (selectOptions) {
			const dataElement = promptCreateSelect(selectOptions, promptOptions.defaultSelectOption);
			
			setupDataContainer(labelElement, dataElement);

			// Set the focus to the select element
			dataElement.focus();
		}
  	} else {
		return promptError(`Unknown prompt type '${promptOptions.type}'`, promptId);
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