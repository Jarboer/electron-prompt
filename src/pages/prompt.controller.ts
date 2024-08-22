import fs from 'fs';
import { ipcRenderer } from 'electron';

import { ElectronPromptOptions, InputData, LabelData } from '../electron-prompt';
import { promptCreateSelect, promptSubmit } from './prompt/prompt';
// import { loginPromptSubmit } from './login-prompt/login-prompt';

/**
 * The ID of the current prompt, extracted from the URL hash.
 */
let promptId: string | null = null;

function promptCreateLabel(labelData: LabelData) {
	const labelElement = document.createElement('label');

	if (labelData.htmlFor) {
		labelElement.htmlFor = labelData.htmlFor;
	}

	// Set the label in the prompt window
	if (labelData.content) {
		if (labelData.useHtmlLabel) {
			labelElement.innerHTML = labelData.content;
		} else {
			labelElement.textContent = labelData.content;
		}
	}

	labelElement.className = "mb-2 block text-sm font-medium";

	return labelElement;
}

/**
 * Creates an input element based on the prompt options.
 *
 * @returns {HTMLInputElement} The created input element.
 */
function promptCreateInput(inputData: InputData, promptId: string) {
	const dataElement = document.createElement('input');
	dataElement.className = 'block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500';
	
	if (inputData.id) {
		dataElement.id = inputData.id;
		dataElement.name = inputData.id;
	}

	// Set input's value if provided, otherwise, set it to a blank string
	dataElement.value = inputData.value ?? '';

	// Set input's placeholder if provided, otherwise, set it to a blank string
	dataElement.placeholder = inputData.placeholder ?? '';
	
	// Apply additional input attributes if provided
	const inputAttrs = inputData.inputAttrs;
	if (inputAttrs && typeof inputAttrs === 'object') {
		for (const k in inputAttrs) {
			if (Object.prototype.hasOwnProperty.call(inputAttrs, k)) {
				const value = inputAttrs[k as keyof typeof inputAttrs];

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

			let okBtn = document.getElementById('submit') as HTMLButtonElement | null;
			okBtn?.click();
		}
	});

	return dataElement;
}

function setupDataContainer(labelElement: HTMLLabelElement | null, dataElement: HTMLInputElement | HTMLSelectElement) {
	const dataContainerElement = document.getElementById('data-container') as HTMLDivElement | null;

	if (dataContainerElement) {
		/* This div is used as a container for the label and input. It also will have a top space added 
		   as applicable due to the classes on the data-container. This helps visual separate multiple
		   containers and their contents */
		const containerDiv = document.createElement('div');

		if (labelElement) {
			containerDiv.appendChild(labelElement);
		}
		
		containerDiv.append(dataElement);

		dataContainerElement.appendChild(containerDiv);
	}
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