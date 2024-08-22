import { ipcRenderer } from 'electron';

import { ElectronPromptOptions, StringDictionary } from '../../electron-prompt';
import { promptError } from '../prompt.controller';

/**
 * Submits the data from the prompt input to the main process.
 */
export function promptSubmit(promptOptions: ElectronPromptOptions, promptId: string) {
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
 * Creates a select element based on the prompt options.
 *
 * @returns {HTMLSelectElement} The created select element.
 */
export function promptCreateSelect(selectOptions: StringDictionary | undefined, defaultSelectOption: string | undefined) {
	const dataElement = document.createElement('select');
	dataElement.className = 'block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500';

	// Populate the select element with options
	for (const [key, text] of Object.entries(selectOptions ?? {})) {
		const optionElement = document.createElement('option');
		optionElement.value = key;
		optionElement.textContent = text;
	
		if (defaultSelectOption && key === defaultSelectOption) {
			optionElement.selected = true;
		}
	
		dataElement.append(optionElement);
	}

	if (selectOptions == undefined) {
		console.warn("Warning: selectOptions is undefined. The select element will be empty.");
	}

	return dataElement;
}
