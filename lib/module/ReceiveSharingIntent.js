function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Platform, Linking, NativeModules } from 'react-native';
import Utils from './utils';
const {
  ReceiveSharingIntent
} = NativeModules;
/**
 * Documentation: Please read receivingSharing.ts in breakroom-mobile.
 * Original documentation here was supposed to be from https://github.com/ajith-ab/react-native-receive-sharing-intent/blob/master/src/ReceiveSharingIntent.ts
 * but it was not working for our case.
 */

class ReceiveSharingIntentModule {
  constructor() {
    _defineProperty(this, "isIos", Platform.OS === 'ios');

    _defineProperty(this, "utils", new Utils());
  }

  getReceivedFiles(handler, errorHandler, protocol = 'ShareMedia') {
    if (this.isIos) {
      Linking.getInitialURL().then(res => {
        if (res && res.startsWith(`${protocol}://dataUrl`)) {
          this.getFileNames(handler, errorHandler, res);
        }
      }).catch(() => {});
      Linking.addEventListener('url', res => {
        const url = res ? res.url : '';

        if (url.startsWith(`${protocol}://dataUrl`)) {
          this.getFileNames(handler, errorHandler, res.url);
        }
      });
    } else {
      this.getFileNames(handler, errorHandler, '');
    }
  }

  clearReceivedFiles() {
    // Clear current processing URL so the same URL can be processed again
    ReceiveSharingIntent.clearFileNames();
  }

  getFileNames(handler, errorHandler, url) {
    if (this.isIos) {
      ReceiveSharingIntent.getFileNames(url).then(data => {
        let files = this.utils.sortData(data);
        handler(files);
      }).catch(e => errorHandler(e)).finally(ReceiveSharingIntent.clearFileNames);
    } else {
      ReceiveSharingIntent.getFileNames().then(fileObject => {
        let files = Object.keys(fileObject).map(k => fileObject[k]);
        handler(files);
        ReceiveSharingIntent.clearFileNames();
      }).catch(errorHandler).finally(ReceiveSharingIntent.clearFileNames);
    }
  }

}

export default ReceiveSharingIntentModule;
//# sourceMappingURL=ReceiveSharingIntent.js.map