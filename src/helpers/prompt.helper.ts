import { ipcRenderer } from 'electron';

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