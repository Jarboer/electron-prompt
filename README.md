# electron-prompt

Electron helper to prompt for a value via input or select

<!-- [![Build Status](https://travis-ci.com/p-sam/electron-prompt.svg?branch=master)](https://travis-ci.com/p-sam/electron-prompt) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo) -->

<p align="center"><img width="482" alt="prompt-preview" src="https://user-images.githubusercontent.com/17620180/111753337-09c0c680-8897-11eb-8ce8-43de29c143bd.png"></p>

## Installation

```sh
npm i @jarboer/electron-prompt
```

## Examples

See [basic-prompt-example](https://github.com/Jarboer/basic-prompt-example) for more an example program.

### Example 1 - Using betterPrompt()

```js
import { app, BrowserWindow } from 'electron';
import { betterPrompt } from 'electron-prompt';

let mainWindow: BrowserWindow | null;

// Electron window setup code...

// Wait for the prompt to close before continuing execution of this code section (block)
const result = await betterPrompt({
    title: 'Select an Option',
    subtitle: 'Please select an option',
    type: 'select',
    selectOptions: {
        '1': 'Option 1',
        '2': 'Option 2',
        '3': 'Option 3',
        '4': 'Option 4',
        '5': 'Option 5',
        '6': 'Option 6',
        '7': 'Option 7',
        '8': 'Option 8',
        '9': 'Option 9',
        '10': 'Option 10'
    }
}, mainWindow);

if (result) {
    console.log("Result:", result);
}
```

### Example 2 - Using prompt()

```js
import { prompt } from 'electron-prompt';

prompt({
    title: 'Prompt example',
    subtitle: 'URL:',
    type: 'input'
    inputTextOptions: [
        {
            value: 'http://example.org',
            inputAttrs: {
                type: "url",
                required: false
            }
        }
    ],
})
.then((r: any) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
        console.log('result', r);
    }
})
.catch(console.error);
```


## Documentation

Primary method:

```js
const result = betterPrompt(promptOptions, window);
```

Old primary method:

```js
prompt(options, parentBrowserWindow).then(...).catch(...);
```

### Options object (optional)

If not supplied, it uses the defaults listed in the table below.

#### ElectronPromptOptions

Used to define the prompt's information object

| Key                   | Optional? | Type               | Explanation |
| --------------------- | --------- | ------------------ | ----------- |
| `title`               | true      | string             | The title of the prompt window. Defaults to 'Prompt', or to 'Sign into your Account' for the 'login' `type`. |
| `useHtmlTitle`        | true      | boolean            | Whether the `title` should be interpreted as HTML or not. Defaults to `false`. |
| `subtitle`            | true      | string             | The subtitle of the prompt window. Defaults to 'Please input a value', or to 'Enter your account credentials' for the 'login' `type`. |
| `useHtmlSubtitle`     | true      | boolean            | Whether the `subtitle` should be interpreted as HTML or not. Defaults to `false`. |
| `type`                | true      | 'input', 'select', 'login', or undefined | The type of input field/prompt, enter 'input' for a standard text input field, 'select' for a dropdown type input, or 'login' for a prompt with 2 input fields setup to take a username/email and password. Defaults to 'input'. |
| `labelOptions`        | true      | `LabelData`[ ]     | The options for the label(s). Defaults to nothing/undefined for the 'input' `type`, or stuff relating to username, and password for 'login'. |
| `inputTextOptions`    | true      | `InputData`[ ]     | The options for the text input(s). Defaults to text and required for the 'input' `type`, or text and password for a username and password respectively for 'login'. |
| `buttonLabels`        | true      | `ButtonLabels`     | The text for the submit/cancel buttons. Defaults to 'Ok' and 'Cancel', or to  'Sign in' for the 'login' `type` (note: the cancel button isn't shown for 'login'). |
| `selectOptions`       | true      | `StringDictionary` | The items for the select dropdown if using the 'select' `type` in the format '`<value>`': '`<display text>`', where the `<value>` is what will be given to the then block and the `<display text>` is what the user will see. Defaults to nothing/undefined. |
| `defaultSelectOption` | true      | string             | The default option to select when using the 'select' `type`. Defaults to nothing/undefined. |
| `selectMultiple`      | true      | boolean            | Allows multiple options to be selected when using the 'select' `type`. Defaults to nothing/undefined. |
| `height`              | true      | number             | The height of the prompt window. Defaults to 180, or to 540 for the 'login' `type`. |
| `minHeight`           | true      | number             | The minimum allowed height for the prompt window. Same default value as height. |
| `width`               | true      | number             | The width of the prompt window. Defaults to 390, or to 600 for the 'login' `type`. |
| `minWidth`            | true      | number             | The minimum allowed width for the prompt window. Same default value as width. |
| `resizable`           | true      | boolean            | Whether the prompt window can be resized or not (also sets `useContentSize`). Defaults to false. |
| `minimizable`         | true      | boolean            | Whether the minimize button shows on the title bar. You'll want to disable skipTaskbar so it can't disappear completely. Defaults to false. |
| `fullscreenable`      | true      | boolean            | Whether the prompt can be made fullscreen. Defaults to false. |
| `maximizable`         | true      | boolean            | Whether the maximize button shows on the title bar. Defaults to false. |
| `alwaysOnTop`         | true      | boolean            | Whether the window should always stay on top of other windows. Defaults to false. |
| `icon`                | true      | string             | The path to an icon image to use in the title bar. Defaults to undefined and uses electron's icon. |
| `customStylesheet`    | true      | string             | The local path of a CSS file to stylize the prompt window. Defaults to undefined. |
| `menuBarVisible`      | true      | boolean            | Whether to show the menubar or not. Defaults to false. |
| `skipTaskbar`         | true      | boolean            | Whether to not show the prompt window icon on taskbar. Defaults to true. |
| `showWhenReady`       | true      | boolean            | Whether to only show the prompt window once content is loaded. Defaults to false. |
| `devMode`             | true      | boolean            | Whether to enable dev tools for the prompt window (also shows the menu bar). You'll probably want to enable resizing. Defaults to false. |


#### InputElement

Used to define an input element's type, the options are: 'button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'.

#### StringDictionary

Used to define a string dictionary where the key and value are strings.

Type def: `[key: string]: string;`

Example:
```
{
    'value1': 'hi',
    'value2': 'hey',
    'value3': 'hello'
}
```

#### LabelData

| Key            | Optional? | Type    | Explanation |
| -------------- | --------- | ------- | ----------- |
| `content`      | true      | string  | The label which appears on the prompt for the input field. Defaults to nothing/undefined. |
| `htmlFor`      | true      | string  | Defines which html element the label is for. Defaults to nothing/undefined. |
| `useHtmlLabel` | true      | boolean | Whether the label should be interpreted as HTML or not. Defaults to false. |

#### InputAttrs

| Key        | Optional? | Type           | Explanation |
| ---------- | --------- | -------------- | ----------- |
| `type`     | false     | `InputElement` | Define the input element's type. |
| `required` | false     | boolean        | Define if the input element is required to be completed in a form. |

#### InputData

| Key           | Optional? | Type         | Explanation |
| ------------- | --------- | ------------ | ----------- |
| `id`          | true      | string       | The id for the input element which appears on the prompt for the input field. The name will also be set to this (for labels). Defaults to nothing/undefined. |
| `placeholder` | true      | string       | The placeholder which appears on the prompt for the input field. Defaults to being blank/undefined. |
| `value`       | true      | string       | The default value for the input field. Defaults to being blank/undefined. |
| `inputAttrs`  | true      | `InputAttrs` | The attributes of the input field, analogous to the HTML attributes: `{type: 'text', required: true}` -> `<input type="text" required>`. Used if the type is 'input'. |

#### ButtonLabels

| Key      | Optional? | Type    | Explanation |
| -------- | --------- | ------- | ----------- |
| `submit` | true      | string  | Define the display text for the submit button. |
| `cancel` | true      | string  | Define the display text for the cancel button. |

### parentBrowserWindow (optional)

The window in which to display the prompt on. If not supplied, the parent window of the prompt will be null.
