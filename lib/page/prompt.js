const fs = require('fs');
const { ipcRenderer } = require('electron');

/**
 * The ID of the current prompt, extracted from the URL hash.
 * @type {string|null}
 */
let promptId = null;

/**
 * The options for configuring the prompt, retrieved from the main process.
 * @type {Object|null}
 */
let promptOptions = null;

/**
 * Sends an error message back to the main process.
 *
 * @param {Error|string} error - The error object or message to send.
 */
function promptError(error) {
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
	const dataElement = document.querySelector('#data');
	let data = null;

	if (promptOptions.type === 'input') {
		// Handle file input or text input
		if (dataElement.files != undefined || dataElement.files != null) {
			data = dataElement.files[0].path;
		} else {
			data = dataElement.value;
		}
	} else if (promptOptions.type === 'select') {
		// Handle single or multiple select
		if (promptOptions.selectMultiple) {
			data = Array.from(dataElement.querySelectorAll('option[selected]')).map(o => o.getAttribute('value'));
		} else {
			data = dataElement.value;
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

	// Set default value if provided
	if (promptOptions.value) {
		dataElement.value = promptOptions.value;
	} else {
		dataElement.value = '';
	}

	// Set default placeholder if provided
	if (promptOptions.placeholder) {
		dataElement.placeholder = promptOptions.placeholder;
	} else {
		dataElement.placeholder = '';
	}

	// Apply additional input attributes if provided
	if (promptOptions.inputAttrs && typeof promptOptions.inputAttrs === 'object') {
		for (const k in promptOptions.inputAttrs) {
			if (!Object.prototype.hasOwnProperty.call(promptOptions.inputAttrs, k)) {
				continue;
			}

			dataElement.setAttribute(k, promptOptions.inputAttrs[k]);
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
			document.querySelector('#ok').click();
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
	let optionElement;

	// Populate the select element with options
	for (const k in promptOptions.selectOptions) {
		if (!Object.prototype.hasOwnProperty.call(promptOptions.selectOptions, k)) {
			continue;
		}

		optionElement = document.createElement('option');
		optionElement.setAttribute('value', k);
		optionElement.textContent = promptOptions.selectOptions[k];
		if (k === promptOptions.value) {
			optionElement.setAttribute('selected', 'selected');
		}

		dataElement.append(optionElement);
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

	// Set the label in the prompt window
	if (promptOptions.useHtmlLabel) {
		document.querySelector('#label').innerHTML = promptOptions.label;
	} else {
		document.querySelector('#label').textContent = promptOptions.label;
	}

	// Set the OK button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.ok) {
		document.querySelector('#ok').textContent = promptOptions.buttonLabels.ok;
	}

	// Set the Cancel button label if provided
	if (promptOptions.buttonLabels && promptOptions.buttonLabels.cancel) {
		document.querySelector('#cancel').textContent = promptOptions.buttonLabels.cancel;
	}

	// Apply a custom stylesheet if provided
	try {
		if (promptOptions.customStylesheet) {
			const customStyleContent = fs.readFileSync(promptOptions.customStylesheet);
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

	// Attach event listeners to the form and cancel button
	document.querySelector('#form').addEventListener('submit', promptSubmit);
	document.querySelector('#cancel').addEventListener('click', promptCancel);

	const dataContainerElement = document.querySelector('#data-container');

	// Create and append the appropriate input element based on the prompt type
	let dataElement;
	if (promptOptions.type === 'input') {
		dataElement = promptCreateInput();
	} else if (promptOptions.type === 'select') {
		dataElement = promptCreateSelect();
	} else {
		return promptError(`Unhandled input type '${promptOptions.type}'`);
	}

	dataContainerElement.append(dataElement);
	dataElement.className = 'block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500';
	dataElement.setAttribute('id', 'data');

	// Focus and select the input element if applicable
	dataElement.focus();
	if (promptOptions.type === 'input') {
		dataElement.select();
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
