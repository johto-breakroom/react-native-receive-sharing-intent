import type {
  IReceiveSharingIntent,
  IUtils,
} from './ReceiveSharingIntent.interfaces';
import { Platform, Linking, NativeModules } from 'react-native';
import Utils from './utils';

const { ReceiveSharingIntent } = NativeModules;

/**
 * Documentation: Please read receivingSharing.ts in breakroom-mobile.
 * Original documentation here was supposed to be from https://github.com/ajith-ab/react-native-receive-sharing-intent/blob/master/src/ReceiveSharingIntent.ts
 * but it was not working for our case.
 */
class ReceiveSharingIntentModule implements IReceiveSharingIntent {
  private isIos: boolean = Platform.OS === 'ios';
  private utils: IUtils = new Utils();
  private linkingSubscription: any = null;
  private initialUrlProcessed: boolean = false;

  getReceivedFiles(
    handler: Function,
    errorHandler: Function,
    protocol: string = 'ShareMedia'
  ) {
    if (this.isIos) {
      if (!this.initialUrlProcessed) {
        Linking.getInitialURL()
          .then((res: any) => {
            if (res && res.startsWith(`${protocol}://dataUrl`)) {
              console.log('PROCESSING INITIAL URL');
              this.getFileNames(handler, errorHandler, res);
              this.initialUrlProcessed = true;
            }
          })
          .catch(() => {});
      }

      if (!this.linkingSubscription) {
        console.log('CREATING LISTENER');
        this.linkingSubscription = Linking.addEventListener(
          'url',
          (res: any) => {
            const url = res ? res.url : '';
            if (url.startsWith(`${protocol}://dataUrl`)) {
              this.getFileNames(handler, errorHandler, res.url);
            }
          }
        );
      }
    } else {
      this.getFileNames(handler, errorHandler, '');
    }
  }

  clearReceivedFiles() {
    // Clear current processing URL so the same URL can be processed again
    ReceiveSharingIntent.clearFileNames();
  }

  protected getFileNames(
    handler: Function,
    errorHandler: Function,
    url: string
  ) {
    if (this.isIos) {
      ReceiveSharingIntent.getFileNames(url)
        .then((data: any) => {
          let files = this.utils.sortData(data);
          handler(files);
        })
        .catch((e: any) => errorHandler(e))
        .finally(ReceiveSharingIntent.clearFileNames);
    } else {
      ReceiveSharingIntent.getFileNames()
        .then((fileObject: any) => {
          let files = Object.keys(fileObject).map((k) => fileObject[k]);
          handler(files);
          ReceiveSharingIntent.clearFileNames();
        })
        .catch(errorHandler)
        .finally(() => {
          console.log('CLEARING');
          ReceiveSharingIntent.clearFileNames();
        });
    }
  }
}

export default ReceiveSharingIntentModule;
