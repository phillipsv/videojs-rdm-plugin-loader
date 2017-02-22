/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _index = __webpack_require__(1);
	
	var _index2 = _interopRequireDefault(_index);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	QUnit.module("webpack require"); /**
	                                  * webpack test 
	                                  */
	
	QUnit.test("videojs-rdm-plugin-loader should be requireable via webpack", function (assert) {
	  assert.ok(_index2.default, "videojs-rdm-plugin-loader is required properly");
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _video = __webpack_require__(2);
	
	var _video2 = _interopRequireDefault(_video);
	
	var _axios = __webpack_require__(3);
	
	var _axios2 = _interopRequireDefault(_axios);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Default options for the plugin.
	// const defaults = {};
	
	// Cross-compatibility for Video.js 5 and 6.
	var registerPlugin = _video2.default.registerPlugin || _video2.default.plugin;
	
	var isInIframe = function isInIframe() {
	  return window.self !== window.top;
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
	
	var getCustomParamsQueryString = function getCustomParamsQueryString() {
	
	  var queryString = '';
	
	  var requestUri = getRequestUri();
	  var requestUriParts = requestUri.split('/');
	
	  requestUriParts = removeEmptyElements(requestUriParts);
	
	  var adUtilityObject = getAdUtility();
	  var adUtilTargetQueryString = getAdUtilTargetQueryString();
	
	  if (requestUriParts.length > 0) {
	    queryString += 'section=' + requestUriParts[0] + '&';
	    queryString += 'page=' + requestUriParts.join(',') + '&';
	  }
	
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
	
	//plugins to be loaded
	var pluginFunctions = {
	
	  setup_charbeat: function setup_charbeat(player, options) {
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
	
	    var customParams = getCustomParamsQueryString();
	
	    if (customParams != '') {
	      adServerUrl += '&cust_params=' + encodeURIComponent(customParams);
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
	    player.displaytitle({ "advertisement_title": option.advertisement_title });
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
	  console.log(ready_events);
	  console.log(other_events);
	
	  if (ready_events.length > 0) {
	    player.ready(function () {
	      for (var _key2 in ready_events) {
	        pluginFunctions[_key2.func](player, _key2.options);
	      }
	    });
	  }
	
	  if (other_events.length > 0) {
	    var _loop = function _loop(_key3) {
	      player.one(_key3.options.loading_event, function () {
	        pluginFunctions[_key3.func](player, _key3.options);
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
	
	  if (!options.plugin_url) {
	    // plugin cannot be instantiated
	    return;
	  }
	
	  if (typeof window !== 'undefined' && typeof window.plugins === 'undefined') {
	
	    _axios2.default.get(options.plugin_url).then(function (response) {
	      if (response.status === 200) {
	        initPlugin(player, response.data);
	      }
	    }).catch(function (error) {
	      console.log(error);
	      return;
	    });
	  } else {
	    initPlugin(player, window.plugins);
	  }
	};
	
	// Register the plugin with video.js.
	registerPlugin('rdmPluginLoader', rdmPluginLoader);
	
	// Include the version number.
	rdmPluginLoader.VERSION = '__VERSION__';
	
	exports.default = rdmPluginLoader;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = videojs;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	var bind = __webpack_require__(6);
	var Axios = __webpack_require__(7);
	var defaults = __webpack_require__(8);
	
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
	axios.Cancel = __webpack_require__(26);
	axios.CancelToken = __webpack_require__(27);
	axios.isCancel = __webpack_require__(23);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(28);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(6);
	
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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(8);
	var utils = __webpack_require__(5);
	var InterceptorManager = __webpack_require__(20);
	var dispatchRequest = __webpack_require__(21);
	var isAbsoluteURL = __webpack_require__(24);
	var combineURLs = __webpack_require__(25);
	
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


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(5);
	var normalizeHeaderName = __webpack_require__(10);
	
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
	    adapter = __webpack_require__(11);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(11);
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 9 */
/***/ function(module, exports) {

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


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(5);
	var settle = __webpack_require__(12);
	var buildURL = __webpack_require__(15);
	var parseHeaders = __webpack_require__(16);
	var isURLSameOrigin = __webpack_require__(17);
	var createError = __webpack_require__(13);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(18);
	
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
	      var cookies = __webpack_require__(19);
	
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(13);
	
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


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(14);
	
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


/***/ },
/* 14 */
/***/ function(module, exports) {

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


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 18 */
/***/ function(module, exports) {

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


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	var transformData = __webpack_require__(22);
	var isCancel = __webpack_require__(23);
	var defaults = __webpack_require__(8);
	
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


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(5);
	
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


/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ },
/* 24 */
/***/ function(module, exports) {

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


/***/ },
/* 25 */
/***/ function(module, exports) {

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


/***/ },
/* 26 */
/***/ function(module, exports) {

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


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(26);
	
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


/***/ },
/* 28 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjNiM2YwMGNkN2UwNGJkNzU1NTAiLCJ3ZWJwYWNrOi8vLy4vZGlzdC90ZXN0L3dlYnBhY2suc3RhcnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2luZGV4LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vbm9kZS1saWJzLWJyb3dzZXIvfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9idG9hLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIl0sIm5hbWVzIjpbIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW4iLCJpc0luSWZyYW1lIiwid2luZG93Iiwic2VsZiIsInRvcCIsImdldFBhcmFtZXRlckJ5TmFtZSIsIm5hbWUiLCJ1cmwiLCJyZXBsYWNlIiwibG9jYXRpb24iLCJocmVmIiwicmVnZXgiLCJSZWdFeHAiLCJyZXN1bHRzIiwiZXhlYyIsImRlY29kZVVSSUNvbXBvbmVudCIsImdldFN5bmRpY2F0ZWRUYWciLCJwbGF5ZXIiLCJ0YWdzIiwibWVkaWFpbmZvIiwiaSIsImluZGV4T2YiLCJzeW5kaWNhdGVkIiwic3BsaXQiLCJhZGRUb0lVIiwicG9zaXRpb24iLCJhZGRpdGlvbiIsIml1Iiwib3JpZ2luYWxJVSIsImNoYXJBdCIsInN1YnN0cmluZyIsIml1UGFydHMiLCJhcnJheVBvc2l0aW9uIiwiam9pbiIsImdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nIiwicXVlcnlTdHJpbmciLCJyZXF1ZXN0VXJpIiwiZ2V0UmVxdWVzdFVyaSIsInJlcXVlc3RVcmlQYXJ0cyIsInJlbW92ZUVtcHR5RWxlbWVudHMiLCJhZFV0aWxpdHlPYmplY3QiLCJnZXRBZFV0aWxpdHkiLCJhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyIsImdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nIiwibGVuZ3RoIiwic3BvbnNJZCIsImFycmF5Iiwic3BsaWNlIiwiYWRVdGlsVGFyZ2V0T2JqZWN0IiwiZ2V0QWRVdGlsVGFyZ2V0Iiwibm90VGFncyIsImVsZW1lbnRzIiwiVGFncyIsImtleSIsInZhbHVlIiwiaW5JZnJhbWUiLCJwYXJlbnQiLCJhZFV0aWxpdHkiLCIkZSIsInBhdGhuYW1lIiwiYWR1dGlsX3RhcmdldCIsInBsdWdpbkZ1bmN0aW9ucyIsInNldHVwX2NoYXJiZWF0Iiwib3B0aW9ucyIsImNoYXJ0YmVhdCIsInVpZCIsImRvbWFpbiIsInNldHVwX3N0cmVhbXNlbnNlIiwiY29tc2NvcmUiLCJjMiIsImxhYmVsbWFwcGluZyIsImMzIiwiYzQiLCJjNiIsImJyYW5kIiwicHVibGlzaGVyIiwibnNfc3RfcHIiLCJuc19zdF9lcCIsIm5zX3N0X3NuIiwibnNfc3RfZW4iLCJuc19zdF9nZSIsIm5zX3N0X3RpIiwibnNfc3RfaWEiLCJuc19zdF9jZSIsIm5zX3N0X2RkdCIsIm5zX3N0X3RkdCIsInNldHVwX29tbml0dXJlIiwidnNfYWNjb3VudCIsInNpdGVfY2F0YWx5c3RfYWNjb3VudCIsInMiLCJhY2NvdW50Iiwic19hY2NvdW50IiwidnNfY2hhbm5lbCIsInNpdGVfY2F0YWx5c3RfYnJhbmQiLCJiY2dzX2Fkb2JlX2NvbmZpZyIsIlZJU0lUT1JfQVBJIiwiTUFSS0VUSU5HX0NMT1VEX09SR19JRCIsIk5BTUVTUEFDRSIsIlRSQUNLSU5HX1NFUlZFUiIsIkFQUF9NRUFTVVJFTUVOVCIsIlJTSUQiLCJIRUFSVEJFQVQiLCJESVNBQkxFIiwiUFVCTElTSEVSIiwiQ0hBTk5FTCIsIk9WUCIsIlNESyIsIkpPQl9JRCIsIkRFQlVHX0xPR0dJTkciLCJRVUFMSVRZIiwiQVZFUkFHRV9CSVRSQVRFIiwiVElNRV9UT19TVEFSVCIsIkNVU1RPTV9FVkVOVCIsImRpc2FibGUiLCJiY19kYXRhX21hcHBpbmciLCJzZWdtZW50IiwiY29udGVudFR5cGUiLCJ0aW1lUGxheWVkIiwidmlldyIsInNlZ21lbnRWaWV3IiwiY29tcGxldGUiLCJtaWxlc3RvbmVzIiwiYmNfdm9sdW1lY2hhbmdlIiwiZXZlbnQiLCJldmFyIiwiYmNfYWRfcGF1c2UiLCJiY19mdWxsc2NyZWVuX2VudGVyIiwiYmNfZnVsbHNjcmVlbl9leGl0IiwiYmNfc29jaWFsX29wZW5lZCIsImJjX3NvY2lhbF9jbG9zZWQiLCJCQ0dTQWRvYmVBbmFseXRpY3NQbHVnaW4iLCJzZXR1cF9pbWEzIiwiYWRTZXJ2ZXJVcmwiLCJpbWEzIiwic2V0dGluZ3MiLCJzZXJ2ZXJVcmwiLCJhZF9zZXJ2ZXJfdXJsIiwic3luZGljYXRlZF9lbmFibGUiLCJjdXN0b21QYXJhbXMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJhZFRlY2hPcmRlciIsImRlYnVnIiwidGltZW91dCIsInJlcXVlc3RNb2RlIiwibG9hZGluZ1NwaW5uZXIiLCJhZF9tYWNyb19yZXBsYWNlbWVudCIsImFkTWFjcm9SZXBsYWNlbWVudCIsInBhcmFtZXRlcnMiLCJzZXR1cE1vYXQiLCJNb2F0IiwicGFydG5lckNvZGUiLCJwYXJ0bmVyX2NvZGUiLCJzZXR1cF9kaXNwbGF5dGl0bGUiLCJkaXNwbGF5dGl0bGUiLCJvcHRpb24iLCJhZHZlcnRpc2VtZW50X3RpdGxlIiwic2V0dXBFcnJvckhhbmRsZXJzIiwib25lIiwiclBsYXllciIsInNwZWNpZmljRXJyb3IiLCJlcnJvcnMiLCJoZWFkbGluZSIsInR5cGUiLCJjYXRhbG9nIiwiZXJyb3IiLCJkYXRhIiwiZXJyb3Jfc3ViY29kZSIsImNvZGUiLCJpbml0UGx1Z2luIiwicGx1Z2lucyIsInJlYWR5X2V2ZW50cyIsIm90aGVyX2V2ZW50cyIsInNldHVwX2tleSIsImhhc093blByb3BlcnR5IiwibG9hZGluZ19ldmVudCIsInB1c2giLCJjb25zb2xlIiwibG9nIiwicmVhZHkiLCJmdW5jIiwib24iLCJ0YWdBdHRyaWJ1dGVzIiwic2V0dXBfdmFycyIsIkpTT04iLCJwYXJzZSIsImF1dG9wbGF5X3ZhciIsImFkcyIsInN0YXRlIiwicGxheSIsInJkbVBsdWdpbkxvYWRlciIsInBsdWdpbl91cmwiLCJnZXQiLCJ0aGVuIiwicmVzcG9uc2UiLCJzdGF0dXMiLCJjYXRjaCIsIlZFUlNJT04iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUNuQ0E7Ozs7OztBQUVBQSxPQUFNQyxNQUFOLENBQWEsaUJBQWIsRSxDQUxBOzs7O0FBTUFELE9BQU1FLElBQU4sQ0FBVyw2REFBWCxFQUEwRSxVQUFDQyxNQUFELEVBQVk7QUFDcEZBLFVBQU9DLEVBQVAsa0JBQWUsZ0RBQWY7QUFDRCxFQUZELEU7Ozs7Ozs7Ozs7Ozs7O0FDTkE7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEtBQU1DLGlCQUFpQixnQkFBUUEsY0FBUixJQUEwQixnQkFBUUMsTUFBekQ7O0FBRUEsS0FBTUMsYUFBYSxTQUFiQSxVQUFhLEdBQU07QUFDdkIsVUFBT0MsT0FBT0MsSUFBUCxLQUFnQkQsT0FBT0UsR0FBOUI7QUFDRCxFQUZEOztBQUlBLEtBQU1DLHFCQUFxQixTQUFyQkEsa0JBQXFCLENBQUNDLElBQUQsRUFBT0MsR0FBUCxFQUFlO0FBQ3hDRCxVQUFPQSxLQUFLRSxPQUFMLENBQWEsU0FBYixFQUF3QixNQUF4QixDQUFQO0FBQ0EsT0FBSSxD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QTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7Ozs7Ozs7O0FDNUZBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw0QkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNkJBQTRCLFVBQVU7Ozs7Ozs7QUNuTHRDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7OztBQ1hBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTRDO0FBQzVDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7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b3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBmM2IzZjAwY2Q3ZTA0YmQ3NTU1MCIsIi8qKlxuICogd2VicGFjayB0ZXN0IFxuICovXG5pbXBvcnQgcGtnIGZyb20gXCIuLi8uLi9zcmMvanMvaW5kZXguanNcIjtcblxuUVVuaXQubW9kdWxlKFwid2VicGFjayByZXF1aXJlXCIpO1xuUVVuaXQudGVzdChcInZpZGVvanMtcmRtLXBsdWdpbi1sb2FkZXIgc2hvdWxkIGJlIHJlcXVpcmVhYmxlIHZpYSB3ZWJwYWNrXCIsIChhc3NlcnQpID0+IHtcbiAgYXNzZXJ0Lm9rKHBrZywgXCJ2aWRlb2pzLXJkbS1wbHVnaW4tbG9hZGVyIGlzIHJlcXVpcmVkIHByb3Blcmx5XCIpO1xufSk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vZGlzdC90ZXN0L3dlYnBhY2suc3RhcnQuanMiLCJpbXBvcnQgdmlkZW9qcyBmcm9tICd2aWRlby5qcyc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG4vLyBjb25zdCBkZWZhdWx0cyA9IHt9O1xuXG4vLyBDcm9zcy1jb21wYXRpYmlsaXR5IGZvciBWaWRlby5qcyA1IGFuZCA2LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuXG5jb25zdCBpc0luSWZyYW1lID0gKCkgPT4ge1xuICByZXR1cm4gd2luZG93LnNlbGYgIT09IHdpbmRvdy50b3A7XG59O1xuXG5jb25zdCBnZXRQYXJhbWV0ZXJCeU5hbWUgPSAobmFtZSwgdXJsKSA9PiB7XG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csICdcXFxcJCYnKTtcbiAgaWYgKCF1cmwpIHtcbiAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgfVxuXG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJyk7XG4gIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG5cbiAgaWYgKCFyZXN1bHRzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKCFyZXN1bHRzWzJdKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbn07XG5cbmNvbnN0IGdldFN5bmRpY2F0ZWRUYWcgPSAocGxheWVyKSA9PiB7XG4gIGNvbnN0IHRhZ3MgPSBwbGF5ZXIubWVkaWFpbmZvLnRhZ3M7XG5cbiAgZm9yIChjb25zdCBpIGluIHRhZ3MpIHtcbiAgICBpZiAodGFnc1tpXS5pbmRleE9mKCdzeW5kaWNhdGVkPScpID49IDApIHtcbiAgICAgIC8vIEdldHRpbmcgdGhlIHZhbHVlIG9mIHN5bmRpY2F0ZWRcbiAgICAgIGNvbnN0IHN5bmRpY2F0ZWQgPSB0YWdzW2ldLnNwbGl0KCc9JylbMV07XG5cbiAgICAgIHJldHVybiBzeW5kaWNhdGVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBhZGRUb0lVID0gKHVybCwgcG9zaXRpb24sIGFkZGl0aW9uKSA9PiB7XG4gIGxldCBpdSA9IGdldFBhcmFtZXRlckJ5TmFtZSgnaXUnLCB1cmwpO1xuICBjb25zdCBvcmlnaW5hbElVID0gaXU7XG5cbiAgaWYgKGl1LmNoYXJBdCgwKSA9PSAnLycpIHtcbiAgICBpdSA9IGl1LnN1YnN0cmluZygxKTtcbiAgfVxuXG4gIGNvbnN0IGl1UGFydHMgPSBpdS5zcGxpdCgnLycpO1xuXG4gIGNvbnN0IGFycmF5UG9zaXRpb24gPSBwb3NpdGlvbiAtIDE7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheVBvc2l0aW9uOyBpKyspIHtcbiAgICBpZiAoaXVQYXJ0c1tpXSA9PSAnJykge1xuICAgICAgaXVQYXJ0c1tpXSA9ICd2aWRlbyc7XG4gICAgfVxuICB9XG5cbiAgaXVQYXJ0c1thcnJheVBvc2l0aW9uXSA9IGFkZGl0aW9uO1xuXG4gIGl1ID0gJy8nICsgaXVQYXJ0cy5qb2luKCcvJyk7XG5cbiAgcmV0dXJuIHVybC5yZXBsYWNlKG9yaWdpbmFsSVUsIGl1KTtcbn07XG5cbmNvbnN0IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuXG4gIGxldCBxdWVyeVN0cmluZyA9ICcnO1xuXG4gIGNvbnN0IHJlcXVlc3RVcmkgPSBnZXRSZXF1ZXN0VXJpKCk7XG4gIGxldCByZXF1ZXN0VXJpUGFydHMgPSByZXF1ZXN0VXJpLnNwbGl0KCcvJyk7XG5cbiAgcmVxdWVzdFVyaVBhcnRzID0gcmVtb3ZlRW1wdHlFbGVtZW50cyhyZXF1ZXN0VXJpUGFydHMpO1xuXG4gIGNvbnN0IGFkVXRpbGl0eU9iamVjdCA9IGdldEFkVXRpbGl0eSgpO1xuICBjb25zdCBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nKCk7XG5cbiAgaWYgKHJlcXVlc3RVcmlQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgcXVlcnlTdHJpbmcgKz0gJ3NlY3Rpb249JyArIHJlcXVlc3RVcmlQYXJ0c1swXSArICcmJztcbiAgICBxdWVyeVN0cmluZyArPSAncGFnZT0nICsgcmVxdWVzdFVyaVBhcnRzLmpvaW4oJywnKSArICcmJztcbiAgfVxuXG4gIGlmIChhZFV0aWxpdHlPYmplY3QgIT0gZmFsc2UgJiYgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgIT0gJycpIHtcbiAgICBxdWVyeVN0cmluZyArPSAnU3BvbnNJZD0nICsgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgKyAnJic7XG4gIH1cblxuICBpZiAoYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgIT0gZmFsc2UpIHtcbiAgICBxdWVyeVN0cmluZyArPSBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbiAgfVxuXG4gIGlmIChxdWVyeVN0cmluZ1txdWVyeVN0cmluZy5sZW5ndGggLSAxXSA9PSAnJicpIHsgLy8gSWYgbGFzdCBjaGFyYWN0ZXIgaXMgJlxuICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDAsIHF1ZXJ5U3RyaW5nLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgcmVtb3ZlRW1wdHlFbGVtZW50cyA9IChhcnJheSkgPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycmF5W2ldID09ICcnKSB7XG4gICAgICBhcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICBpLS07XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICBsZXQgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSAnJztcbiAgY29uc3QgYWRVdGlsVGFyZ2V0T2JqZWN0ID0gZ2V0QWRVdGlsVGFyZ2V0KCk7XG5cbiAgaWYgKGFkVXRpbFRhcmdldE9iamVjdCA9PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG5vdFRhZ3MgPSBbJ1Bvc3RJRCcsICdBdXRob3InLCAnQ2F0ZWdvcnknLCAnQ29udGVudFR5cGUnXTtcbiAgY29uc3QgZWxlbWVudHMgPSBbXTtcblxuICBlbGVtZW50cy5UYWdzID0gJyc7XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gYWRVdGlsVGFyZ2V0T2JqZWN0KSB7XG4gICAgbGV0IHZhbHVlID0gYWRVdGlsVGFyZ2V0T2JqZWN0W2tleV07XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKCcsJyk7XG4gICAgfVxuXG4gICAgaWYgKG5vdFRhZ3MuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgIGVsZW1lbnRzW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudHMuVGFncyArPSB2YWx1ZSArICcsJztcbiAgICB9XG4gIH1cblxuICBpZiAoZWxlbWVudHMuVGFnc1tlbGVtZW50cy5UYWdzLmxlbmd0aCAtIDFdID09ICcsJykge1xuICAgIGVsZW1lbnRzLlRhZ3MgPSBlbGVtZW50cy5UYWdzLnN1YnN0cmluZygwLCBlbGVtZW50cy5UYWdzLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gZWxlbWVudHMpIHtcbiAgICBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyArPSBrZXkgKyAnPScgKyBlbGVtZW50c1trZXldICsgJyYnO1xuICB9XG5cbiAgcmV0dXJuIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgZ2V0QWRVdGlsaXR5ID0gKCkgPT4ge1xuICBjb25zdCBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcblxuICBpZiAoaW5JZnJhbWUpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuYWRVdGlsaXR5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcGFyZW50LmFkVXRpbGl0eTtcbiAgICAgIH1cbiAgICB9IGNhdGNoICgkZSkge1xuICAgIH0gLy8gdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGFjY2Vzc1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYWRVdGlsaXR5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiB3aW5kb3cuYWRVdGlsaXR5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGdldFJlcXVlc3RVcmkgPSAoKSA9PiB7XG4gIGNvbnN0IGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuICBsZXQgcmVxdWVzdFVyaSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICBpZiAoaW5JZnJhbWUpIHtcbiAgICB0cnkge1xuICAgICAgcmVxdWVzdFVyaSA9IHBhcmVudC5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICB9IGNhdGNoICgkZSkgey8vIHRvIGNhdGNoIGNyb3NzLW9yaWdpbiBpc3N1ZXMuXG4gICAgICByZXF1ZXN0VXJpID0gJyc7IC8vIHNldHRpbmcgaXQgdG8gZmFsc2UsIHNvIGFzIHRvIG5vdCByZXBvcnQgd3JvbmcgdmFsdWVzLlxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVxdWVzdFVyaTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldCA9ICgpID0+IHtcbiAgY29uc3QgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgaWYgKGluSWZyYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkdXRpbF90YXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnQuYWR1dGlsX3RhcmdldDtcbiAgICAgIH1cbiAgICB9IGNhdGNoICgkZSkge1xuICAgIH0gLy8gdG8gY2F0Y2ggY3Jvc3Mgb3JpZ2luIGVycm9yc1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cuYWR1dGlsX3RhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LmFkdXRpbF90YXJnZXQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy9wbHVnaW5zIHRvIGJlIGxvYWRlZFxuY29uc3QgcGx1Z2luRnVuY3Rpb25zID0ge1xuXG4gIHNldHVwX2NoYXJiZWF0OiAocGxheWVyLCBvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLmNoYXJ0YmVhdCh7XG4gICAgICB1aWQ6IG9wdGlvbnMudWlkLFxuICAgICAgZG9tYWluOiBvcHRpb25zLmRvbWFpblxuICAgIH0pO1xuICB9LFxuXG4gIHNldHVwX3N0cmVhbXNlbnNlOiAocGxheWVyLCBvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLmNvbXNjb3JlKHtcbiAgICAgIGMyOiBvcHRpb25zLmMyLFxuICAgICAgbGFiZWxtYXBwaW5nOiAnYzM9JyArIG9wdGlvbnMuYzMgKyAnLGM0PScgKyBvcHRpb25zLmM0ICsgJyxjNj0nICsgb3B0aW9ucy5jNiArICcsbnNfc3Rfc3Q9JyArIG9wdGlvbnMuYnJhbmQgKyAnLG5zX3N0X3B1PScgKyBvcHRpb25zLnB1Ymxpc2hlciArICcsbnNfc3RfcHI9JyArIG9wdGlvbnMubnNfc3RfcHIgKyAnLG5zX3N0X2VwPScgKyBvcHRpb25zLm5zX3N0X2VwICsgJyxuc19zdF9zbj0nICsgb3B0aW9ucy5uc19zdF9zbiArICcsbnNfc3RfZW49JyArIG9wdGlvbnMubnNfc3RfZW4gKyAnLG5zX3N0X2dlPScgKyBvcHRpb25zLm5zX3N0X2dlICsgJyxuc19zdF90aT0nICsgb3B0aW9ucy5uc19zdF90aSArICcsbnNfc3RfaWE9JyArIG9wdGlvbnMubnNfc3RfaWEgKyAnLCBuc19zdF9jZT0nICsgb3B0aW9ucy5uc19zdF9jZSArICcsbnNfc3RfZGR0PScgKyBvcHRpb25zLm5zX3N0X2RkdCArICcsbnNfc3RfdGR0PSAnICsgb3B0aW9ucy5uc19zdF90ZHRcbiAgICB9KTtcbiAgfSxcblxuICBzZXR1cF9vbW5pdHVyZTogIChwbGF5ZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgdnNfYWNjb3VudCA9ICdyb2dlcnNybWlyYWRpb2Rldic7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnNpdGVfY2F0YWx5c3RfYWNjb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZzX2FjY291bnQgPSBvcHRpb25zLnNpdGVfY2F0YWx5c3RfYWNjb3VudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZzX2FjY291bnQgPSB3aW5kb3cucy5hY2NvdW50O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5zX2FjY291bnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2c19hY2NvdW50ID0gd2luZG93LnNfYWNjb3VudDtcbiAgICB9XG5cbiAgICBsZXQgdnNfY2hhbm5lbCA9ICdWaWRlbyc7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2l0ZV9jYXRhbHlzdF9icmFuZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZzX2NoYW5uZWwgPSBvcHRpb25zLnNpdGVfY2F0YWx5c3RfYnJhbmQ7XG4gICAgfVxuXG4gICAgY29uc3QgYmNnc19hZG9iZV9jb25maWcgPSB7XG5cbiAgICAgIFZJU0lUT1JfQVBJOiB7XG4gICAgICAgIE1BUktFVElOR19DTE9VRF9PUkdfSUQ6ICdEN0ZEMzRGQTUzRDYzQjg2MEE0OTBENDRAQWRvYmVPcmcnLFxuICAgICAgICBOQU1FU1BBQ0U6ICdyb2dlcnNtZWRpYScsIC8vXG4gICAgICAgIFRSQUNLSU5HX1NFUlZFUjogJ29tLnJvZ2Vyc21lZGlhLmNvbScgLy8gb20ucm9nZXJzbWVkaWEuY29tIC8vIG5lZWRzIHRwIGNoYW5nZVxuICAgICAgfSxcblxuICAgICAgQVBQX01FQVNVUkVNRU5UOiB7XG4gICAgICAgIFJTSUQ6IHZzX2FjY291bnQsIC8vIHJvZ2Vyc3JtaXJhZGlvZGV2XG4gICAgICAgIFRSQUNLSU5HX1NFUlZFUjogJ29tLnJvZ2Vyc21lZGlhLmNvbScgLy8gb20ucm9nZXJzbWVkaWEuY29tXG4gICAgICB9LFxuXG4gICAgICBIRUFSVEJFQVQ6IHtcbiAgICAgICAgRElTQUJMRTogZmFsc2UsIC8vIGRpc2FibGUgaWYgdXNpbmcgbWlsZXN0b25lIHRyYWNraW5nXG4gICAgICAgIFRSQUNLSU5HX1NFUlZFUjogJ3JvZ2Vyc21lZGlhLmhiLm9tdHJkYy5uZXQnLCAvLyBvbS5yb2dlcnNtZWRpYS5jb21cbiAgICAgICAgUFVCTElTSEVSOiAnRDdGRDM0RkE1M0Q2M0I4NjBBNDkwRDQ0QEFkb2JlT3JnJyxcbiAgICAgICAgQ0hBTk5FTDogdnNfY2hhbm5lbCxcbiAgICAgICAgT1ZQOiAnQnJpZ2h0Y292ZScsXG4gICAgICAgIFNESzogJzEuNS4yJyxcbiAgICAgICAgSk9CX0lEOiAnc2NfdmEnLFxuICAgICAgICBERUJVR19MT0dHSU5HOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgUVVBTElUWToge1xuICAgICAgICBBVkVSQUdFX0JJVFJBVEU6IDAsXG4gICAgICAgIFRJTUVfVE9fU1RBUlQ6IDBcbiAgICAgIH0sXG5cbiAgICAgIENVU1RPTV9FVkVOVDoge1xuICAgICAgICBkaXNhYmxlOiB0cnVlLCAvLyBkaXNhYmxlIGlmIHVzaW5nIGhlYXJ0YmVhdCB0cmFja2luZ1xuICAgICAgICBiY19kYXRhX21hcHBpbmc6IHtcbiAgICAgICAgICBuYW1lOiAnZVZhcjEwNixwcm9wMicsIC8vIHZpZGVvIG5hbWUsIGFjY2VwdHMgbXVsdGlwbGUgZVZhcnMvcHJvcHNcbiAgICAgICAgICBzZWdtZW50OiAnZVZhcjIwMycsIC8vIGN1cnJlbnQgbWlsZXN0b25lIChlLmcuLCAnMTpNOjAtMjUnKVxuICAgICAgICAgIGNvbnRlbnRUeXBlOiAnZVZhcjIwMScsIC8vIGNvbnRlbnQgdHlwZSAoZS5nLiwgJ3ZpZGVvJyBvciAnYWQnKVxuICAgICAgICAgIHRpbWVQbGF5ZWQ6ICdldmVudDIwMycsIC8vIGFtb3VudCBvZiB0aW1lIHBsYXllZCBzaW5jZSBsYXN0IHRyYWNraW5nIGV2ZW50LCB0cmFja2VkIHdpdGggbWlsZXN0b25lIGV2ZW50c1xuICAgICAgICAgIHZpZXc6ICdldmVudDIwMScsIC8vIHZpZGVvIHN0YXJ0IGV2ZW50XG4gICAgICAgICAgc2VnbWVudFZpZXc6ICdldmVudDIwMicsIC8vIGdlbmVyYWwgbWlsZXN0b25lIHRyYWNraW5nIGV2ZW50LCB0cmFja2VkIHdpdGggbWlsZXN0b25lIGV2ZW50c1xuICAgICAgICAgIGNvbXBsZXRlOiAnZXZlbnQyMDcnLCAvLyB2aWRlbyBjb21wbGV0ZSBldmVudFxuICAgICAgICAgIG1pbGVzdG9uZXM6IHsgLy8gbWlsZXN0b25lcyBpbiBwZXJjZW50OyBtaWxlc3RvbmVzIGNhbiBiZSBhZGRlZC9yZW1vdmVkIGZyb20gbGlzdFxuICAgICAgICAgICAgMjU6ICdldmVudDIwNCcsIC8vIDI1JVxuICAgICAgICAgICAgNTA6ICdldmVudDIwNScsIC8vIDUwJVxuICAgICAgICAgICAgNzU6ICdldmVudDIwNicgLy8gNzUlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHZvbHVtZSBjaGFuZ2UgZXZlbnRzXG4gICAgICAgIGJjX3ZvbHVtZWNoYW5nZToge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMDgnLCAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgICBldmFyOiAncHJvcDEnIC8vIHRoZSBuZXcgdm9sdW1lIGNob3NlbiBieSB0aGUgdXNlciAoZnJvbSAwLTEuMDApLCBvbmx5IG9uZSBwcm9wL2VWYXIgc3VwcG9ydGVkIGhlcmVcbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB3aGVuIHVzZXIgaGFzIHBhdXNlZCBhbiBhZFxuICAgICAgICBiY19hZF9wYXVzZToge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMDknLCAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgICBldmFyOiAnZVZhcjIwNScgLy8gdGltZSB2YWx1ZSBvZiBwYXVzaW5nIGFuIGFkLCBvbmx5IG9uZSBwcm9wL2VWYXIgc3VwcG9ydGVkIGhlcmVcbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB3aGVuIHVzZXIgZW50ZXJzIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgYmNfZnVsbHNjcmVlbl9lbnRlcjoge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMTInIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHdoZW4gdXNlciBleGl0cyBmdWxsIHNjcmVlbiBtb2RlXG4gICAgICAgIGJjX2Z1bGxzY3JlZW5fZXhpdDoge1xuICAgICAgICAgIGV2ZW50OiAnZXZlbnQyMTMnIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHdoZW4gdXNlciBvcGVucyBzb2NpYWwgc2hhcmUgbWVudVxuICAgICAgICBiY19zb2NpYWxfb3BlbmVkOiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIxNCcgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgd2hlbiB1c2VyIGNsb3NlcyBzb2NpYWwgc2hhcmUgbWVudVxuICAgICAgICBiY19zb2NpYWxfY2xvc2VkOiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIxNScgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcGxheWVyLkJDR1NBZG9iZUFuYWx5dGljc1BsdWdpbih7XG4gICAgICBvcHRpb25zOiBiY2dzX2Fkb2JlX2NvbmZpZ1xuICAgIH0pO1xuICB9LFxuXG4gIHNldHVwX2ltYTM6IChwbGF5ZXIsIG9wdGlvbnMpID0+IHtcbiAgICBsZXQgYWRTZXJ2ZXJVcmwgPSAnJztcblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMuc2V0dGluZ3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBhZFNlcnZlclVybCA9IHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hZF9zZXJ2ZXJfdXJsICE9ICcnKSB7XG4gICAgICBhZFNlcnZlclVybCA9IG9wdGlvbnMuYWRfc2VydmVyX3VybDtcbiAgICB9XG5cbiAgLy8gaWYgaXQgaXMgbG9hZGVkIGZyb20gYnJpZ2h0Y292ZVxuICAgIGlmIChvcHRpb25zLnN5bmRpY2F0ZWRfZW5hYmxlKSB7XG4gICAgICBjb25zdCBzeW5kaWNhdGVkID0gZ2V0U3luZGljYXRlZFRhZyhwbGF5ZXIpO1xuXG4gICAgICBpZiAoc3luZGljYXRlZCkge1xuICAgICAgICBhZFNlcnZlclVybCA9IGFkZFRvSVUoYWRTZXJ2ZXJVcmwsIDUsIHN5bmRpY2F0ZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGN1c3RvbVBhcmFtcyA9IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nKCk7XG5cbiAgICBpZiAoY3VzdG9tUGFyYW1zICE9ICcnKSB7XG4gICAgICBhZFNlcnZlclVybCArPSAnJmN1c3RfcGFyYW1zPScgKyBlbmNvZGVVUklDb21wb25lbnQoY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcGxheWVyLmltYTMgIT09ICdvYmplY3QnKSB7XG4gICAgICBwbGF5ZXIuaW1hMyh7XG4gICAgICAgIGFkVGVjaE9yZGVyOiBbJ2h0bWw1JywgJ2ZsYXNoJ10sXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogNzAwMCxcbiAgICAgICAgcmVxdWVzdE1vZGU6ICdvbmxvYWQnLFxuICAgICAgICBsb2FkaW5nU3Bpbm5lcjogdHJ1ZSxcbiAgICAgICAgc2VydmVyVXJsOiBhZFNlcnZlclVybFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybCA9IGFkU2VydmVyVXJsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5hZF9tYWNyb19yZXBsYWNlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsYXllci5pbWEzLmFkTWFjcm9SZXBsYWNlbWVudCA9ICh1cmwpID0+IHtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IG9wdGlvbnMuYWRfbWFjcm9fcmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgZm9yIChjb25zdCBpIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoaSkuam9pbihlbmNvZGVVUklDb21wb25lbnQocGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgc2V0dXBNb2F0OiAgKHBsYXllcixvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLk1vYXQoe1xuICAgICAgcGFydG5lckNvZGU6IG9wdGlvbnMucGFydG5lcl9jb2RlXG4gICAgfSk7XG4gIH0sXG4gIHNldHVwX2Rpc3BsYXl0aXRsZTogKHBsYXllcixvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLmRpc3BsYXl0aXRsZSh7XCJhZHZlcnRpc2VtZW50X3RpdGxlXCI6b3B0aW9uLmFkdmVydGlzZW1lbnRfdGl0bGV9KTtcbiAgfSxcbn07XG5cblxuY29uc3Qgc2V0dXBFcnJvckhhbmRsZXJzID0gKHBsYXllcikgPT57XG5cbi8vIGhhbmRsaW5nIEdlby1yZXN0cmljdGVkIGVycm9ycy5cbiAgcGxheWVyLm9uZSgnYmMtY2F0YWxvZy1lcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGxldCByUGxheWVyID0gdGhpcyxcbiAgICAgIHNwZWNpZmljRXJyb3I7XG5cbiAgICByUGxheWVyLmVycm9ycyh7XG4gICAgICBlcnJvcnM6IHtcbiAgICAgICAgJy0zJzoge1xuICAgICAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyBub3QgYXZhaWxhYmxlIGluIHlvdXIgcmVnaW9uLicsXG4gICAgICAgICAgdHlwZTogJ0NMSUVOVF9HRU8nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0eXBlb2YgKHJQbGF5ZXIuY2F0YWxvZy5lcnJvcikgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBzcGVjaWZpY0Vycm9yID0gclBsYXllci5jYXRhbG9nLmVycm9yLmRhdGFbMF07XG4gICAgICBpZiAoc3BlY2lmaWNFcnJvciAhPT0gJ3VuZGVmaW5lZCcgJiYgc3BlY2lmaWNFcnJvci5lcnJvcl9zdWJjb2RlID09ICdDTElFTlRfR0VPJykge1xuICAgICAgICByUGxheWVyLmVycm9yKHtjb2RlOiAnLTMnfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGluaXRQbHVnaW4gPSAocGxheWVyLCBwbHVnaW5zKSA9PiB7XG5cbiAgdmFyIHJlYWR5X2V2ZW50cyA9IFtdO1xuICB2YXIgb3RoZXJfZXZlbnRzICA9IFtdO1xuICBmb3IgKGNvbnN0IGtleSBpbiBwbHVnaW5zKSB7XG5cbiAgICBjb25zdCBzZXR1cF9rZXkgPSAnc2V0dXBfJytrZXk7XG4gICAgLy8gc2tpcCBsb29wIGlmIHRoZSBwcm9wZXJ0eSBpcyBmcm9tIHByb3RvdHlwZVxuICAgIGlmICghcGx1Z2luRnVuY3Rpb25zLmhhc093blByb3BlcnR5KHNldHVwX2tleSkpIGNvbnRpbnVlO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHBsdWdpbnNba2V5XTtcbiAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnbG9hZGluZ19ldmVudCcpKXtcbiAgICAgICAgaWYob3B0aW9ucy5sb2FkaW5nX2V2ZW50ID09PSAncmVhZHknKXtcbiAgICAgICAgICByZWFkeV9ldmVudHMucHVzaCh7J2Z1bmMnOnNldHVwX2tleSwgJ29wdGlvbnMnOiBvcHRpb25zfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICBvdGhlcl9ldmVudHMucHVzaCh7J2Z1bmMnOnNldHVwX2tleSwgJ29wdGlvbnMnOiBvcHRpb25zfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc29sZS5sb2cocmVhZHlfZXZlbnRzKTtcbiAgY29uc29sZS5sb2cob3RoZXJfZXZlbnRzKTtcblxuICBpZihyZWFkeV9ldmVudHMubGVuZ3RoID4gMCl7XG4gICAgcGxheWVyLnJlYWR5KCgpID0+IHtcbiAgICAgIGZvcihjb25zdCBrZXkgaW4gcmVhZHlfZXZlbnRzKXtcbiAgICAgICAgcGx1Z2luRnVuY3Rpb25zW2tleS5mdW5jXShwbGF5ZXIsa2V5Lm9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaWYob3RoZXJfZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIGZvcihjb25zdCBrZXkgaW4gb3RoZXJfZXZlbnRzKXtcbiAgICAgIHBsYXllci5vbmUoa2V5Lm9wdGlvbnMubG9hZGluZ19ldmVudCwgKCkgPT57XG4gICAgICAgIHBsdWdpbkZ1bmN0aW9uc1trZXkuZnVuY10ocGxheWVyLGtleS5vcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaXhlcyBhdXRvcGxheSBidWdcbiAgICovXG4gIHBsYXllci5vbignYWRzcmVhZHknLCAoKSA9PiB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGUgc2V0dXAgdmFycyB3ZXJlIHNldFxuICAgIGlmIChwbGF5ZXIudGFnQXR0cmlidXRlc1snZGF0YS1zZXR1cCddKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBpdCB0byBKU1xuICAgICAgY29uc3Qgc2V0dXBfdmFycyA9IEpTT04ucGFyc2UocGxheWVyLnRhZ0F0dHJpYnV0ZXNbJ2RhdGEtc2V0dXAnXSk7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2V0dXBfdmFycy5hdXRvcGxheV92YXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICgoc2V0dXBfdmFycy5hdXRvcGxheV92YXIgPT09IHRydWUpICYmIChwbGF5ZXIuYWRzLnN0YXRlICE9ICdhZC1wbGF5YmFjaycpKSB7XG4gICAgICAgICAgcGxheWVyLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLyoqXG4gICAqIHNldHVwIGN1c3RvbSBlcnJvciBoYW5kbGVyc1xuICAgKi9cbiAgc2V0dXBFcnJvckhhbmRsZXJzKHBsYXllcik7XG5cbn07XG5cbi8qKlxuICogQSB2aWRlby5qcyBwbHVnaW4uXG4gKlxuICogSW4gdGhlIHBsdWdpbiBmdW5jdGlvbiwgdGhlIHZhbHVlIG9mIGB0aGlzYCBpcyBhIHZpZGVvLmpzIGBQbGF5ZXJgXG4gKiBpbnN0YW5jZS4gT24gcmVhZHkgd2UgaW5pdGlhbGl6ZSB0aGUgcGx1Z2lucyB0aGF0IGFyZSByZXF1aXJlZC5cbiAqXG4gKiBAZnVuY3Rpb24gcmRtUGx1Z2luTG9hZGVyXG4gKiBAcGFyYW0gICAge09iamVjdH0gW29wdGlvbnM9e31dXG4gKiAgICAgICAgICAgQW4gb2JqZWN0IG9mIG9wdGlvbnMgbGVmdCB0byB0aGUgcGx1Z2luIGF1dGhvciB0byBkZWZpbmUuXG4gKi9cbmNvbnN0IHJkbVBsdWdpbkxvYWRlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICBjb25zdCBwbGF5ZXIgPSB0aGlzO1xuXG4gIGlmICghb3B0aW9ucy5wbHVnaW5fdXJsKSB7XG4gICAgICAgIC8vIHBsdWdpbiBjYW5ub3QgYmUgaW5zdGFudGlhdGVkXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cucGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGF4aW9zLmdldChvcHRpb25zLnBsdWdpbl91cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBpbml0UGx1Z2luKHBsYXllciwgcmVzcG9uc2UuZGF0YSk7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpbml0UGx1Z2luKHBsYXllciwgd2luZG93LnBsdWdpbnMpO1xuICB9XG5cbn07XG5cbi8vIFJlZ2lzdGVyIHRoZSBwbHVnaW4gd2l0aCB2aWRlby5qcy5cbnJlZ2lzdGVyUGx1Z2luKCdyZG1QbHVnaW5Mb2FkZXInLCByZG1QbHVnaW5Mb2FkZXIpO1xuXG4vLyBJbmNsdWRlIHRoZSB2ZXJzaW9uIG51bWJlci5cbnJkbVBsdWdpbkxvYWRlci5WRVJTSU9OID0gJ19fVkVSU0lPTl9fJztcblxuZXhwb3J0IGRlZmF1bHQgcmRtUGx1Z2luTG9hZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2luZGV4LmpzIiwibW9kdWxlLmV4cG9ydHMgPSB2aWRlb2pzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidmlkZW9qc1wiXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UodXRpbHMubWVyZ2UoZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvYXhpb3MuanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgLT4gdW5kZWZpbmVkXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50ID09PSAnZnVuY3Rpb24nXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiAhaXNBcnJheShvYmopKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodHlwZW9mIHJlc3VsdFtrZXldID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW1cbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gdXRpbHMubWVyZ2Uoe1xuICAgICAgdXJsOiBhcmd1bWVudHNbMF1cbiAgICB9LCBhcmd1bWVudHNbMV0pO1xuICB9XG5cbiAgY29uZmlnID0gdXRpbHMubWVyZ2UoZGVmYXVsdHMsIHRoaXMuZGVmYXVsdHMsIHsgbWV0aG9kOiAnZ2V0JyB9LCBjb25maWcpO1xuXG4gIC8vIFN1cHBvcnQgYmFzZVVSTCBjb25maWdcbiAgaWYgKGNvbmZpZy5iYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKGNvbmZpZy51cmwpKSB7XG4gICAgY29uZmlnLnVybCA9IGNvbWJpbmVVUkxzKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KHV0aWxzLm1lcmdlKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS9BeGlvcy5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIFBST1RFQ1RJT05fUFJFRklYID0gL15cXClcXF1cXH0nLD9cXG4vO1xudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKFBST1RFQ1RJT05fUFJFRklYLCAnJyk7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZWh0b2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9kZWZhdWx0cy5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L25vZGUtbGlicy1icm93c2VyL34vcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIGJ0b2EgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmJ0b2EgJiYgd2luZG93LmJ0b2EuYmluZCh3aW5kb3cpKSB8fCByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnRvYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHZhciBsb2FkRXZlbnQgPSAnb25yZWFkeXN0YXRlY2hhbmdlJztcbiAgICB2YXIgeERvbWFpbiA9IGZhbHNlO1xuXG4gICAgLy8gRm9yIElFIDgvOSBDT1JTIHN1cHBvcnRcbiAgICAvLyBPbmx5IHN1cHBvcnRzIFBPU1QgYW5kIEdFVCBjYWxscyBhbmQgZG9lc24ndCByZXR1cm5zIHRoZSByZXNwb25zZSBoZWFkZXJzLlxuICAgIC8vIERPTidUIGRvIHRoaXMgZm9yIHRlc3RpbmcgYi9jIFhNTEh0dHBSZXF1ZXN0IGlzIG1vY2tlZCwgbm90IFhEb21haW5SZXF1ZXN0LlxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnICYmXG4gICAgICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIHdpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKCd3aXRoQ3JlZGVudGlhbHMnIGluIHJlcXVlc3QpICYmXG4gICAgICAgICFpc1VSTFNhbWVPcmlnaW4oY29uZmlnLnVybCkpIHtcbiAgICAgIHJlcXVlc3QgPSBuZXcgd2luZG93LlhEb21haW5SZXF1ZXN0KCk7XG4gICAgICBsb2FkRXZlbnQgPSAnb25sb2FkJztcbiAgICAgIHhEb21haW4gPSB0cnVlO1xuICAgICAgcmVxdWVzdC5vbnByb2dyZXNzID0gZnVuY3Rpb24gaGFuZGxlUHJvZ3Jlc3MoKSB7fTtcbiAgICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHt9O1xuICAgIH1cblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgfHwgJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3RbbG9hZEV2ZW50XSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgKHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCAmJiAheERvbWFpbikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgLy8gSUUgc2VuZHMgMTIyMyBpbnN0ZWFkIG9mIDIwNCAoaHR0cHM6Ly9naXRodWIuY29tL216YWJyaXNraWUvYXhpb3MvaXNzdWVzLzIwMSlcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1cyA9PT0gMTIyMyA/ICdObyBDb250ZW50JyA6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZykpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJykpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgdmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xuXG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oY29uZmlnLnVybCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLndpdGhDcmVkZW50aWFscykge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAocmVxdWVzdC5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocmVxdWVzdERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICAvLyBOb3RlOiBzdGF0dXMgaXMgbm90IGV4cG9zZWQgYnkgWERvbWFpblJlcXVlc3RcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuIEAgQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXNwb25zZSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiBAIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgcmV0dXJuIGVycm9yO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lNDAvZ2ksICdAJykuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgIH1cblxuICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgfTtcbiAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfSkoKVxuKTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxuLy8gYnRvYSBwb2x5ZmlsbCBmb3IgSUU8MTAgY291cnRlc3kgaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkY2hhbWJlcnMvQmFzZTY0LmpzXG5cbnZhciBjaGFycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG5cbmZ1bmN0aW9uIEUoKSB7XG4gIHRoaXMubWVzc2FnZSA9ICdTdHJpbmcgY29udGFpbnMgYW4gaW52YWxpZCBjaGFyYWN0ZXInO1xufVxuRS5wcm90b3R5cGUgPSBuZXcgRXJyb3I7XG5FLnByb3RvdHlwZS5jb2RlID0gNTtcbkUucHJvdG90eXBlLm5hbWUgPSAnSW52YWxpZENoYXJhY3RlckVycm9yJztcblxuZnVuY3Rpb24gYnRvYShpbnB1dCkge1xuICB2YXIgc3RyID0gU3RyaW5nKGlucHV0KTtcbiAgdmFyIG91dHB1dCA9ICcnO1xuICBmb3IgKFxuICAgIC8vIGluaXRpYWxpemUgcmVzdWx0IGFuZCBjb3VudGVyXG4gICAgdmFyIGJsb2NrLCBjaGFyQ29kZSwgaWR4ID0gMCwgbWFwID0gY2hhcnM7XG4gICAgLy8gaWYgdGhlIG5leHQgc3RyIGluZGV4IGRvZXMgbm90IGV4aXN0OlxuICAgIC8vICAgY2hhbmdlIHRoZSBtYXBwaW5nIHRhYmxlIHRvIFwiPVwiXG4gICAgLy8gICBjaGVjayBpZiBkIGhhcyBubyBmcmFjdGlvbmFsIGRpZ2l0c1xuICAgIHN0ci5jaGFyQXQoaWR4IHwgMCkgfHwgKG1hcCA9ICc9JywgaWR4ICUgMSk7XG4gICAgLy8gXCI4IC0gaWR4ICUgMSAqIDhcIiBnZW5lcmF0ZXMgdGhlIHNlcXVlbmNlIDIsIDQsIDYsIDhcbiAgICBvdXRwdXQgKz0gbWFwLmNoYXJBdCg2MyAmIGJsb2NrID4+IDggLSBpZHggJSAxICogOClcbiAgKSB7XG4gICAgY2hhckNvZGUgPSBzdHIuY2hhckNvZGVBdChpZHggKz0gMyAvIDQpO1xuICAgIGlmIChjaGFyQ29kZSA+IDB4RkYpIHtcbiAgICAgIHRocm93IG5ldyBFKCk7XG4gICAgfVxuICAgIGJsb2NrID0gYmxvY2sgPDwgOCB8IGNoYXJDb2RlO1xuICB9XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnRvYTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9idG9hLmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9KSgpXG4pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanNcbi8vIG1vZHVsZSBpZCA9IDE5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVycyB8fCB7fVxuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzXG4vLyBtb2R1bGUgaWQgPSAyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qc1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qc1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qc1xuLy8gbW9kdWxlIGlkID0gMjRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanNcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanNcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanNcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=