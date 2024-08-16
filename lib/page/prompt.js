/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/electron/index.js":
/*!****************************************!*\
  !*** ./node_modules/electron/index.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __dirname = "/";
const fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'path'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

const pathFile = path.join(__dirname, 'path.txt');

function getElectronPath () {
  let executablePath;
  if (fs.existsSync(pathFile)) {
    executablePath = fs.readFileSync(pathFile, 'utf-8');
  }
  if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
    return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || 'electron');
  }
  if (executablePath) {
    return path.join(__dirname, 'dist', executablePath);
  } else {
    throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
  }
}

module.exports = getElectronPath();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/*!****************************!*\
  !*** ./src/page/prompt.js ***!
  \****************************/
const fs = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'fs'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const { ipcRenderer } = __webpack_require__(/*! electron */ "./node_modules/electron/index.js");

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

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS9wcm9tcHQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLFdBQVcsbUJBQU8sQ0FBQyxpSUFBSTtBQUN2QixhQUFhLG1CQUFPLENBQUMsbUlBQU07O0FBRTNCLDJCQUEyQixTQUFTOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsU0FBUztBQUM5QixJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O1VDcEJBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7OztBQ3RCQSxXQUFXLG1CQUFPLENBQUMsaUlBQUk7QUFDdkIsUUFBUSxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxrREFBVTtBQUMxQztBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGNBQWM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxrQkFBa0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxtQkFBbUI7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSCw4Q0FBOEMsbUJBQW1CO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL0BqYXJib2VyL2VsZWN0cm9uLXByb21wdC8uL25vZGVfbW9kdWxlcy9lbGVjdHJvbi9pbmRleC5qcyIsIndlYnBhY2s6Ly9AamFyYm9lci9lbGVjdHJvbi1wcm9tcHQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQGphcmJvZXIvZWxlY3Ryb24tcHJvbXB0Ly4vc3JjL3BhZ2UvcHJvbXB0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbmNvbnN0IHBhdGhGaWxlID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ3BhdGgudHh0Jyk7XG5cbmZ1bmN0aW9uIGdldEVsZWN0cm9uUGF0aCAoKSB7XG4gIGxldCBleGVjdXRhYmxlUGF0aDtcbiAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aEZpbGUpKSB7XG4gICAgZXhlY3V0YWJsZVBhdGggPSBmcy5yZWFkRmlsZVN5bmMocGF0aEZpbGUsICd1dGYtOCcpO1xuICB9XG4gIGlmIChwcm9jZXNzLmVudi5FTEVDVFJPTl9PVkVSUklERV9ESVNUX1BBVEgpIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHByb2Nlc3MuZW52LkVMRUNUUk9OX09WRVJSSURFX0RJU1RfUEFUSCwgZXhlY3V0YWJsZVBhdGggfHwgJ2VsZWN0cm9uJyk7XG4gIH1cbiAgaWYgKGV4ZWN1dGFibGVQYXRoKSB7XG4gICAgcmV0dXJuIHBhdGguam9pbihfX2Rpcm5hbWUsICdkaXN0JywgZXhlY3V0YWJsZVBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignRWxlY3Ryb24gZmFpbGVkIHRvIGluc3RhbGwgY29ycmVjdGx5LCBwbGVhc2UgZGVsZXRlIG5vZGVfbW9kdWxlcy9lbGVjdHJvbiBhbmQgdHJ5IGluc3RhbGxpbmcgYWdhaW4nKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEVsZWN0cm9uUGF0aCgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuY29uc3QgeyBpcGNSZW5kZXJlciB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgSUQgb2YgdGhlIGN1cnJlbnQgcHJvbXB0LCBleHRyYWN0ZWQgZnJvbSB0aGUgVVJMIGhhc2guXHJcbiAqIEB0eXBlIHtzdHJpbmd8bnVsbH1cclxuICovXHJcbmxldCBwcm9tcHRJZCA9IG51bGw7XHJcblxyXG4vKipcclxuICogVGhlIG9wdGlvbnMgZm9yIGNvbmZpZ3VyaW5nIHRoZSBwcm9tcHQsIHJldHJpZXZlZCBmcm9tIHRoZSBtYWluIHByb2Nlc3MuXHJcbiAqIEB0eXBlIHtPYmplY3R8bnVsbH1cclxuICovXHJcbmxldCBwcm9tcHRPcHRpb25zID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBTZW5kcyBhbiBlcnJvciBtZXNzYWdlIGJhY2sgdG8gdGhlIG1haW4gcHJvY2Vzcy5cclxuICpcclxuICogQHBhcmFtIHtFcnJvcnxzdHJpbmd9IGVycm9yIC0gVGhlIGVycm9yIG9iamVjdCBvciBtZXNzYWdlIHRvIHNlbmQuXHJcbiAqL1xyXG5mdW5jdGlvbiBwcm9tcHRFcnJvcihlcnJvcikge1xyXG5cdGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XHJcblx0XHRlcnJvciA9IGVycm9yLm1lc3NhZ2U7XHJcblx0fVxyXG5cclxuXHRpcGNSZW5kZXJlci5zZW5kU3luYygncHJvbXB0LWVycm9yOicgKyBwcm9tcHRJZCwgZXJyb3IpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FuY2VscyB0aGUgcHJvbXB0IGFuZCBzZW5kcyBhIG51bGwgcmVzcG9uc2UgYmFjayB0byB0aGUgbWFpbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gcHJvbXB0Q2FuY2VsKCkge1xyXG5cdGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdwcm9tcHQtcG9zdC1kYXRhOicgKyBwcm9tcHRJZCwgbnVsbCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTdWJtaXRzIHRoZSBkYXRhIGZyb20gdGhlIHByb21wdCBpbnB1dCB0byB0aGUgbWFpbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gcHJvbXB0U3VibWl0KCkge1xyXG5cdGNvbnN0IGRhdGFFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RhdGEnKTtcclxuXHRsZXQgZGF0YSA9IG51bGw7XHJcblxyXG5cdGlmIChwcm9tcHRPcHRpb25zLnR5cGUgPT09ICdpbnB1dCcpIHtcclxuXHRcdC8vIEhhbmRsZSBmaWxlIGlucHV0IG9yIHRleHQgaW5wdXRcclxuXHRcdGlmIChkYXRhRWxlbWVudC5maWxlcyAhPSB1bmRlZmluZWQgfHwgZGF0YUVsZW1lbnQuZmlsZXMgIT0gbnVsbCkge1xyXG5cdFx0XHRkYXRhID0gZGF0YUVsZW1lbnQuZmlsZXNbMF0ucGF0aDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRhdGEgPSBkYXRhRWxlbWVudC52YWx1ZTtcclxuXHRcdH1cclxuXHR9IGVsc2UgaWYgKHByb21wdE9wdGlvbnMudHlwZSA9PT0gJ3NlbGVjdCcpIHtcclxuXHRcdC8vIEhhbmRsZSBzaW5nbGUgb3IgbXVsdGlwbGUgc2VsZWN0XHJcblx0XHRpZiAocHJvbXB0T3B0aW9ucy5zZWxlY3RNdWx0aXBsZSkge1xyXG5cdFx0XHRkYXRhID0gQXJyYXkuZnJvbShkYXRhRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb25bc2VsZWN0ZWRdJykpLm1hcChvID0+IG8uZ2V0QXR0cmlidXRlKCd2YWx1ZScpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRhdGEgPSBkYXRhRWxlbWVudC52YWx1ZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGlwY1JlbmRlcmVyLnNlbmRTeW5jKCdwcm9tcHQtcG9zdC1kYXRhOicgKyBwcm9tcHRJZCwgZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIGlucHV0IGVsZW1lbnQgYmFzZWQgb24gdGhlIHByb21wdCBvcHRpb25zLlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7SFRNTElucHV0RWxlbWVudH0gVGhlIGNyZWF0ZWQgaW5wdXQgZWxlbWVudC5cclxuICovXHJcbmZ1bmN0aW9uIHByb21wdENyZWF0ZUlucHV0KCkge1xyXG5cdGNvbnN0IGRhdGFFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHRkYXRhRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dCcpO1xyXG5cclxuXHQvLyBTZXQgZGVmYXVsdCB2YWx1ZSBpZiBwcm92aWRlZFxyXG5cdGlmIChwcm9tcHRPcHRpb25zLnZhbHVlKSB7XHJcblx0XHRkYXRhRWxlbWVudC52YWx1ZSA9IHByb21wdE9wdGlvbnMudmFsdWU7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRhdGFFbGVtZW50LnZhbHVlID0gJyc7XHJcblx0fVxyXG5cclxuXHQvLyBTZXQgZGVmYXVsdCBwbGFjZWhvbGRlciBpZiBwcm92aWRlZFxyXG5cdGlmIChwcm9tcHRPcHRpb25zLnBsYWNlaG9sZGVyKSB7XHJcblx0XHRkYXRhRWxlbWVudC5wbGFjZWhvbGRlciA9IHByb21wdE9wdGlvbnMucGxhY2Vob2xkZXI7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRhdGFFbGVtZW50LnBsYWNlaG9sZGVyID0gJyc7XHJcblx0fVxyXG5cclxuXHQvLyBBcHBseSBhZGRpdGlvbmFsIGlucHV0IGF0dHJpYnV0ZXMgaWYgcHJvdmlkZWRcclxuXHRpZiAocHJvbXB0T3B0aW9ucy5pbnB1dEF0dHJzICYmIHR5cGVvZiBwcm9tcHRPcHRpb25zLmlucHV0QXR0cnMgPT09ICdvYmplY3QnKSB7XHJcblx0XHRmb3IgKGNvbnN0IGsgaW4gcHJvbXB0T3B0aW9ucy5pbnB1dEF0dHJzKSB7XHJcblx0XHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb21wdE9wdGlvbnMuaW5wdXRBdHRycywgaykpIHtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZGF0YUVsZW1lbnQuc2V0QXR0cmlidXRlKGssIHByb21wdE9wdGlvbnMuaW5wdXRBdHRyc1trXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIGZvciBjYW5jZWwgYW5kIHN1Ym1pdCBhY3Rpb25zXHJcblx0ZGF0YUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldmVudCA9PiB7XHJcblx0XHRpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xyXG5cdFx0XHRwcm9tcHRDYW5jZWwoKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0ZGF0YUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBldmVudCA9PiB7XHJcblx0XHRpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XHJcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvaycpLmNsaWNrKCk7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBkYXRhRWxlbWVudDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzZWxlY3QgZWxlbWVudCBiYXNlZCBvbiB0aGUgcHJvbXB0IG9wdGlvbnMuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtIVE1MU2VsZWN0RWxlbWVudH0gVGhlIGNyZWF0ZWQgc2VsZWN0IGVsZW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBwcm9tcHRDcmVhdGVTZWxlY3QoKSB7XHJcblx0Y29uc3QgZGF0YUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWxlY3QnKTtcclxuXHRsZXQgb3B0aW9uRWxlbWVudDtcclxuXHJcblx0Ly8gUG9wdWxhdGUgdGhlIHNlbGVjdCBlbGVtZW50IHdpdGggb3B0aW9uc1xyXG5cdGZvciAoY29uc3QgayBpbiBwcm9tcHRPcHRpb25zLnNlbGVjdE9wdGlvbnMpIHtcclxuXHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHByb21wdE9wdGlvbnMuc2VsZWN0T3B0aW9ucywgaykpIHtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblxyXG5cdFx0b3B0aW9uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xyXG5cdFx0b3B0aW9uRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgayk7XHJcblx0XHRvcHRpb25FbGVtZW50LnRleHRDb250ZW50ID0gcHJvbXB0T3B0aW9ucy5zZWxlY3RPcHRpb25zW2tdO1xyXG5cdFx0aWYgKGsgPT09IHByb21wdE9wdGlvbnMudmFsdWUpIHtcclxuXHRcdFx0b3B0aW9uRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZGF0YUVsZW1lbnQuYXBwZW5kKG9wdGlvbkVsZW1lbnQpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGRhdGFFbGVtZW50O1xyXG59XHJcblxyXG4vKipcclxuICogUmVnaXN0ZXJzIHRoZSBwcm9tcHQgd2luZG93IGFuZCBpbml0aWFsaXplcyBpdCBiYXNlZCBvbiB0aGUgcmV0cmlldmVkIG9wdGlvbnMuXHJcbiAqL1xyXG5mdW5jdGlvbiBwcm9tcHRSZWdpc3RlcigpIHtcclxuXHQvLyBFeHRyYWN0IHRoZSBwcm9tcHQgSUQgZnJvbSB0aGUgVVJMIGhhc2hcclxuXHRwcm9tcHRJZCA9IGRvY3VtZW50LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcclxuXHJcblx0dHJ5IHtcclxuXHRcdC8vIFJldHJpZXZlIHByb21wdCBvcHRpb25zIGZyb20gdGhlIG1haW4gcHJvY2Vzc1xyXG5cdFx0cHJvbXB0T3B0aW9ucyA9IEpTT04ucGFyc2UoaXBjUmVuZGVyZXIuc2VuZFN5bmMoJ3Byb21wdC1nZXQtb3B0aW9uczonICsgcHJvbXB0SWQpKTtcclxuXHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0cmV0dXJuIHByb21wdEVycm9yKGVycm9yKTtcclxuXHR9XHJcblxyXG5cdC8vIFNldCB0aGUgbGFiZWwgaW4gdGhlIHByb21wdCB3aW5kb3dcclxuXHRpZiAocHJvbXB0T3B0aW9ucy51c2VIdG1sTGFiZWwpIHtcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsYWJlbCcpLmlubmVySFRNTCA9IHByb21wdE9wdGlvbnMubGFiZWw7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsYWJlbCcpLnRleHRDb250ZW50ID0gcHJvbXB0T3B0aW9ucy5sYWJlbDtcclxuXHR9XHJcblxyXG5cdC8vIFNldCB0aGUgT0sgYnV0dG9uIGxhYmVsIGlmIHByb3ZpZGVkXHJcblx0aWYgKHByb21wdE9wdGlvbnMuYnV0dG9uTGFiZWxzICYmIHByb21wdE9wdGlvbnMuYnV0dG9uTGFiZWxzLm9rKSB7XHJcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb2snKS50ZXh0Q29udGVudCA9IHByb21wdE9wdGlvbnMuYnV0dG9uTGFiZWxzLm9rO1xyXG5cdH1cclxuXHJcblx0Ly8gU2V0IHRoZSBDYW5jZWwgYnV0dG9uIGxhYmVsIGlmIHByb3ZpZGVkXHJcblx0aWYgKHByb21wdE9wdGlvbnMuYnV0dG9uTGFiZWxzICYmIHByb21wdE9wdGlvbnMuYnV0dG9uTGFiZWxzLmNhbmNlbCkge1xyXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhbmNlbCcpLnRleHRDb250ZW50ID0gcHJvbXB0T3B0aW9ucy5idXR0b25MYWJlbHMuY2FuY2VsO1xyXG5cdH1cclxuXHJcblx0Ly8gQXBwbHkgYSBjdXN0b20gc3R5bGVzaGVldCBpZiBwcm92aWRlZFxyXG5cdHRyeSB7XHJcblx0XHRpZiAocHJvbXB0T3B0aW9ucy5jdXN0b21TdHlsZXNoZWV0KSB7XHJcblx0XHRcdGNvbnN0IGN1c3RvbVN0eWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhwcm9tcHRPcHRpb25zLmN1c3RvbVN0eWxlc2hlZXQpO1xyXG5cdFx0XHRpZiAoY3VzdG9tU3R5bGVDb250ZW50KSB7XHJcblx0XHRcdFx0Y29uc3QgY3VzdG9tU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG5cdFx0XHRcdGN1c3RvbVN0eWxlLnNldEF0dHJpYnV0ZSgncmVsJywgJ3N0eWxlc2hlZXQnKTtcclxuXHRcdFx0XHRjdXN0b21TdHlsZS5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3VzdG9tU3R5bGVDb250ZW50KSk7XHJcblx0XHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmQoY3VzdG9tU3R5bGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHJldHVybiBwcm9tcHRFcnJvcihlcnJvcik7XHJcblx0fVxyXG5cclxuXHQvLyBBdHRhY2ggZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBmb3JtIGFuZCBjYW5jZWwgYnV0dG9uXHJcblx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Zvcm0nKS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBwcm9tcHRTdWJtaXQpO1xyXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYW5jZWwnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByb21wdENhbmNlbCk7XHJcblxyXG5cdGNvbnN0IGRhdGFDb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RhdGEtY29udGFpbmVyJyk7XHJcblxyXG5cdC8vIENyZWF0ZSBhbmQgYXBwZW5kIHRoZSBhcHByb3ByaWF0ZSBpbnB1dCBlbGVtZW50IGJhc2VkIG9uIHRoZSBwcm9tcHQgdHlwZVxyXG5cdGxldCBkYXRhRWxlbWVudDtcclxuXHRpZiAocHJvbXB0T3B0aW9ucy50eXBlID09PSAnaW5wdXQnKSB7XHJcblx0XHRkYXRhRWxlbWVudCA9IHByb21wdENyZWF0ZUlucHV0KCk7XHJcblx0fSBlbHNlIGlmIChwcm9tcHRPcHRpb25zLnR5cGUgPT09ICdzZWxlY3QnKSB7XHJcblx0XHRkYXRhRWxlbWVudCA9IHByb21wdENyZWF0ZVNlbGVjdCgpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gcHJvbXB0RXJyb3IoYFVuaGFuZGxlZCBpbnB1dCB0eXBlICcke3Byb21wdE9wdGlvbnMudHlwZX0nYCk7XHJcblx0fVxyXG5cclxuXHRkYXRhQ29udGFpbmVyRWxlbWVudC5hcHBlbmQoZGF0YUVsZW1lbnQpO1xyXG5cdGRhdGFFbGVtZW50LmNsYXNzTmFtZSA9ICdibG9jayB3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGJnLWdyYXktMTAwIHAtMi41IGZvY3VzOmJvcmRlci1wcmltYXJ5LTYwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0xIGZvY3VzOnJpbmctcHJpbWFyeS02MDAgZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpiZy1ncmF5LTcwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNDAwIGRhcms6Zm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGRhcms6Zm9jdXM6cmluZy1ibHVlLTUwMCc7XHJcblx0ZGF0YUVsZW1lbnQuc2V0QXR0cmlidXRlKCdpZCcsICdkYXRhJyk7XHJcblxyXG5cdC8vIEZvY3VzIGFuZCBzZWxlY3QgdGhlIGlucHV0IGVsZW1lbnQgaWYgYXBwbGljYWJsZVxyXG5cdGRhdGFFbGVtZW50LmZvY3VzKCk7XHJcblx0aWYgKHByb21wdE9wdGlvbnMudHlwZSA9PT0gJ2lucHV0Jykge1xyXG5cdFx0ZGF0YUVsZW1lbnQuc2VsZWN0KCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogR2xvYmFsIGVycm9yIGhhbmRsZXIgZm9yIHRoZSBwcm9tcHQgd2luZG93LCByZXBvcnRzIGVycm9ycyBiYWNrIHRvIHRoZSBtYWluIHByb2Nlc3MuXHJcbiAqL1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiB7XHJcblx0aWYgKHByb21wdElkKSB7XHJcblx0XHRwcm9tcHRFcnJvcignQW4gZXJyb3IgaGFzIG9jY3VycmVkIG9uIHRoZSBwcm9tcHQgd2luZG93OiBcXG4nICsgZXJyb3IubWVzc2FnZSk7XHJcblx0fVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBSZWdpc3RlcnMgdGhlIHByb21wdCB3aGVuIHRoZSBET00gY29udGVudCBpcyBmdWxseSBsb2FkZWQuXHJcbiAqL1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcHJvbXB0UmVnaXN0ZXIpO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=