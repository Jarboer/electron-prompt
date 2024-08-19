// electron-prompt.d.ts
import { BrowserWindow } from 'electron';

/**
 * Used to define an input element's type
 */
// prettier-ignore
type InputElement = 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' |
    'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week';

/**
 * Used to define the prompt's information object
 */
export interface ElectronPromptOptions {
  /**
   * The title of the prompt window. Defaults to 'Prompt'.
   */
  title?: string;
  /**
   * The label which appears on the prompt for the input field. Defaults to 'Please input a value:'.
   */
  label?: string;
  /**
   * The placeholder which appears on the prompt for the input field. Defaults to blank.
   */
  placeholder?: string;
  /**
   * The text for the OK/cancel buttons. Properties are 'ok' and 'cancel'. Defaults to null.
   */
  buttonLabels?: object;
  /**
   * The default value for the input field. Defaults to null.
   */
  value?: string;
  /**
   *  The type of input field, either 'input' for a standard text input field or 'select' for a dropdown type input. Defaults to 'input'.
   */
  type?: 'input' | 'select';
  /**
   * The attributes of the input field, analogous to the HTML attributes: `{type: 'text', required: true}` -> `<input type="text" required>`.
   * Used if the type is 'input'
   */
  inputAttrs?: {
    type: InputElement;
    required: boolean;
  };
  /**
   * The items for the select dropdown if using the 'select' type in the format 'value': 'display text', where the value is what will be given
   * to the then block and the display text is what the user will see.
   */
  selectOptions?: object;
  /**
   * Whether the label should be interpreted as HTML or not. Defaults to false.
   */
  useHtmlLabel?: boolean;
  /**
   * The width of the prompt window. Defaults to 370.
   */
  width?: number;
  /**
   * The minimum allowed width for the prompt window. Same default value as width.
   */
  minWidth?: number;
  /**
   * The height of the prompt window. Defaults to 130.
   */
  height?: number;
  /**
   * The minimum allowed height for the prompt window. Same default value as height.
   */
  minHeight?: number;
  /**
   * Whether the prompt window can be resized or not (also sets useContentSize). Defaults to false.
   */
  resizable?: boolean;
  /**
   * Whether the minimize button shows on the title bar. You'll want to disable 
   * skipTaskbar so it can't disappear completely. Defaults to false.
   */
  minimizable?: boolean;
  /**
   * Whether the prompt can be made fullscreen. Defaults to false.
  */
  fullscreenable?: boolean;
  /**
   * Whether the maximize button shows on the title bar. Defaults to false.
   */
  maximizable?: boolean;
  /**
   * Whether the window should always stay on top of other windows. Defaults to false
   */
  alwaysOnTop?: boolean;
  /**
   * The path to an icon image to use in the title bar. Defaults to null and uses electron's icon.
   */
  icon?: string;
  /**
   * The local path of a CSS file to stylize the prompt window. Defaults to null.
   */
  customStylesheet?: string;
  /**
   * Whether to show the menubar or not. Defaults to false.
   */
  menuBarVisible?: boolean;
  /**
   * Whether to show the prompt window icon in taskbar. Defaults to true.
   */
  skipTaskbar?: boolean;
  /**
   * Whether to only show the prompt window once content is loaded. Defaults to false.
   */
  showWhenReady?: boolean;
  /**
   * Whether to enable dev tools for the prompt window (also shows the menu bar). 
   * You will want to enable resizing. Defaults to false.
   */
  devMode?: boolean;
}

declare function electronPrompt(
    options: ElectronPromptOptions,
    parentWindow: BrowserWindow | undefined
): Promise<string | null>;

export default electronPrompt;
