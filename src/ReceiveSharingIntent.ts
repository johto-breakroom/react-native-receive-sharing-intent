import type {
  IReceiveSharingIntent,
  IUtils,
} from './ReceiveSharingIntent.interfaces';
import { Platform, Linking, NativeModules } from 'react-native';
import Utils from './utils';

const { ReceiveSharingIntent } = NativeModules;

class ReceiveSharingIntentModule implements IReceiveSharingIntent {
  private isIos: boolean = Platform.OS === 'ios';
  private utils: IUtils = new Utils();
  private isClear: boolean = false;

  getReceivedFiles(
    handler: Function,
    errorHandler: Function,
    protocol: string = 'ShareMedia'
  ) {
    console.log('RECEIVED FILES');
    if (this.isIos) {
      Linking.getInitialURL()
        .then((res: any) => {
          if (res && res.startsWith(`${protocol}://dataUrl`) && !this.isClear) {
            this.getFileNames(handler, errorHandler, res);
          }
        })
        .catch(() => {});
      Linking.addEventListener('url', (res: any) => {
        const url = res ? res.url : '';
        if (url.startsWith(`${protocol}://dataUrl`) && !this.isClear) {
          this.getFileNames(handler, errorHandler, res.url);
        }
      });
    } else {
      this.getFileNames(handler, errorHandler, '');
      //     AppState.addEventListener('change', (status: string) => {
      //         if (status === 'active' && !this.isClear) {
      //             this.getFileNames(handler,errorHandler, "");
      //         }
      //       });
      //    if(!this.isClear) this.getFileNames(handler,errorHandler, "");
    }
  }

  clearReceivedFiles() {
    this.isClear = true;
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
        .catch((e: any) => errorHandler(e));
    } else {
      ReceiveSharingIntent.getFileNames()
        .then((fileObject: any) => {
          console.log('What is this file object', fileObject);
          if (!fileObject) {
            handler([]);
            return;
          }
          let files = Object.keys(fileObject).map((k) => fileObject[k]);
          handler(files);
        })
        .catch((e: any) => {
          const error =
            e instanceof Error ? e : new Error('Failed to get shared files');
          errorHandler(error);
        });
    }
  }
}

export default ReceiveSharingIntentModule;
