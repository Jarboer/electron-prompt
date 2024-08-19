// types/electron.d.ts
import * as electron from 'electron';

declare module 'electron' {
    interface ElectronStatic {
        remote?: typeof import('@electron/remote');
    }
}
