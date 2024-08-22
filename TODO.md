FIXME: Remove refs to work name

* ~~Add a way to set the placeholder text~~
* ~~Add types/code from plex-manger (the interface and BetterPrompt)~~
* ~~Change default size of prompt~~
* ~~Make sure you can set all the options I want~~
* ~~Make button text unselectable~~
* Spilt prompt options into specific options for the prompt and specific options for the BrowserWindow
* Add default style for buttons and other elements?
* Make it so you can customize the primary colour
* Make sure webpack isn't bundling npm packages (see: https://webpack.js.org/guides/author-libraries/#externalize-lodash)
* Improve webpack by following [this](https://webpack.js.org/guides/typescript/)?
* ~~Change electron.BrowserWindow to BrowserWindow~~
* Do I need getElectronMainExport()? - Can I import directly?
* ~~Do I need to set stuff as null if it is already undefined?~~
* Define ipcRenderer the same way as I do in preload.d.ts in other projects?
* Add window center from this fork? - https://github.com/p-sam/electron-prompt/compare/develop...noahheck:electron-prompt:develop
* ~~Add credit back for dev~~
* Update the readme with new images for the new UI, ~~code examples~~, ~~new method(s)~~, etc.
* ~~Update querySelector('#\<name\>') to getElementById()~~
* Clean up web ts files (Ex: do checks for valid type (ex: login, input, select) in electron-prompt.ts)
* Refactor code in web ts files into common methods
  * Can I generate the login prompt on the fly? And should I?
* Make it possible for a completely modular prompt (any combo of inputs, labels, selects, etc.)
* Add a way to add validation to the input (like you must enter in a specific format)