import {
  ACTIONID,
  CACHED_INDEX,
  CACHED_PROMISE,
  CALL_NATIVE,
  NATIVE_CALLBACK
} from './types';

const ua = window.navigator.userAgent;
const isAndroid = () => ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
const isIOS = () => !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

const NATIVE_CALLBACK = '__NativeCallback';
const CALL_NATIVE = '__CallNative';

const MSG_PREFIX = '[JSBridge]';

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const JSBridgeError = (msg: string) => {
  throw Error(`${MSG_PREFIX}: ${msg}`);
};

const randomCallbackID = (actionID: ACTIONID) => {
  return `${actionID}-${uuid()}`;
};

class JSBridgeBase {
  constructor() {
    if (!!this.cachedPromise) {
      JSBridgeError('Already loaded');
    } else {
      this.cachedPromise = new Map();
    }

    this.nativeCallbackHandler();
  }

  private cachedPromise: Map<CACHED_INDEX, CACHED_PROMISE>;

  private callNative(toNativeData: CALL_NATIVE) {
    if (isAndroid()) {
      if (!window.android) {
        JSBridgeError(
          'No window.android, please be sure your H5 is in APP WebView'
        );
      } else {
        window.android[CALL_NATIVE](JSON.stringify(toNativeData));
      }
    } else if (isIOS()) {
      if (!window.webkit) {
        JSBridgeError(
          'No window.webkit, please be sure your H5 is in APP WebView'
        );
      } else {
        window.webkit.messageHandlers[CALL_NATIVE].postMessage(toNativeData);
      }
    }
  }

  private nativeCallbackHandler() {
    if (!!window[NATIVE_CALLBACK]) {
      JSBridgeError('Already loaded');
      return;
    }

    window[NATIVE_CALLBACK] = (dataString: string) => {
      try {
        const data = JSON.parse(dataString) as NATIVE_CALLBACK;

        if (this.cachedPromise.has(data.callbackID)) {
          const correspondingHandler = this.cachedPromise.get(data.callbackID);

          if (data.error) {
            correspondingHandler.reject(data.error);
          } else {
            correspondingHandler.resolve(data.data || {});
          }

          this.cachedPromise.delete(data.callbackID);
        } else {
          console.warn(`${MSG_PREFIX}: No corresponding callbackID`);
        }
      } catch (e) {
        JSBridgeError(`Native callback error: ${e}`);
      }
    };
  }

  protected handlePublicAPI<T, K>(actionID: ACTIONID, params?: T): Promise<K> {
    const callbackID = randomCallbackID(actionID);

    return new Promise((resolve, reject) => {
      this.cachedPromise.set(callbackID, { resolve, reject });
      this.callNative({
        actionID,
        callbackID,
        params
      });
    });
  }
}

export default JSBridgeBase;
