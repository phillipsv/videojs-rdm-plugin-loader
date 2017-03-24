(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsRdmPluginLoader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require(3);
},{"3":3}],2:[function(require,module,exports){
(function (process){
'use strict';

var utils = require(25);
var settle = require(12);
var buildURL = require(17);
var parseHeaders = require(23);
var isURLSameOrigin = require(21);
var createError = require(9);
var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || require(16);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require(19);

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        if (request.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

}).call(this,require(26))

},{"12":12,"16":16,"17":17,"19":19,"21":21,"23":23,"25":25,"26":26,"9":9}],3:[function(require,module,exports){
'use strict';

var utils = require(25);
var bind = require(15);
var Axios = require(7);
var defaults = require(14);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require(4);
axios.CancelToken = require(5);
axios.isCancel = require(6);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require(24);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"14":14,"15":15,"24":24,"25":25,"4":4,"5":5,"6":6,"7":7}],4:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],5:[function(require,module,exports){
'use strict';

var Cancel = require(4);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"4":4}],6:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],7:[function(require,module,exports){
'use strict';

var defaults = require(14);
var utils = require(25);
var InterceptorManager = require(8);
var dispatchRequest = require(10);
var isAbsoluteURL = require(20);
var combineURLs = require(18);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"10":10,"14":14,"18":18,"20":20,"25":25,"8":8}],8:[function(require,module,exports){
'use strict';

var utils = require(25);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"25":25}],9:[function(require,module,exports){
'use strict';

var enhanceError = require(11);

/**
 * Create an Error with the specified message, config, error code, and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, response);
};

},{"11":11}],10:[function(require,module,exports){
'use strict';

var utils = require(25);
var transformData = require(13);
var isCancel = require(6);
var defaults = require(14);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"13":13,"14":14,"25":25,"6":6}],11:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 @ @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.response = response;
  return error;
};

},{}],12:[function(require,module,exports){
'use strict';

var createError = require(9);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response
    ));
  }
};

},{"9":9}],13:[function(require,module,exports){
'use strict';

var utils = require(25);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"25":25}],14:[function(require,module,exports){
(function (process){
'use strict';

var utils = require(25);
var normalizeHeaderName = require(22);

var PROTECTION_PREFIX = /^\)\]\}',?\n/;
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require(2);
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = require(2);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      data = data.replace(PROTECTION_PREFIX, '');
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMehtodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require(26))

},{"2":2,"22":22,"25":25,"26":26}],15:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],16:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],17:[function(require,module,exports){
'use strict';

var utils = require(25);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"25":25}],18:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
};

},{}],19:[function(require,module,exports){
'use strict';

var utils = require(25);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"25":25}],20:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],21:[function(require,module,exports){
'use strict';

var utils = require(25);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"25":25}],22:[function(require,module,exports){
'use strict';

var utils = require(25);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"25":25}],23:[function(require,module,exports){
'use strict';

var utils = require(25);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"25":25}],24:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],25:[function(require,module,exports){
'use strict';

var bind = require(15);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  typeof document.createElement -> undefined
 */
function isStandardBrowserEnv() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

},{"15":15}],26:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],27:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _interopDefault(ex) {
  return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
}

var videojs = _interopDefault((typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null));
var axios = _interopDefault(require(1));

// Default options for the plugin.
// const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
var registerPlugin = videojs.registerPlugin || videojs.plugin;

var isInIframe = function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

var getParameterByName = function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  if (!url) {
    url = window.location.href;
  }

  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

var getSyndicatedTag = function getSyndicatedTag(player) {
  var tags = player.mediainfo.tags;

  for (var i in tags) {
    if (tags[i].indexOf('syndicated=') >= 0) {
      // Getting the value of syndicated
      var syndicated = tags[i].split('=')[1];

      return syndicated;
    }
  }
  return false;
};

var addToIU = function addToIU(url, position, addition) {
  var iu = getParameterByName('iu', url);
  var originalIU = iu;

  if (iu.charAt(0) == '/') {
    iu = iu.substring(1);
  }

  var iuParts = iu.split('/');

  var arrayPosition = position - 1;

  for (var i = 0; i < arrayPosition; i++) {
    if (iuParts[i] == '') {
      iuParts[i] = 'video';
    }
  }

  iuParts[arrayPosition] = addition;

  iu = '/' + iuParts.join('/');

  return url.replace(originalIU, iu);
};

var getCustomParamsQueryString = function getCustomParamsQueryString(options) {

  var queryString = '';
  var requestUri = '';

  var amp_url = getParameterByName('linkbaseurl'); //currently assuming that if linkbaseurk is found its an amp page.
  if (amp_url) {
    queryString += 'environment=googleamp&';
    var urlobj = parseUrl(amp_url);
    requestUri = urlobj.pathname; //since its an amp page lets get the path from the linkbaseurl;
  } else {
    requestUri = getRequestUri();
  }

  if (requestUri) {
    var requestUriParts = requestUri.split('/');
    requestUriParts = removeEmptyElements(requestUriParts);
    queryString += 'section=' + (typeof requestUriParts[0] !== 'undefined' ? requestUriParts[0] : '') + '&';
    queryString += 'page=' + requestUriParts.join(',') + '&';
  }

  var adUtilityObject = getAdUtility();
  var adUtilTargetQueryString = getAdUtilTargetQueryString();

  if (adUtilityObject != false && adUtilityObject.sponsId != '') {
    queryString += 'SponsId=' + adUtilityObject.sponsId + '&';
  }

  if (adUtilTargetQueryString != false) {
    queryString += adUtilTargetQueryString;
  }

  if (queryString[queryString.length - 1] == '&') {
    // If last character is &
    queryString = queryString.substring(0, queryString.length - 1);
  }

  return queryString;
};

var removeEmptyElements = function removeEmptyElements(array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == '') {
      array.splice(i, 1);
      i--;
    }
  }
  return array;
};

var getAdUtilTargetQueryString = function getAdUtilTargetQueryString() {
  var adUtilTargetQueryString = '';
  var adUtilTargetObject = getAdUtilTarget();

  if (adUtilTargetObject == false) {
    return false;
  }

  var notTags = ['PostID', 'Author', 'Category', 'ContentType'];
  var elements = [];

  elements.Tags = '';

  for (var key in adUtilTargetObject) {
    var value = adUtilTargetObject[key];

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      value = value.join(',');
    }

    if (notTags.indexOf(key) >= 0) {
      elements[key] = value;
    } else {
      elements.Tags += value + ',';
    }
  }

  if (elements.Tags[elements.Tags.length - 1] == ',') {
    elements.Tags = elements.Tags.substring(0, elements.Tags.length - 1);
  }

  for (var _key in elements) {
    adUtilTargetQueryString += _key + '=' + elements[_key] + '&';
  }

  return adUtilTargetQueryString;
};

var getAdUtility = function getAdUtility() {
  var inIframe = isInIframe();

  if (inIframe) {
    try {
      if (typeof parent.adUtility !== 'undefined') {
        return parent.adUtility;
      }
    } catch ($e) {} // to catch cross-origin access
  } else if (typeof window.adUtility !== 'undefined') {
    return window.adUtility;
  }
  return false;
};

var getRequestUri = function getRequestUri() {
  var inIframe = isInIframe();
  var requestUri = window.location.pathname;

  if (inIframe) {
    try {
      requestUri = parent.location.pathname;
    } catch ($e) {
      // to catch cross-origin issues.
      requestUri = ''; // setting it to false, so as to not report wrong values.
    }
  }
  return requestUri;
};

var getAdUtilTarget = function getAdUtilTarget() {
  var inIframe = isInIframe();

  if (inIframe) {
    try {
      if (typeof parent.adutil_target !== 'undefined') {
        return parent.adutil_target;
      }
    } catch ($e) {} // to catch cross origin errors
  } else if (typeof window.adutil_target !== 'undefined') {
    return window.adutil_target;
  }
  return false;
};

var parseUrl = function parseUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a;
};

var getIndexAds = function getIndexAds(a, b) {
  if ("string" != typeof a || "object" != (typeof b === 'undefined' ? 'undefined' : _typeof(b))) return a;try {
    b = JSON.stringify(b);var c = window.location !== window.parent.location ? document.referrer : window.location.href,
        d = encodeURIComponent(a).replace(/(%7B)([^%]*)(%7D)/g, "{$2}");return console.log(d), "//as-sec.casalemedia.com/playlist?ix_id=%5Bindex_epr%5D&ix_v=8.8&ix_u=" + encodeURIComponent(c) + "&ix_vt=" + d + "&ix_s=191888&ix_vasd=0&ix_ca=" + encodeURIComponent('{"protocols": [2,3,5,6],"mimes":["video/mp4","video/webm","application/javascript","video/x-flv","application/x-shockwave-flash"],"apiList":[1, 2],"size":"640x360","timeout": 1000,"durations": [15,30]}') + "&ix_so=" + encodeURIComponent(b);
  } catch (b) {
    return a;
  }
};

//plugins to be loaded
var pluginFunctions = {

  setup_chartbeat: function setup_chartbeat(player, options) {
    player.chartbeat({
      uid: options.uid,
      domain: options.domain
    });
  },

  setup_streamsense: function setup_streamsense(player, options) {
    player.comscore({
      c2: options.c2,
      labelmapping: 'c3=' + options.c3 + ',c4=' + options.c4 + ',c6=' + options.c6 + ',ns_st_st=' + options.brand + ',ns_st_pu=' + options.publisher + ',ns_st_pr=' + options.ns_st_pr + ',ns_st_ep=' + options.ns_st_ep + ',ns_st_sn=' + options.ns_st_sn + ',ns_st_en=' + options.ns_st_en + ',ns_st_ge=' + options.ns_st_ge + ',ns_st_ti=' + options.ns_st_ti + ',ns_st_ia=' + options.ns_st_ia + ', ns_st_ce=' + options.ns_st_ce + ',ns_st_ddt=' + options.ns_st_ddt + ',ns_st_tdt= ' + options.ns_st_tdt
    });
  },

  setup_omniture: function setup_omniture(player, options) {
    var vs_account = 'rogersrmiradiodev';
    if (typeof options.site_catalyst_account !== 'undefined') {
      vs_account = options.site_catalyst_account;
    } else if (_typeof(window.s) === 'object') {
      vs_account = window.s.account;
    } else if (typeof window.s_account !== 'undefined') {
      vs_account = window.s_account;
    }

    var vs_channel = 'Video';

    if (typeof options.site_catalyst_brand !== 'undefined') {
      vs_channel = options.site_catalyst_brand;
    }

    var bcgs_adobe_config = {

      VISITOR_API: {
        MARKETING_CLOUD_ORG_ID: 'D7FD34FA53D63B860A490D44@AdobeOrg',
        NAMESPACE: 'rogersmedia', //
        TRACKING_SERVER: 'om.rogersmedia.com' // om.rogersmedia.com // needs tp change
      },

      APP_MEASUREMENT: {
        RSID: vs_account, // rogersrmiradiodev
        TRACKING_SERVER: 'om.rogersmedia.com' // om.rogersmedia.com
      },

      HEARTBEAT: {
        DISABLE: false, // disable if using milestone tracking
        TRACKING_SERVER: 'rogersmedia.hb.omtrdc.net', // om.rogersmedia.com
        PUBLISHER: 'D7FD34FA53D63B860A490D44@AdobeOrg',
        CHANNEL: vs_channel,
        OVP: 'Brightcove',
        SDK: '1.5.2',
        JOB_ID: 'sc_va',
        DEBUG_LOGGING: false
      },

      QUALITY: {
        AVERAGE_BITRATE: 0,
        TIME_TO_START: 0
      },

      CUSTOM_EVENT: {
        disable: true, // disable if using heartbeat tracking
        bc_data_mapping: {
          name: 'eVar106,prop2', // video name, accepts multiple eVars/props
          segment: 'eVar203', // current milestone (e.g., '1:M:0-25')
          contentType: 'eVar201', // content type (e.g., 'video' or 'ad')
          timePlayed: 'event203', // amount of time played since last tracking event, tracked with milestone events
          view: 'event201', // video start event
          segmentView: 'event202', // general milestone tracking event, tracked with milestone events
          complete: 'event207', // video complete event
          milestones: { // milestones in percent; milestones can be added/removed from list
            25: 'event204', // 25%
            50: 'event205', // 50%
            75: 'event206' // 75%
          }
        },
        // keep to track volume change events
        bc_volumechange: {
          event: 'event208', // event tracking number
          evar: 'prop1' // the new volume chosen by the user (from 0-1.00), only one prop/eVar supported here
        },
        // keep to track when user has paused an ad
        bc_ad_pause: {
          event: 'event209', // event tracking number
          evar: 'eVar205' // time value of pausing an ad, only one prop/eVar supported here
        },
        // keep to track when user enters full screen mode
        bc_fullscreen_enter: {
          event: 'event212' // event tracking number
        },
        // keep to track when user exits full screen mode
        bc_fullscreen_exit: {
          event: 'event213' // event tracking number
        },
        // keep to track when user opens social share menu
        bc_social_opened: {
          event: 'event214' // event tracking number
        },
        // keep to track when user closes social share menu
        bc_social_closed: {
          event: 'event215' // event tracking number
        }
      }
    };

    player.BCGSAdobeAnalyticsPlugin({
      options: bcgs_adobe_config
    });
  },

  setup_ima3: function setup_ima3(player, options) {

    var adServerUrl = '';

    if (typeof player.ima3.settings !== 'undefined') {
      adServerUrl = player.ima3.settings.serverUrl;
    }

    if (options.ad_server_url != '') {
      adServerUrl = options.ad_server_url;
    }

    // if it is loaded from brightcove
    if (options.syndicated_enable) {
      var syndicated = getSyndicatedTag(player);

      if (syndicated) {
        adServerUrl = addToIU(adServerUrl, 5, syndicated);
      }
    }

    var customParams = getCustomParamsQueryString(options);

    if (customParams != '') {
      adServerUrl += '&cust_params=' + encodeURIComponent(customParams);
    }

    //index bidding exchange
    if (options.hasOwnProperty('index_bidding_ad_server_url_exchange') && options.index_bidding_ad_server_url_exchange.hasOwnProperty('index_bidding_ad_exchange_site_id')) {
      var so = options.index_bidding_ad_server_url_exchange.index_bidding_ad_exchange_site_id;
      adServerUrl = getIndexAds(adServerUrl, so);
    }

    if (typeof player.ima3 !== 'undefined' && _typeof(player.ima3) !== 'object') {
      player.ima3({
        adTechOrder: ['html5', 'flash'],
        debug: false,
        timeout: 7000,
        requestMode: 'onload',
        loadingSpinner: true,
        serverUrl: adServerUrl
      });
    } else {
      player.ima3.settings.serverUrl = adServerUrl;
    }

    if (typeof options.ad_macro_replacement !== 'undefined') {
      player.ima3.adMacroReplacement = function (url) {
        var parameters = options.ad_macro_replacement;

        for (var i in parameters) {
          url = url.split(i).join(encodeURIComponent(parameters[i]));
        }
        return url;
      };
    }
  },
  setupMoat: function setupMoat(player, options) {
    player.Moat({
      partnerCode: options.partner_code
    });
  },
  setup_displaytitle: function setup_displaytitle(player, options) {
    player.displaytitle({ "advertisement_title": options.advertisement_title });
  }
};

var setupErrorHandlers = function setupErrorHandlers(player) {

  // handling Geo-restricted errors.
  player.one('bc-catalog-error', function () {
    var rPlayer = this,
        specificError = void 0;

    rPlayer.errors({
      errors: {
        '-3': {
          headline: 'This video is not available in your region.',
          type: 'CLIENT_GEO'
        }
      }
    });

    if (typeof rPlayer.catalog.error !== 'undefined') {
      specificError = rPlayer.catalog.error.data[0];
      if (specificError !== 'undefined' && specificError.error_subcode == 'CLIENT_GEO') {
        rPlayer.error({ code: '-3' });
      }
    }
  });
};

var initPlugin = function initPlugin(player, plugins) {

  var ready_events = [];
  var other_events = [];
  for (var key in plugins) {

    var setup_key = 'setup_' + key;
    // skip loop if the property is from prototype
    if (!pluginFunctions.hasOwnProperty(setup_key)) continue;

    var options = plugins[key];
    if (options.hasOwnProperty('loading_event')) {
      if (options.loading_event === 'ready') {
        ready_events.push({ 'func': setup_key, 'options': options });
      } else {
        other_events.push({ 'func': setup_key, 'options': options });
      }
    }
  }

  if (ready_events.length > 0) {
    player.ready(function () {
      for (var _key2 in ready_events) {
        var func = ready_events[_key2].func;
        var _options = ready_events[_key2].options;
        pluginFunctions[func](player, _options);
      }
    });
  }

  if (other_events.length > 0) {
    var _loop = function _loop(_key3) {
      var func = other_events[_key3].func;
      var options = other_events[_key3].options;
      player.one(options.loading_event, function () {
        pluginFunctions[func](player, options);
      });
    };

    for (var _key3 in other_events) {
      _loop(_key3);
    }
  }

  /**
   * Fixes autoplay bug
   */
  player.on('adsready', function () {
    // Ensure the setup vars were set
    if (player.tagAttributes['data-setup']) {
      // Parse it to JS
      var setup_vars = JSON.parse(player.tagAttributes['data-setup']);

      if (typeof setup_vars.autoplay_var !== 'undefined') {
        if (setup_vars.autoplay_var === true && player.ads.state != 'ad-playback') {
          player.play();
        }
      }
    }
  });

  /**
   * setup custom error handlers
   */
  setupErrorHandlers(player);
};

var getPluginConfigUrl = function getPluginConfigUrl(options) {
  //get parameter takes precedence
  var plugin_url = getParameterByName('pluginConfig');
  if (plugin_url) {
    return plugin_url;
  }

  //check in the options
  if (typeof options.plugin_config !== 'undefined') {
    return options.plugin_config;
  }

  return null;
};
/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. On ready we initialize the plugins that are required.
 *
 * @function rdmPluginLoader
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var rdmPluginLoader = function rdmPluginLoader(options) {

  var player = this;

  if (typeof window !== 'undefined' && typeof window.plugins === 'undefined') {

    var plugin_config_url = getPluginConfigUrl(options);
    if (plugin_config_url) {
      axios.get(plugin_config_url).then(function (response) {
        if (response.status === 200) {
          options = response.data;
          initPlugin(player, options);
        }
      }).catch(function (error) {
        console.error(error);
      });
    } else {
      console.error("Plugin config url was not found");
    }
  } else {
    initPlugin(player, window.plugins);
  }
};

// Register the plugin with video.js.
registerPlugin('rdmPluginLoader', rdmPluginLoader);

// Include the version number.
rdmPluginLoader.VERSION = '2.96';

module.exports = rdmPluginLoader;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"1":1}]},{},[27])(27)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J0b2EuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwibm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIm5vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInNyYy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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T0FBUCxHQUFpQixlQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoMyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBidG9hID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5idG9hICYmIHdpbmRvdy5idG9hLmJpbmQod2luZG93KSkgfHwgcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J0b2EnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB2YXIgbG9hZEV2ZW50ID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG4gICAgdmFyIHhEb21haW4gPSBmYWxzZTtcblxuICAgIC8vIEZvciBJRSA4LzkgQ09SUyBzdXBwb3J0XG4gICAgLy8gT25seSBzdXBwb3J0cyBQT1NUIGFuZCBHRVQgY2FsbHMgYW5kIGRvZXNuJ3QgcmV0dXJucyB0aGUgcmVzcG9uc2UgaGVhZGVycy5cbiAgICAvLyBET04nVCBkbyB0aGlzIGZvciB0ZXN0aW5nIGIvYyBYTUxIdHRwUmVxdWVzdCBpcyBtb2NrZWQsIG5vdCBYRG9tYWluUmVxdWVzdC5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0JyAmJlxuICAgICAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICB3aW5kb3cuWERvbWFpblJlcXVlc3QgJiYgISgnd2l0aENyZWRlbnRpYWxzJyBpbiByZXF1ZXN0KSAmJlxuICAgICAgICAhaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSB7XG4gICAgICByZXF1ZXN0ID0gbmV3IHdpbmRvdy5YRG9tYWluUmVxdWVzdCgpO1xuICAgICAgbG9hZEV2ZW50ID0gJ29ubG9hZCc7XG4gICAgICB4RG9tYWluID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uIGhhbmRsZVByb2dyZXNzKCkge307XG4gICAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7fTtcbiAgICB9XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkIHx8ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0W2xvYWRFdmVudF0gPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IChyZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQgJiYgIXhEb21haW4pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIC8vIElFIHNlbmRzIDEyMjMgaW5zdGVhZCBvZiAyMDQgKGh0dHBzOi8vZ2l0aHViLmNvbS9temFicmlza2llL2F4aW9zL2lzc3Vlcy8yMDEpXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXMgPT09IDEyMjMgPyAnTm8gQ29udGVudCcgOiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIHZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcblxuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGNvbmZpZy51cmwpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHJlcXVlc3QucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHJlcXVlc3REYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKDI1KTtcbnZhciBiaW5kID0gcmVxdWlyZSgxNSk7XG52YXIgQXhpb3MgPSByZXF1aXJlKDcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgxNCk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKHV0aWxzLm1lcmdlKGRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKDQpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKDUpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKDYpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgyNCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKDQpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoMTQpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgyNSk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSg4KTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKDEwKTtcbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgyMCk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKDE4KTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IHV0aWxzLm1lcmdlKHtcbiAgICAgIHVybDogYXJndW1lbnRzWzBdXG4gICAgfSwgYXJndW1lbnRzWzFdKTtcbiAgfVxuXG4gIGNvbmZpZyA9IHV0aWxzLm1lcmdlKGRlZmF1bHRzLCB0aGlzLmRlZmF1bHRzLCB7IG1ldGhvZDogJ2dldCcgfSwgY29uZmlnKTtcblxuICAvLyBTdXBwb3J0IGJhc2VVUkwgY29uZmlnXG4gIGlmIChjb25maWcuYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChjb25maWcudXJsKSkge1xuICAgIGNvbmZpZy51cmwgPSBjb21iaW5lVVJMcyhjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHV0aWxzLm1lcmdlKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybFxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoMjUpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKDExKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiBAIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgyNSk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoMTMpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSg2KTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoMTQpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnMgfHwge31cbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gQCBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoOSk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoMjUpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgUFJPVEVDVElPTl9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoUFJPVEVDVElPTl9QUkVGSVgsICcnKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1laHRvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGJ0b2EgcG9seWZpbGwgZm9yIElFPDEwIGNvdXJ0ZXN5IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGNoYW1iZXJzL0Jhc2U2NC5qc1xuXG52YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBFKCkge1xuICB0aGlzLm1lc3NhZ2UgPSAnU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyJztcbn1cbkUucHJvdG90eXBlID0gbmV3IEVycm9yO1xuRS5wcm90b3R5cGUuY29kZSA9IDU7XG5FLnByb3RvdHlwZS5uYW1lID0gJ0ludmFsaWRDaGFyYWN0ZXJFcnJvcic7XG5cbmZ1bmN0aW9uIGJ0b2EoaW5wdXQpIHtcbiAgdmFyIHN0ciA9IFN0cmluZyhpbnB1dCk7XG4gIHZhciBvdXRwdXQgPSAnJztcbiAgZm9yIChcbiAgICAvLyBpbml0aWFsaXplIHJlc3VsdCBhbmQgY291bnRlclxuICAgIHZhciBibG9jaywgY2hhckNvZGUsIGlkeCA9IDAsIG1hcCA9IGNoYXJzO1xuICAgIC8vIGlmIHRoZSBuZXh0IHN0ciBpbmRleCBkb2VzIG5vdCBleGlzdDpcbiAgICAvLyAgIGNoYW5nZSB0aGUgbWFwcGluZyB0YWJsZSB0byBcIj1cIlxuICAgIC8vICAgY2hlY2sgaWYgZCBoYXMgbm8gZnJhY3Rpb25hbCBkaWdpdHNcbiAgICBzdHIuY2hhckF0KGlkeCB8IDApIHx8IChtYXAgPSAnPScsIGlkeCAlIDEpO1xuICAgIC8vIFwiOCAtIGlkeCAlIDEgKiA4XCIgZ2VuZXJhdGVzIHRoZSBzZXF1ZW5jZSAyLCA0LCA2LCA4XG4gICAgb3V0cHV0ICs9IG1hcC5jaGFyQXQoNjMgJiBibG9jayA+PiA4IC0gaWR4ICUgMSAqIDgpXG4gICkge1xuICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoaWR4ICs9IDMgLyA0KTtcbiAgICBpZiAoY2hhckNvZGUgPiAweEZGKSB7XG4gICAgICB0aHJvdyBuZXcgRSgpO1xuICAgIH1cbiAgICBibG9jayA9IGJsb2NrIDw8IDggfCBjaGFyQ29kZTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ0b2E7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoMjUpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lNDAvZ2ksICdAJykuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKDI1KTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoMjUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgdmFyIG9yaWdpblVSTDtcblxuICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICB9XG5cbiAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgIH07XG4gICAgfVxuXG4gICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoMjUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKDI1KTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgxNSk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgLT4gdW5kZWZpbmVkXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50ID09PSAnZnVuY3Rpb24nXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiAhaXNBcnJheShvYmopKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodHlwZW9mIHJlc3VsdFtrZXldID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW1cbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHQgKGV4KSB7IHJldHVybiAoZXggJiYgKHR5cGVvZiBleCA9PT0gJ29iamVjdCcpICYmICdkZWZhdWx0JyBpbiBleCkgPyBleFsnZGVmYXVsdCddIDogZXg7IH1cblxudmFyIHZpZGVvanMgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgndmlkZW8uanMnKSk7XG52YXIgYXhpb3MgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgnYXhpb3MnKSk7XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbi8vIGNvbnN0IGRlZmF1bHRzID0ge307XG5cbi8vIENyb3NzLWNvbXBhdGliaWxpdHkgZm9yIFZpZGVvLmpzIDUgYW5kIDYuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG5cbmNvbnN0IGlzSW5JZnJhbWUgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbmNvbnN0IGdldFBhcmFtZXRlckJ5TmFtZSA9IChuYW1lLCB1cmwpID0+IHtcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpO1xuICBpZiAoIXVybCkge1xuICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB9XG5cbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcblxuICBpZiAoIXJlc3VsdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIXJlc3VsdHNbMl0pIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuY29uc3QgZ2V0U3luZGljYXRlZFRhZyA9IChwbGF5ZXIpID0+IHtcbiAgY29uc3QgdGFncyA9IHBsYXllci5tZWRpYWluZm8udGFncztcblxuICBmb3IgKGNvbnN0IGkgaW4gdGFncykge1xuICAgIGlmICh0YWdzW2ldLmluZGV4T2YoJ3N5bmRpY2F0ZWQ9JykgPj0gMCkge1xuICAgICAgLy8gR2V0dGluZyB0aGUgdmFsdWUgb2Ygc3luZGljYXRlZFxuICAgICAgY29uc3Qgc3luZGljYXRlZCA9IHRhZ3NbaV0uc3BsaXQoJz0nKVsxXTtcblxuICAgICAgcmV0dXJuIHN5bmRpY2F0ZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGFkZFRvSVUgPSAodXJsLCBwb3NpdGlvbiwgYWRkaXRpb24pID0+IHtcbiAgbGV0IGl1ID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdpdScsIHVybCk7XG4gIGNvbnN0IG9yaWdpbmFsSVUgPSBpdTtcblxuICBpZiAoaXUuY2hhckF0KDApID09ICcvJykge1xuICAgIGl1ID0gaXUuc3Vic3RyaW5nKDEpO1xuICB9XG5cbiAgY29uc3QgaXVQYXJ0cyA9IGl1LnNwbGl0KCcvJyk7XG5cbiAgY29uc3QgYXJyYXlQb3NpdGlvbiA9IHBvc2l0aW9uIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5UG9zaXRpb247IGkrKykge1xuICAgIGlmIChpdVBhcnRzW2ldID09ICcnKSB7XG4gICAgICBpdVBhcnRzW2ldID0gJ3ZpZGVvJztcbiAgICB9XG4gIH1cblxuICBpdVBhcnRzW2FycmF5UG9zaXRpb25dID0gYWRkaXRpb247XG5cbiAgaXUgPSAnLycgKyBpdVBhcnRzLmpvaW4oJy8nKTtcblxuICByZXR1cm4gdXJsLnJlcGxhY2Uob3JpZ2luYWxJVSwgaXUpO1xufTtcblxuY29uc3QgZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmcgPSAob3B0aW9ucykgPT4ge1xuXG4gIGxldCBxdWVyeVN0cmluZyA9ICcnO1xuICBsZXQgcmVxdWVzdFVyaSA9ICcnO1xuXG4gIGNvbnN0IGFtcF91cmwgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2xpbmtiYXNldXJsJyk7Ly9jdXJyZW50bHkgYXNzdW1pbmcgdGhhdCBpZiBsaW5rYmFzZXVyayBpcyBmb3VuZCBpdHMgYW4gYW1wIHBhZ2UuXG4gIGlmKGFtcF91cmwpe1xuICAgIHF1ZXJ5U3RyaW5nICs9ICdlbnZpcm9ubWVudD1nb29nbGVhbXAmJztcbiAgICBjb25zdCB1cmxvYmogPSBwYXJzZVVybChhbXBfdXJsKTtcbiAgICByZXF1ZXN0VXJpID0gdXJsb2JqLnBhdGhuYW1lOyAvL3NpbmNlIGl0cyBhbiBhbXAgcGFnZSBsZXRzIGdldCB0aGUgcGF0aCBmcm9tIHRoZSBsaW5rYmFzZXVybDtcblxuICB9XG4gIGVsc2V7XG4gICAgcmVxdWVzdFVyaSA9IGdldFJlcXVlc3RVcmkoKTtcbiAgfVxuXG4gIGlmKHJlcXVlc3RVcmkpIHtcbiAgICBsZXQgcmVxdWVzdFVyaVBhcnRzID0gcmVxdWVzdFVyaS5zcGxpdCgnLycpO1xuICAgIHJlcXVlc3RVcmlQYXJ0cyA9IHJlbW92ZUVtcHR5RWxlbWVudHMocmVxdWVzdFVyaVBhcnRzKTtcbiAgICBxdWVyeVN0cmluZyArPSAnc2VjdGlvbj0nICsgKCAodHlwZW9mIHJlcXVlc3RVcmlQYXJ0c1swXSAhPT0gJ3VuZGVmaW5lZCcpICA/IHJlcXVlc3RVcmlQYXJ0c1swXSA6ICcnICkgKyAnJic7XG4gICAgcXVlcnlTdHJpbmcgKz0gJ3BhZ2U9JyArIHJlcXVlc3RVcmlQYXJ0cy5qb2luKCcsJykgKyAnJic7XG4gIH1cblxuICBjb25zdCBhZFV0aWxpdHlPYmplY3QgPSBnZXRBZFV0aWxpdHkoKTtcbiAgY29uc3QgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSBnZXRBZFV0aWxUYXJnZXRRdWVyeVN0cmluZygpO1xuXG4gIGlmIChhZFV0aWxpdHlPYmplY3QgIT0gZmFsc2UgJiYgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgIT0gJycpIHtcbiAgICBxdWVyeVN0cmluZyArPSAnU3BvbnNJZD0nICsgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgKyAnJic7XG4gIH1cblxuICBpZiAoYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgIT0gZmFsc2UpIHtcbiAgICBxdWVyeVN0cmluZyArPSBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbiAgfVxuXG4gIGlmIChxdWVyeVN0cmluZ1txdWVyeVN0cmluZy5sZW5ndGggLSAxXSA9PSAnJicpIHsgLy8gSWYgbGFzdCBjaGFyYWN0ZXIgaXMgJlxuICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDAsIHF1ZXJ5U3RyaW5nLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgcmVtb3ZlRW1wdHlFbGVtZW50cyA9IChhcnJheSkgPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09ICcnKSB7XG4gICAgICBhcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICBpLS07XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICBsZXQgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSAnJztcbiAgY29uc3QgYWRVdGlsVGFyZ2V0T2JqZWN0ID0gZ2V0QWRVdGlsVGFyZ2V0KCk7XG5cbiAgaWYgKGFkVXRpbFRhcmdldE9iamVjdCA9PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG5vdFRhZ3MgPSBbJ1Bvc3RJRCcsICdBdXRob3InLCAnQ2F0ZWdvcnknLCAnQ29udGVudFR5cGUnXTtcbiAgY29uc3QgZWxlbWVudHMgPSBbXTtcblxuICBlbGVtZW50cy5UYWdzID0gJyc7XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gYWRVdGlsVGFyZ2V0T2JqZWN0KSB7XG4gICAgbGV0IHZhbHVlID0gYWRVdGlsVGFyZ2V0T2JqZWN0W2tleV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKCcsJyk7XG4gICAgfVxuXG4gICAgaWYgKG5vdFRhZ3MuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgIGVsZW1lbnRzW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudHMuVGFncyArPSB2YWx1ZSArICcsJztcbiAgICB9XG4gIH1cblxuICBpZiAoZWxlbWVudHMuVGFnc1tlbGVtZW50cy5UYWdzLmxlbmd0aCAtIDFdID09ICcsJykge1xuICAgIGVsZW1lbnRzLlRhZ3MgPSBlbGVtZW50cy5UYWdzLnN1YnN0cmluZygwLCBlbGVtZW50cy5UYWdzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gZWxlbWVudHMpIHtcbiAgICBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyArPSBrZXkgKyAnPScgKyBlbGVtZW50c1trZXldICsgJyYnO1xuICB9XG5cbiAgcmV0dXJuIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgZ2V0QWRVdGlsaXR5ID0gKCkgPT4ge1xuICBjb25zdCBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcblxuICBpZiAoaW5JZnJhbWUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuYWRVdGlsaXR5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcGFyZW50LmFkVXRpbGl0eTtcbiAgICAgIH1cbiAgICB9IGNhdGNoICgkZSkge1xuICAgIH0gLy8gdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGFjY2Vzc1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYWRVdGlsaXR5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3cuYWRVdGlsaXR5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJlcXVlc3RVcmkgPSAoKSA9PiB7XG4gIGNvbnN0IGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuICBsZXQgcmVxdWVzdFVyaSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICBpZiAoaW5JZnJhbWUpIHtcbiAgICB0cnkge1xuICAgICAgcmVxdWVzdFVyaSA9IHBhcmVudC5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9IGNhdGNoICgkZSkgey8vIHRvIGNhdGNoIGNyb3NzLW9yaWdpbiBpc3N1ZXMuXG4gICAgICByZXF1ZXN0VXJpID0gJyc7IC8vIHNldHRpbmcgaXQgdG8gZmFsc2UsIHNvIGFzIHRvIG5vdCByZXBvcnQgd3JvbmcgdmFsdWVzLlxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVxdWVzdFVyaTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldCA9ICgpID0+IHtcbiAgY29uc3QgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgaWYgKGluSWZyYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkdXRpbF90YXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQuYWR1dGlsX3RhcmdldDtcbiAgICAgIH1cbiAgICB9IGNhdGNoICgkZSkge1xuICAgIH0gLy8gdG8gY2F0Y2ggY3Jvc3Mgb3JpZ2luIGVycm9yc1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYWR1dGlsX3RhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LmFkdXRpbF90YXJnZXQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgcGFyc2VVcmwgPSAoIHVybCApID0+IHtcbiAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGEuaHJlZiA9IHVybDtcbiAgcmV0dXJuIGE7XG59O1xuXG5jb25zdCBnZXRJbmRleEFkcz0gKGEsYikgPT4ge2lmKFwic3RyaW5nXCIhPXR5cGVvZiBhfHxcIm9iamVjdFwiIT10eXBlb2YgYilyZXR1cm4gYTt0cnl7Yj1KU09OLnN0cmluZ2lmeShiKTt2YXIgYz13aW5kb3cubG9jYXRpb24hPT13aW5kb3cucGFyZW50LmxvY2F0aW9uP2RvY3VtZW50LnJlZmVycmVyOndpbmRvdy5sb2NhdGlvbi5ocmVmLGQ9ZW5jb2RlVVJJQ29tcG9uZW50KGEpLnJlcGxhY2UoLyglN0IpKFteJV0qKSglN0QpL2csXCJ7JDJ9XCIpO3JldHVybiBjb25zb2xlLmxvZyhkKSxcIi8vYXMtc2VjLmNhc2FsZW1lZGlhLmNvbS9wbGF5bGlzdD9peF9pZD0lNUJpbmRleF9lcHIlNUQmaXhfdj04LjgmaXhfdT1cIitlbmNvZGVVUklDb21wb25lbnQoYykrXCImaXhfdnQ9XCIrZCtcIiZpeF9zPTE5MTg4OCZpeF92YXNkPTAmaXhfY2E9XCIrZW5jb2RlVVJJQ29tcG9uZW50KCd7XCJwcm90b2NvbHNcIjogWzIsMyw1LDZdLFwibWltZXNcIjpbXCJ2aWRlby9tcDRcIixcInZpZGVvL3dlYm1cIixcImFwcGxpY2F0aW9uL2phdmFzY3JpcHRcIixcInZpZGVvL3gtZmx2XCIsXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiXSxcImFwaUxpc3RcIjpbMSwgMl0sXCJzaXplXCI6XCI2NDB4MzYwXCIsXCJ0aW1lb3V0XCI6IDEwMDAsXCJkdXJhdGlvbnNcIjogWzE1LDMwXX0nKStcIiZpeF9zbz1cIitlbmNvZGVVUklDb21wb25lbnQoYil9Y2F0Y2goYil7cmV0dXJuIGF9fTtcblxuLy9wbHVnaW5zIHRvIGJlIGxvYWRlZFxuY29uc3QgcGx1Z2luRnVuY3Rpb25zID0ge1xuXG4gIHNldHVwX2NoYXJ0YmVhdDogKHBsYXllciwgb3B0aW9ucykgPT4ge1xuICAgIHBsYXllci5jaGFydGJlYXQoe1xuICAgICAgdWlkOiBvcHRpb25zLnVpZCxcbiAgICAgIGRvbWFpbjogb3B0aW9ucy5kb21haW5cbiAgICB9KTtcbiAgfSxcblxuICBzZXR1cF9zdHJlYW1zZW5zZTogKHBsYXllciwgb3B0aW9ucykgPT4ge1xuICAgIHBsYXllci5jb21zY29yZSh7XG4gICAgICBjMjogb3B0aW9ucy5jMixcbiAgICAgIGxhYmVsbWFwcGluZzogJ2MzPScgKyBvcHRpb25zLmMzICsgJyxjND0nICsgb3B0aW9ucy5jNCArICcsYzY9JyArIG9wdGlvbnMuYzYgKyAnLG5zX3N0X3N0PScgKyBvcHRpb25zLmJyYW5kICsgJyxuc19zdF9wdT0nICsgb3B0aW9ucy5wdWJsaXNoZXIgKyAnLG5zX3N0X3ByPScgKyBvcHRpb25zLm5zX3N0X3ByICsgJyxuc19zdF9lcD0nICsgb3B0aW9ucy5uc19zdF9lcCArICcsbnNfc3Rfc249JyArIG9wdGlvbnMubnNfc3Rfc24gKyAnLG5zX3N0X2VuPScgKyBvcHRpb25zLm5zX3N0X2VuICsgJyxuc19zdF9nZT0nICsgb3B0aW9ucy5uc19zdF9nZSArICcsbnNfc3RfdGk9JyArIG9wdGlvbnMubnNfc3RfdGkgKyAnLG5zX3N0X2lhPScgKyBvcHRpb25zLm5zX3N0X2lhICsgJywgbnNfc3RfY2U9JyArIG9wdGlvbnMubnNfc3RfY2UgKyAnLG5zX3N0X2RkdD0nICsgb3B0aW9ucy5uc19zdF9kZHQgKyAnLG5zX3N0X3RkdD0gJyArIG9wdGlvbnMubnNfc3RfdGR0XG4gICAgfSk7XG4gIH0sXG5cbiAgc2V0dXBfb21uaXR1cmU6ICAocGxheWVyLCBvcHRpb25zKSA9PiB7XG4gICAgbGV0IHZzX2FjY291bnQgPSAncm9nZXJzcm1pcmFkaW9kZXYnO1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaXRlX2NhdGFseXN0X2FjY291bnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2c19hY2NvdW50ID0gb3B0aW9ucy5zaXRlX2NhdGFseXN0X2FjY291bnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93LnMgPT09ICdvYmplY3QnKSB7XG4gICAgICB2c19hY2NvdW50ID0gd2luZG93LnMuYWNjb3VudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuc19hY2NvdW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdnNfYWNjb3VudCA9IHdpbmRvdy5zX2FjY291bnQ7XG4gICAgfVxuXG4gICAgbGV0IHZzX2NoYW5uZWwgPSAnVmlkZW8nO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnNpdGVfY2F0YWx5c3RfYnJhbmQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2c19jaGFubmVsID0gb3B0aW9ucy5zaXRlX2NhdGFseXN0X2JyYW5kO1xuICAgIH1cblxuICAgIGNvbnN0IGJjZ3NfYWRvYmVfY29uZmlnID0ge1xuXG4gICAgICBWSVNJVE9SX0FQSToge1xuICAgICAgICBNQVJLRVRJTkdfQ0xPVURfT1JHX0lEOiAnRDdGRDM0RkE1M0Q2M0I4NjBBNDkwRDQ0QEFkb2JlT3JnJyxcbiAgICAgICAgTkFNRVNQQUNFOiAncm9nZXJzbWVkaWEnLCAvL1xuICAgICAgICBUUkFDS0lOR19TRVJWRVI6ICdvbS5yb2dlcnNtZWRpYS5jb20nIC8vIG9tLnJvZ2Vyc21lZGlhLmNvbSAvLyBuZWVkcyB0cCBjaGFuZ2VcbiAgICAgIH0sXG5cbiAgICAgIEFQUF9NRUFTVVJFTUVOVDoge1xuICAgICAgICBSU0lEOiB2c19hY2NvdW50LCAvLyByb2dlcnNybWlyYWRpb2RldlxuICAgICAgICBUUkFDS0lOR19TRVJWRVI6ICdvbS5yb2dlcnNtZWRpYS5jb20nIC8vIG9tLnJvZ2Vyc21lZGlhLmNvbVxuICAgICAgfSxcblxuICAgICAgSEVBUlRCRUFUOiB7XG4gICAgICAgIERJU0FCTEU6IGZhbHNlLCAvLyBkaXNhYmxlIGlmIHVzaW5nIG1pbGVzdG9uZSB0cmFja2luZ1xuICAgICAgICBUUkFDS0lOR19TRVJWRVI6ICdyb2dlcnNtZWRpYS5oYi5vbXRyZGMubmV0JywgLy8gb20ucm9nZXJzbWVkaWEuY29tXG4gICAgICAgIFBVQkxJU0hFUjogJ0Q3RkQzNEZBNTNENjNCODYwQTQ5MEQ0NEBBZG9iZU9yZycsXG4gICAgICAgIENIQU5ORUw6IHZzX2NoYW5uZWwsXG4gICAgICAgIE9WUDogJ0JyaWdodGNvdmUnLFxuICAgICAgICBTREs6ICcxLjUuMicsXG4gICAgICAgIEpPQl9JRDogJ3NjX3ZhJyxcbiAgICAgICAgREVCVUdfTE9HR0lORzogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIFFVQUxJVFk6IHtcbiAgICAgICAgQVZFUkFHRV9CSVRSQVRFOiAwLFxuICAgICAgICBUSU1FX1RPX1NUQVJUOiAwXG4gICAgICB9LFxuXG4gICAgICBDVVNUT01fRVZFTlQ6IHtcbiAgICAgICAgZGlzYWJsZTogdHJ1ZSwgLy8gZGlzYWJsZSBpZiB1c2luZyBoZWFydGJlYXQgdHJhY2tpbmdcbiAgICAgICAgYmNfZGF0YV9tYXBwaW5nOiB7XG4gICAgICAgICAgbmFtZTogJ2VWYXIxMDYscHJvcDInLCAvLyB2aWRlbyBuYW1lLCBhY2NlcHRzIG11bHRpcGxlIGVWYXJzL3Byb3BzXG4gICAgICAgICAgc2VnbWVudDogJ2VWYXIyMDMnLCAvLyBjdXJyZW50IG1pbGVzdG9uZSAoZS5nLiwgJzE6TTowLTI1JylcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2VWYXIyMDEnLCAvLyBjb250ZW50IHR5cGUgKGUuZy4sICd2aWRlbycgb3IgJ2FkJylcbiAgICAgICAgICB0aW1lUGxheWVkOiAnZXZlbnQyMDMnLCAvLyBhbW91bnQgb2YgdGltZSBwbGF5ZWQgc2luY2UgbGFzdCB0cmFja2luZyBldmVudCwgdHJhY2tlZCB3aXRoIG1pbGVzdG9uZSBldmVudHNcbiAgICAgICAgICB2aWV3OiAnZXZlbnQyMDEnLCAvLyB2aWRlbyBzdGFydCBldmVudFxuICAgICAgICAgIHNlZ21lbnRWaWV3OiAnZXZlbnQyMDInLCAvLyBnZW5lcmFsIG1pbGVzdG9uZSB0cmFja2luZyBldmVudCwgdHJhY2tlZCB3aXRoIG1pbGVzdG9uZSBldmVudHNcbiAgICAgICAgICBjb21wbGV0ZTogJ2V2ZW50MjA3JywgLy8gdmlkZW8gY29tcGxldGUgZXZlbnRcbiAgICAgICAgICBtaWxlc3RvbmVzOiB7IC8vIG1pbGVzdG9uZXMgaW4gcGVyY2VudDsgbWlsZXN0b25lcyBjYW4gYmUgYWRkZWQvcmVtb3ZlZCBmcm9tIGxpc3RcbiAgICAgICAgICAgIDI1OiAnZXZlbnQyMDQnLCAvLyAyNSVcbiAgICAgICAgICAgIDUwOiAnZXZlbnQyMDUnLCAvLyA1MCVcbiAgICAgICAgICAgIDc1OiAnZXZlbnQyMDYnIC8vIDc1JVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB2b2x1bWUgY2hhbmdlIGV2ZW50c1xuICAgICAgICBiY192b2x1bWVjaGFuZ2U6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjA4JywgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgICAgZXZhcjogJ3Byb3AxJyAvLyB0aGUgbmV3IHZvbHVtZSBjaG9zZW4gYnkgdGhlIHVzZXIgKGZyb20gMC0xLjAwKSwgb25seSBvbmUgcHJvcC9lVmFyIHN1cHBvcnRlZCBoZXJlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgd2hlbiB1c2VyIGhhcyBwYXVzZWQgYW4gYWRcbiAgICAgICAgYmNfYWRfcGF1c2U6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjA5JywgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgICAgZXZhcjogJ2VWYXIyMDUnIC8vIHRpbWUgdmFsdWUgb2YgcGF1c2luZyBhbiBhZCwgb25seSBvbmUgcHJvcC9lVmFyIHN1cHBvcnRlZCBoZXJlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgd2hlbiB1c2VyIGVudGVycyBmdWxsIHNjcmVlbiBtb2RlXG4gICAgICAgIGJjX2Z1bGxzY3JlZW5fZW50ZXI6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjEyJyAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB3aGVuIHVzZXIgZXhpdHMgZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICBiY19mdWxsc2NyZWVuX2V4aXQ6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjEzJyAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB3aGVuIHVzZXIgb3BlbnMgc29jaWFsIHNoYXJlIG1lbnVcbiAgICAgICAgYmNfc29jaWFsX29wZW5lZDoge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMTQnIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHdoZW4gdXNlciBjbG9zZXMgc29jaWFsIHNoYXJlIG1lbnVcbiAgICAgICAgYmNfc29jaWFsX2Nsb3NlZDoge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMTUnIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBsYXllci5CQ0dTQWRvYmVBbmFseXRpY3NQbHVnaW4oe1xuICAgICAgb3B0aW9uczogYmNnc19hZG9iZV9jb25maWdcbiAgICB9KTtcbiAgfSxcblxuICBzZXR1cF9pbWEzOiAocGxheWVyLCBvcHRpb25zKSA9PiB7XG5cbiAgICBsZXQgYWRTZXJ2ZXJVcmwgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMuc2V0dGluZ3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBhZFNlcnZlclVybCA9IHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hZF9zZXJ2ZXJfdXJsICE9ICcnKSB7XG4gICAgICBhZFNlcnZlclVybCA9IG9wdGlvbnMuYWRfc2VydmVyX3VybDtcbiAgICB9XG5cbiAgLy8gaWYgaXQgaXMgbG9hZGVkIGZyb20gYnJpZ2h0Y292ZVxuICAgIGlmIChvcHRpb25zLnN5bmRpY2F0ZWRfZW5hYmxlKSB7XG4gICAgICBjb25zdCBzeW5kaWNhdGVkID0gZ2V0U3luZGljYXRlZFRhZyhwbGF5ZXIpO1xuXG4gICAgICBpZiAoc3luZGljYXRlZCkge1xuICAgICAgICBhZFNlcnZlclVybCA9IGFkZFRvSVUoYWRTZXJ2ZXJVcmwsIDUsIHN5bmRpY2F0ZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGN1c3RvbVBhcmFtcyA9IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nKG9wdGlvbnMpO1xuXG4gICAgaWYgKGN1c3RvbVBhcmFtcyAhPSAnJykge1xuICAgICAgYWRTZXJ2ZXJVcmwgKz0gJyZjdXN0X3BhcmFtcz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGN1c3RvbVBhcmFtcyk7XG4gICAgfVxuXG4gICAgLy9pbmRleCBiaWRkaW5nIGV4Y2hhbmdlXG4gICAgaWYob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnaW5kZXhfYmlkZGluZ19hZF9zZXJ2ZXJfdXJsX2V4Y2hhbmdlJykgJiYgb3B0aW9ucy5pbmRleF9iaWRkaW5nX2FkX3NlcnZlcl91cmxfZXhjaGFuZ2UuaGFzT3duUHJvcGVydHkoJ2luZGV4X2JpZGRpbmdfYWRfZXhjaGFuZ2Vfc2l0ZV9pZCcpKXtcbiAgICAgIGNvbnN0IHNvID0gb3B0aW9ucy5pbmRleF9iaWRkaW5nX2FkX3NlcnZlcl91cmxfZXhjaGFuZ2UuaW5kZXhfYmlkZGluZ19hZF9leGNoYW5nZV9zaXRlX2lkO1xuICAgICAgYWRTZXJ2ZXJVcmwgPSBnZXRJbmRleEFkcyhhZFNlcnZlclVybCwgc28pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwbGF5ZXIuaW1hMyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHBsYXllci5pbWEzKHtcbiAgICAgICAgYWRUZWNoT3JkZXI6IFsnaHRtbDUnLCAnZmxhc2gnXSxcbiAgICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgICB0aW1lb3V0OiA3MDAwLFxuICAgICAgICByZXF1ZXN0TW9kZTogJ29ubG9hZCcsXG4gICAgICAgIGxvYWRpbmdTcGlubmVyOiB0cnVlLFxuICAgICAgICBzZXJ2ZXJVcmw6IGFkU2VydmVyVXJsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxheWVyLmltYTMuc2V0dGluZ3Muc2VydmVyVXJsID0gYWRTZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmFkX21hY3JvX3JlcGxhY2VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcGxheWVyLmltYTMuYWRNYWNyb1JlcGxhY2VtZW50ID0gKHVybCkgPT4ge1xuICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gb3B0aW9ucy5hZF9tYWNyb19yZXBsYWNlbWVudDtcblxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgIHVybCA9IHVybC5zcGxpdChpKS5qb2luKGVuY29kZVVSSUNvbXBvbmVudChwYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICBzZXR1cE1vYXQ6ICAocGxheWVyLG9wdGlvbnMpID0+IHtcbiAgICBwbGF5ZXIuTW9hdCh7XG4gICAgICBwYXJ0bmVyQ29kZTogb3B0aW9ucy5wYXJ0bmVyX2NvZGVcbiAgICB9KTtcbiAgfSxcbiAgc2V0dXBfZGlzcGxheXRpdGxlOiAocGxheWVyLG9wdGlvbnMpID0+IHtcbiAgICBwbGF5ZXIuZGlzcGxheXRpdGxlKHtcImFkdmVydGlzZW1lbnRfdGl0bGVcIjpvcHRpb25zLmFkdmVydGlzZW1lbnRfdGl0bGV9KTtcbiAgfSxcbn07XG5cblxuY29uc3Qgc2V0dXBFcnJvckhhbmRsZXJzID0gKHBsYXllcikgPT57XG5cbi8vIGhhbmRsaW5nIEdlby1yZXN0cmljdGVkIGVycm9ycy5cbiAgcGxheWVyLm9uZSgnYmMtY2F0YWxvZy1lcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGxldCByUGxheWVyID0gdGhpcyxcbiAgICAgIHNwZWNpZmljRXJyb3I7XG5cbiAgICByUGxheWVyLmVycm9ycyh7XG4gICAgICBlcnJvcnM6IHtcbiAgICAgICAgJy0zJzoge1xuICAgICAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyBub3QgYXZhaWxhYmxlIGluIHlvdXIgcmVnaW9uLicsXG4gICAgICAgICAgdHlwZTogJ0NMSUVOVF9HRU8nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YgKHJQbGF5ZXIuY2F0YWxvZy5lcnJvcikgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzcGVjaWZpY0Vycm9yID0gclBsYXllci5jYXRhbG9nLmVycm9yLmRhdGFbMF07XG4gICAgICBpZiAoc3BlY2lmaWNFcnJvciAhPT0gJ3VuZGVmaW5lZCcgJiYgc3BlY2lmaWNFcnJvci5lcnJvcl9zdWJjb2RlID09ICdDTElFTlRfR0VPJykge1xuICAgICAgICByUGxheWVyLmVycm9yKHtjb2RlOiAnLTMnfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGluaXRQbHVnaW4gPSAocGxheWVyLCBwbHVnaW5zKSA9PiB7XG5cbiAgdmFyIHJlYWR5X2V2ZW50cyA9IFtdO1xuICB2YXIgb3RoZXJfZXZlbnRzICA9IFtdO1xuICBmb3IgKGNvbnN0IGtleSBpbiBwbHVnaW5zKSB7XG5cbiAgICBjb25zdCBzZXR1cF9rZXkgPSAnc2V0dXBfJytrZXk7XG4gICAgLy8gc2tpcCBsb29wIGlmIHRoZSBwcm9wZXJ0eSBpcyBmcm9tIHByb3RvdHlwZVxuICAgIGlmICghcGx1Z2luRnVuY3Rpb25zLmhhc093blByb3BlcnR5KHNldHVwX2tleSkpIGNvbnRpbnVlO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHBsdWdpbnNba2V5XTtcbiAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbG9hZGluZ19ldmVudCcpKXtcbiAgICAgICAgaWYob3B0aW9ucy5sb2FkaW5nX2V2ZW50ID09PSAncmVhZHknKXtcbiAgICAgICAgICByZWFkeV9ldmVudHMucHVzaCh7J2Z1bmMnOnNldHVwX2tleSwgJ29wdGlvbnMnOiBvcHRpb25zfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBvdGhlcl9ldmVudHMucHVzaCh7J2Z1bmMnOnNldHVwX2tleSwgJ29wdGlvbnMnOiBvcHRpb25zfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihyZWFkeV9ldmVudHMubGVuZ3RoID4gMCl7XG4gICAgcGxheWVyLnJlYWR5KCgpID0+IHtcbiAgICAgIGZvcihjb25zdCBrZXkgaW4gcmVhZHlfZXZlbnRzKXtcbiAgICAgICAgY29uc3QgZnVuYyA9IHJlYWR5X2V2ZW50c1trZXldLmZ1bmM7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSByZWFkeV9ldmVudHNba2V5XS5vcHRpb25zO1xuICAgICAgICBwbHVnaW5GdW5jdGlvbnNbZnVuY10ocGxheWVyLG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYob3RoZXJfZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIGZvcihjb25zdCBrZXkgaW4gb3RoZXJfZXZlbnRzKXtcbiAgICAgIGNvbnN0IGZ1bmMgPSBvdGhlcl9ldmVudHNba2V5XS5mdW5jO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IG90aGVyX2V2ZW50c1trZXldLm9wdGlvbnM7XG4gICAgICBwbGF5ZXIub25lKG9wdGlvbnMubG9hZGluZ19ldmVudCwgKCkgPT57XG4gICAgICAgIHBsdWdpbkZ1bmN0aW9uc1tmdW5jXShwbGF5ZXIsb3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4ZXMgYXV0b3BsYXkgYnVnXG4gICAqL1xuICBwbGF5ZXIub24oJ2Fkc3JlYWR5JywgKCkgPT4ge1xuICAgICAgICAvLyBFbnN1cmUgdGhlIHNldHVwIHZhcnMgd2VyZSBzZXRcbiAgICBpZiAocGxheWVyLnRhZ0F0dHJpYnV0ZXNbJ2RhdGEtc2V0dXAnXSkge1xuICAgICAgICAgICAgLy8gUGFyc2UgaXQgdG8gSlNcbiAgICAgIGNvbnN0IHNldHVwX3ZhcnMgPSBKU09OLnBhcnNlKHBsYXllci50YWdBdHRyaWJ1dGVzWydkYXRhLXNldHVwJ10pO1xuXG4gICAgICBpZiAodHlwZW9mIHNldHVwX3ZhcnMuYXV0b3BsYXlfdmFyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoKHNldHVwX3ZhcnMuYXV0b3BsYXlfdmFyID09PSB0cnVlKSAmJiAocGxheWVyLmFkcy5zdGF0ZSAhPSAnYWQtcGxheWJhY2snKSkge1xuICAgICAgICAgIHBsYXllci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiBzZXR1cCBjdXN0b20gZXJyb3IgaGFuZGxlcnNcbiAgICovXG4gIHNldHVwRXJyb3JIYW5kbGVycyhwbGF5ZXIpO1xuXG59O1xuXG5jb25zdCBnZXRQbHVnaW5Db25maWdVcmw9IChvcHRpb25zKSA9PiB7XG4gIC8vZ2V0IHBhcmFtZXRlciB0YWtlcyBwcmVjZWRlbmNlXG4gIHZhciBwbHVnaW5fdXJsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdwbHVnaW5Db25maWcnKTtcbiAgaWYocGx1Z2luX3VybCl7XG4gICAgcmV0dXJuIHBsdWdpbl91cmw7XG4gIH1cblxuICAvL2NoZWNrIGluIHRoZSBvcHRpb25zXG4gIGlmKHR5cGVvZiBvcHRpb25zLnBsdWdpbl9jb25maWcgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHJldHVybiBvcHRpb25zLnBsdWdpbl9jb25maWc7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG4vKipcbiAqIEEgdmlkZW8uanMgcGx1Z2luLlxuICpcbiAqIEluIHRoZSBwbHVnaW4gZnVuY3Rpb24sIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaXMgYSB2aWRlby5qcyBgUGxheWVyYFxuICogaW5zdGFuY2UuIE9uIHJlYWR5IHdlIGluaXRpYWxpemUgdGhlIHBsdWdpbnMgdGhhdCBhcmUgcmVxdWlyZWQuXG4gKlxuICogQGZ1bmN0aW9uIHJkbVBsdWdpbkxvYWRlclxuICogQHBhcmFtICAgIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICogICAgICAgICAgIEFuIG9iamVjdCBvZiBvcHRpb25zIGxlZnQgdG8gdGhlIHBsdWdpbiBhdXRob3IgdG8gZGVmaW5lLlxuICovXG5jb25zdCByZG1QbHVnaW5Mb2FkZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgY29uc3QgcGxheWVyID0gdGhpcztcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5wbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuXG4gICAgdmFyIHBsdWdpbl9jb25maWdfdXJsID0gZ2V0UGx1Z2luQ29uZmlnVXJsKG9wdGlvbnMpO1xuICAgIGlmKHBsdWdpbl9jb25maWdfdXJsKSB7XG4gICAgICBheGlvcy5nZXQocGx1Z2luX2NvbmZpZ191cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIG9wdGlvbnMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgIGluaXRQbHVnaW4ocGxheWVyLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKFwiUGx1Z2luIGNvbmZpZyB1cmwgd2FzIG5vdCBmb3VuZFwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5pdFBsdWdpbihwbGF5ZXIsIHdpbmRvdy5wbHVnaW5zKTtcbiAgfVxuXG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbigncmRtUGx1Z2luTG9hZGVyJywgcmRtUGx1Z2luTG9hZGVyKTtcblxuLy8gSW5jbHVkZSB0aGUgdmVyc2lvbiBudW1iZXIuXG5yZG1QbHVnaW5Mb2FkZXIuVkVSU0lPTiA9ICcyLjk2JztcblxubW9kdWxlLmV4cG9ydHMgPSByZG1QbHVnaW5Mb2FkZXI7XG4iXX0=
