'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapRequestInfoToUrlString = mapRequestInfoToUrlString;
function mapRequestInfoToUrlString(requestInfo) {
  if (requestInfo instanceof Request) {
    return requestInfo.url;
  } else if (requestInfo instanceof URL) {
    return requestInfo.href;
  } else {
    return requestInfo;
  }
}

var canUseWindow = exports.canUseWindow = typeof window !== 'undefined';