import { InputData, LabelData, StringDictionary } from "../electron-prompt";
import { promptCancel } from "./prompt.controller";

export function promptCreateLabel(labelData: LabelData) {
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
export function promptCreateInput(inputData: InputData, promptId: string) {
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

export function setupDataContainer(labelElement: HTMLLabelElement | null, dataElement: HTMLInputElement | HTMLSelectElement) {
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