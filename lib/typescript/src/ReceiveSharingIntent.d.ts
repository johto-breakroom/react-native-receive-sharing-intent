import type { IReceiveSharingIntent } from './ReceiveSharingIntent.interfaces';
/**
 * Documentation: Please read receivingSharing.ts in breakroom-mobile.
 * Original documentation here was supposed to be from https://github.com/ajith-ab/react-native-receive-sharing-intent/blob/master/src/ReceiveSharingIntent.ts
 * but it was not working for our case.
 */
declare class ReceiveSharingIntentModule implements IReceiveSharingIntent {
    private isIos;
    private utils;
    getReceivedFiles(handler: Function, errorHandler: Function, protocol?: string): void;
    clearReceivedFiles(): void;
    protected getFileNames(handler: Function, errorHandler: Function, url: string): void;
}
export default ReceiveSharingIntentModule;
