/**
 * This file is used to bring functionality to the login-prompt modal page
 */

import { ipcRenderer } from 'electron';

// This code will run when the HTML document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form') as HTMLFormElement;

  // Add a listener to the button for when it is clicked
  loginForm.addEventListener('submit', () => {
    const usernameField = document.getElementById('username-field') as HTMLInputElement;
    const passwordField = document.getElementById('password-field') as HTMLInputElement;

    const credentials = {
      username: usernameField.textContent ?? '',
      password: passwordField.textContent ?? '',
    };

    // Send an event to the main process when the form is submitted
    ipcRenderer.send('login-form-submitted', credentials); // TODO: Need to add check for type?
  });
});
