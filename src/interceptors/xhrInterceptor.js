// @flow
import { extendWithBind } from "../helpers/util";
import { Response as KakapoResponse } from "../Response";
import { Request as KakapoRequest } from "../Request";
import {
  Interceptor,
  type InterceptorConfig,
  interceptorHelper
} from "./interceptorHelper";
import {canUseWindow} from '../utils';

const NativeXMLHttpRequest = canUseWindow && XMLHttpRequest;
const NativeXMLHttpRequestEventTarget = canUseWindow && window.XMLHttpRequestEventTarget;

class FakeXMLHttpRequest {
  static +interceptors: Interceptor[] = [];
  static use(interceptor: Interceptor): void {
    FakeXMLHttpRequest.interceptors.push(interceptor);
  }
  static shouldIntercept(method: string, url: string): boolean {
    return FakeXMLHttpRequest.interceptors.some(interceptor =>
      interceptor.getHandler(url, method)
    );
  }

  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;

  timeout: number;
  // withCredentials: boolean;
  // msCaching: string;

  _method: string;
  _url: string;

  open(
    method: string,
    url: string,
    async?: boolean,
    user?: string,
    password?: string
  ): void {
    this._method = method;
    this._url = url;
    this._readyState = FakeXMLHttpRequest.OPENED;
  }

  // responseBody: any;

  _status: number = 0;
  get status(): number {
    return this._status;
  }

  _readyState: number = FakeXMLHttpRequest.UNSENT;
  get readyState(): number {
    return this._readyState;
  }
  // responseXML: any;
  // responseURL: string;
  // statusText: string;

  _setReadyState(readyState: number): void {
    this._readyState = readyState;
    if (this.onreadystatechange) {
      this.onreadystatechange(new Event("readystatechange"));
    }
  }

  _response: any;
  get response(): any {
    return this._response;
  }

  get responseText(): string {
    return this.response;
  }

  responseType:
    | void
    | ""
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text";

  _requestHeaders: { [header: string]: string } = {};
  setRequestHeader(header: string, value: string): void {
    this._requestHeaders[header] = value;
  }

  _responseHeaders: { [header: string]: string } = {};
  // getAllResponseHeaders(): string;
  getResponseHeader(header: string): string {
    return this._responseHeaders[header];
  }

  getAllResponseHeaders(): string {
    return this._responseHeaders;
  }
  
  abort(): void {
    this._setReadyState(FakeXMLHttpRequest.UNSENT);
    this._status = 0;
  }

  send(data?: any): void {
    const { _method: method, _url: url } = this;
    const interceptors = FakeXMLHttpRequest.interceptors.filter(interceptor =>
      interceptor.getHandler(url, method)
    );

    if (interceptors.length > 0) {
      interceptors.forEach(interceptor => {
        const handler = interceptor.getHandler(url, method);

        if (handler) {
          const db = interceptor.getDB();
          const delay = interceptor.getDelay();
          const logging = interceptor.getLogging();

          const request = new KakapoRequest({
            params: interceptor.getParams(url, method),
            query: interceptor.getQuery(url),
            body: data,
            headers: this._requestHeaders
          });

          if ( logging ) {
            console.log(method + ' ' + url, request);
          }

          // Wrapping handler into a promise to add promise support for free
          const responsePromise = Promise.resolve(handler(request, db));

          responsePromise.then(result => {
            const response = KakapoResponse.wrap(result);

            if ( logging ) {
              console.log(method + ' ' + url, response);
            }

            if (delay) {
              setTimeout(() => this._handleResponse(response), delay);
            } else {
              this._handleResponse(response);
            }
          });
        }
      });
    } else {
      this.nativeSend(data);
    }
  }

  _handleResponse({ code, headers, body }: KakapoResponse): void {
    const { "content-type": contentType } = headers;

    this._status = code;
    this._responseHeaders = headers;

    if (this.responseType === "blob") {
      if (body instanceof Blob) {
        this._response = body;
      } else {
        this._response = new Blob([body]);
      }
    } else {
      this._response = JSON.stringify(body);
    }

    this._setReadyState(FakeXMLHttpRequest.DONE);

    const loadEvent = new ProgressEvent("load");
    if (this.onload) {
      this.onload(loadEvent);
    }
    this._listeners["load"].forEach(listener => {
      if (listener.handleEvent) {
        listener.handleEvent(loadEvent);
      } else {
        listener(loadEvent);
      }
    });
  }

  // abort(): void;

  // msCachingEnabled(): boolean;
  // overrideMimeType(mime: string): void;

  _listeners: {
    [type: ProgressEventTypes]: Array<ProgressEventListener>
  } = {
    abort: [],
    error: [],
    load: [],
    loadend: [],
    loadstart: [],
    progress: [],
    timeout: []
  };

  addEventListener(
    type: ProgressEventTypes,
    listener: ProgressEventListener
  ): void {
    this._listeners[type].push(listener);
  }

  removeEventListener(
    type: ProgressEventTypes,
    listener: ProgressEventListener
  ): void {
    const index = this._listeners[type].indexOf(listener);
    if (index >= 0) {
      this._listeners[type].splice(index, 1);
    }
  }

  upload: XMLHttpRequestEventTarget = new XMLHttpRequestEventTarget();

  onabort: ProgressEventHandler;
  onerror: ProgressEventHandler;
  onload: ProgressEventHandler;
  onloadend: ProgressEventHandler;
  onloadstart: ProgressEventHandler;
  onprogress: ProgressEventHandler;
  ontimeout: ProgressEventHandler;

  onreadystatechange: (ev: Event) => any;

  nativeSend(data?: any): void {
    const request = new NativeXMLHttpRequest();

    request.timeout = this.timeout;
    request.onload = () => {
      const headers = request
        .getAllResponseHeaders()
        .split("\r\n")
        .reduce((previous, current) => {
          const [header, value] = current.split(": ");
          return {
            ...previous,
            [header]: value
          };
        }, {});
      const response = new KakapoResponse(
        request.status,
        request.responseBody,
        headers
      );
      this._handleResponse(response);
    };

    request.open(this._method, this._url);
    request.send(data);
  }
}

type AddEventListenerOptions = {
  capture?: boolean,
  once?: boolean,
  passive?: boolean
};

class FakeXMLHttpRequestEventTarget {
  addEventListener(
    type: string,
    listener: Function,
    useCaptureOrOptions: boolean | AddEventListenerOptions = false
  ) {
    // do nothing for now
  }
}

export const enable = (config: InterceptorConfig) => {
  const interceptor = interceptorHelper(config);
  FakeXMLHttpRequest.use(interceptor);
  window.XMLHttpRequest = FakeXMLHttpRequest;
  window.XMLHttpRequestEventTarget = FakeXMLHttpRequestEventTarget;
};
export const disable = () => {
  window.XMLHttpRequest = NativeXMLHttpRequest;
  window.XMLHttpRequestEventTarget = NativeXMLHttpRequestEventTarget;
};
