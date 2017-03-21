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
	
	  var requestUri = getRequestUri();
	  if (requestUri) {
	    var requestUriParts = requestUri.split('/');
	    requestUriParts = removeEmptyElements(requestUriParts);
	    queryString += 'section=' + requestUriParts[0] + '&';
	    queryString += 'page=' + requestUriParts.join(',') + '&';
	  }
	
	  var amp_url = getParameterByName('linkbaseurl'); //currently assuming that if linkbaseurk is found its an amp page.
	  if (amp_url) {
	    queryString += 'environment=googleamp&';
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
	      _axios2.default.get(plugin_config_url).then(function (response) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDc1MDM1YTdiNmJiOWNjY2JlYWUiLCJ3ZWJwYWNrOi8vLy4vZGlzdC90ZXN0L3dlYnBhY2suc3RhcnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2luZGV4LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vbm9kZS1saWJzLWJyb3dzZXIvfi9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvaGVscGVycy9idG9hLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly8vLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovLy8uL34vYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIl0sIm5hbWVzIjpbIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW4iLCJpc0luSWZyYW1lIiwid2luZG93Iiwic2VsZiIsInRvcCIsImUiLCJnZXRQYXJhbWV0ZXJCeU5hbWUiLCJuYW1lIiwidXJsIiwicmVwbGFjZSIsImxvY2F0aW9uIiwiaHJlZiIsInJlZ2V4IiwiUmVnRXhwIiwicmVzdWx0cyIsImV4ZWMiLCJkZWNvZGVVUklDb21wb25lbnQiLCJnZXRTeW5kaWNhdGVkVGFnIiwicGxheWVyIiwidGFncyIsIm1lZGlhaW5mbyIsImkiLCJpbmRleE9mIiwic3luZGljYXRlZCIsInNwbGl0IiwiYWRkVG9JVSIsInBvc2l0aW9uIiwiYWRkaXRpb24iLCJpdSIsIm9yaWdpbmFsSVUiLCJjaGFyQXQiLCJzdWJzdHJpbmciLCJpdVBhcnRzIiwiYXJyYXlQb3NpdGlvbiIsImpvaW4iLCJnZXRDdXN0b21QYXJhbXNRdWVyeVN0cmluZyIsIm9wdGlvbnMiLCJxdWVyeVN0cmluZyIsInJlcXVlc3RVcmkiLCJnZXRSZXF1ZXN0VXJpIiwicmVxdWVzdFVyaVBhcnRzIiwicmVtb3ZlRW1wdHlFbGVtZW50cyIsImFtcF91cmwiLCJhZFV0aWxpdHlPYmplY3QiLCJnZXRBZFV0aWxpdHkiLCJhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyIsImdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nIiwic3BvbnNJZCIsImxlbmd0aCIsImFycmF5Iiwic3BsaWNlIiwiYWRVdGlsVGFyZ2V0T2JqZWN0IiwiZ2V0QWRVdGlsVGFyZ2V0Iiwibm90VGFncyIsImVsZW1lbnRzIiwiVGFncyIsImtleSIsInZhbHVlIiwiaW5JZnJhbWUiLCJwYXJlbnQiLCJhZFV0aWxpdHkiLCIkZSIsInBhdGhuYW1lIiwiYWR1dGlsX3RhcmdldCIsImdldEluZGV4QWRzIiwiYSIsImIiLCJKU09OIiwic3RyaW5naWZ5IiwiYyIsImRvY3VtZW50IiwicmVmZXJyZXIiLCJkIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29uc29sZSIsImxvZyIsInBsdWdpbkZ1bmN0aW9ucyIsInNldHVwX2NoYXJ0YmVhdCIsImNoYXJ0YmVhdCIsInVpZCIsImRvbWFpbiIsInNldHVwX3N0cmVhbXNlbnNlIiwiY29tc2NvcmUiLCJjMiIsImxhYmVsbWFwcGluZyIsImMzIiwiYzQiLCJjNiIsImJyYW5kIiwicHVibGlzaGVyIiwibnNfc3RfcHIiLCJuc19zdF9lcCIsIm5zX3N0X3NuIiwibnNfc3RfZW4iLCJuc19zdF9nZSIsIm5zX3N0X3RpIiwibnNfc3RfaWEiLCJuc19zdF9jZSIsIm5zX3N0X2RkdCIsIm5zX3N0X3RkdCIsInNldHVwX29tbml0dXJlIiwidnNfYWNjb3VudCIsInNpdGVfY2F0YWx5c3RfYWNjb3VudCIsInMiLCJhY2NvdW50Iiwic19hY2NvdW50IiwidnNfY2hhbm5lbCIsInNpdGVfY2F0YWx5c3RfYnJhbmQiLCJiY2dzX2Fkb2JlX2NvbmZpZyIsIlZJU0lUT1JfQVBJIiwiTUFSS0VUSU5HX0NMT1VEX09SR19JRCIsIk5BTUVTUEFDRSIsIlRSQUNLSU5HX1NFUlZFUiIsIkFQUF9NRUFTVVJFTUVOVCIsIlJTSUQiLCJIRUFSVEJFQVQiLCJESVNBQkxFIiwiUFVCTElTSEVSIiwiQ0hBTk5FTCIsIk9WUCIsIlNESyIsIkpPQl9JRCIsIkRFQlVHX0xPR0dJTkciLCJRVUFMSVRZIiwiQVZFUkFHRV9CSVRSQVRFIiwiVElNRV9UT19TVEFSVCIsIkNVU1RPTV9FVkVOVCIsImRpc2FibGUiLCJiY19kYXRhX21hcHBpbmciLCJzZWdtZW50IiwiY29udGVudFR5cGUiLCJ0aW1lUGxheWVkIiwidmlldyIsInNlZ21lbnRWaWV3IiwiY29tcGxldGUiLCJtaWxlc3RvbmVzIiwiYmNfdm9sdW1lY2hhbmdlIiwiZXZlbnQiLCJldmFyIiwiYmNfYWRfcGF1c2UiLCJiY19mdWxsc2NyZWVuX2VudGVyIiwiYmNfZnVsbHNjcmVlbl9leGl0IiwiYmNfc29jaWFsX29wZW5lZCIsImJjX3NvY2lhbF9jbG9zZWQiLCJCQ0dTQWRvYmVBbmFseXRpY3NQbHVnaW4iLCJzZXR1cF9pbWEzIiwiYWRTZXJ2ZXJVcmwiLCJpbWEzIiwic2V0dGluZ3MiLCJzZXJ2ZXJVcmwiLCJhZF9zZXJ2ZXJfdXJsIiwic3luZGljYXRlZF9lbmFibGUiLCJjdXN0b21QYXJhbXMiLCJoYXNPd25Qcm9wZXJ0eSIsImluZGV4X2JpZGRpbmdfYWRfc2VydmVyX3VybF9leGNoYW5nZSIsInNvIiwiaW5kZXhfYmlkZGluZ19hZF9leGNoYW5nZV9zaXRlX2lkIiwiYWRUZWNoT3JkZXIiLCJkZWJ1ZyIsInRpbWVvdXQiLCJyZXF1ZXN0TW9kZSIsImxvYWRpbmdTcGlubmVyIiwiYWRfbWFjcm9fcmVwbGFjZW1lbnQiLCJhZE1hY3JvUmVwbGFjZW1lbnQiLCJwYXJhbWV0ZXJzIiwic2V0dXBNb2F0IiwiTW9hdCIsInBhcnRuZXJDb2RlIiwicGFydG5lcl9jb2RlIiwic2V0dXBfZGlzcGxheXRpdGxlIiwiZGlzcGxheXRpdGxlIiwiYWR2ZXJ0aXNlbWVudF90aXRsZSIsInNldHVwRXJyb3JIYW5kbGVycyIsIm9uZSIsInJQbGF5ZXIiLCJzcGVjaWZpY0Vycm9yIiwiZXJyb3JzIiwiaGVhZGxpbmUiLCJ0eXBlIiwiY2F0YWxvZyIsImVycm9yIiwiZGF0YSIsImVycm9yX3N1YmNvZGUiLCJjb2RlIiwiaW5pdFBsdWdpbiIsInBsdWdpbnMiLCJyZWFkeV9ldmVudHMiLCJvdGhlcl9ldmVudHMiLCJzZXR1cF9rZXkiLCJsb2FkaW5nX2V2ZW50IiwicHVzaCIsInJlYWR5IiwiZnVuYyIsIm9uIiwidGFnQXR0cmlidXRlcyIsInNldHVwX3ZhcnMiLCJwYXJzZSIsImF1dG9wbGF5X3ZhciIsImFkcyIsInN0YXRlIiwicGxheSIsImdldFBsdWdpbkNvbmZpZ1VybCIsInBsdWdpbl91cmwiLCJwbHVnaW5fY29uZmlnIiwicmRtUGx1Z2luTG9hZGVyIiwicGx1Z2luX2NvbmZpZ191cmwiLCJnZXQiLCJ0aGVuIiwicmVzcG9uc2UiLCJzdGF0dXMiLCJjYXRjaCIsIlZFUlNJT04iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUNuQ0E7Ozs7OztBQUVBQSxPQUFNQyxNQUFOLENBQWEsaUJBQWIsRSxDQUxBOzs7O0FBTUFELE9BQU1FLElBQU4sQ0FBVyw2REFBWCxFQUEwRSxVQUFDQyxNQUFELEVBQVk7QUFDcEZBLFVBQU9DLEVBQVAsa0JBQWUsZ0RBQWY7QUFDRCxFQUZELEU7Ozs7Ozs7Ozs7Ozs7O0FDTkE7Ozs7QUFDQTs7Ozs7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEtBQU1DLGlCQUFpQixnQkFBUUEsY0FBUixJQUEwQixnQkFBUUMsTUFBekQ7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixzQkFBc0I7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDRCQUEyQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQSw2QkFBNEIsVUFBVTs7Ozs7OztBQ25MdEM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOzs7Ozs7O0FDWEE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNEM7QUFDNUM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7QUFDSDs7Ozs7Ozs7QUNoTEE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVyxTQUFTO0FBQ3BCLFlBQVcs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LE9BQU87QUFDbEIsY0FBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDYkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsT0FBTztBQUNsQixjQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNYQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7QUNsQkE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDeERBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBK0I7QUFDL0I7QUFDQTtBQUNBLFlBQVcsU0FBUztBQUNwQixjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2sudGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDA3NTAzNWE3YjZiYjljY2NiZWFlIiwiLyoqXG4gKiB3ZWJwYWNrIHRlc3QgXG4gKi9cbmltcG9ydCBwa2cgZnJvbSBcIi4uLy4uL3NyYy9qcy9pbmRleC5qc1wiO1xuXG5RVW5pdC5tb2R1bGUoXCJ3ZWJwYWNrIHJlcXVpcmVcIik7XG5RVW5pdC50ZXN0KFwidmlkZW9qcy1yZG0tcGx1Z2luLWxvYWRlciBzaG91bGQgYmUgcmVxdWlyZWFibGUgdmlhIHdlYnBhY2tcIiwgKGFzc2VydCkgPT4ge1xuICBhc3NlcnQub2socGtnLCBcInZpZGVvanMtcmRtLXBsdWdpbi1sb2FkZXIgaXMgcmVxdWlyZWQgcHJvcGVybHlcIik7XG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9kaXN0L3Rlc3Qvd2VicGFjay5zdGFydC5qcyIsImltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbi8vIGNvbnN0IGRlZmF1bHRzID0ge307XG5cbi8vIENyb3NzLWNvbXBhdGliaWxpdHkgZm9yIFZpZGVvLmpzIDUgYW5kIDYuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG5cbmNvbnN0IGlzSW5JZnJhbWUgPSAoKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbmNvbnN0IGdldFBhcmFtZXRlckJ5TmFtZSA9IChuYW1lLCB1cmwpID0+IHtcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgJ1xcXFwkJicpO1xuICBpZiAoIXVybCkge1xuICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB9XG5cbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbPyZdJyArIG5hbWUgKyAnKD0oW14mI10qKXwmfCN8JCknKTtcbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcblxuICBpZiAoIXJlc3VsdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIXJlc3VsdHNbMl0pIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xufTtcblxuY29uc3QgZ2V0U3luZGljYXRlZFRhZyA9IChwbGF5ZXIpID0+IHtcbiAgY29uc3QgdGFncyA9IHBsYXllci5tZWRpYWluZm8udGFncztcblxuICBmb3IgKGNvbnN0IGkgaW4gdGFncykge1xuICAgIGlmICh0YWdzW2ldLmluZGV4T2YoJ3N5bmRpY2F0ZWQ9JykgPj0gMCkge1xuICAgICAgLy8gR2V0dGluZyB0aGUgdmFsdWUgb2Ygc3luZGljYXRlZFxuICAgICAgY29uc3Qgc3luZGljYXRlZCA9IHRhZ3NbaV0uc3BsaXQoJz0nKVsxXTtcblxuICAgICAgcmV0dXJuIHN5bmRpY2F0ZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGFkZFRvSVUgPSAodXJsLCBwb3NpdGlvbiwgYWRkaXRpb24pID0+IHtcbiAgbGV0IGl1ID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdpdScsIHVybCk7XG4gIGNvbnN0IG9yaWdpbmFsSVUgPSBpdTtcblxuICBpZiAoaXUuY2hhckF0KDApID09ICcvJykge1xuICAgIGl1ID0gaXUuc3Vic3RyaW5nKDEpO1xuICB9XG5cbiAgY29uc3QgaXVQYXJ0cyA9IGl1LnNwbGl0KCcvJyk7XG5cbiAgY29uc3QgYXJyYXlQb3NpdGlvbiA9IHBvc2l0aW9uIC0gMTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5UG9zaXRpb247IGkrKykge1xuICAgIGlmIChpdVBhcnRzW2ldID09ICcnKSB7XG4gICAgICBpdVBhcnRzW2ldID0gJ3ZpZGVvJztcbiAgICB9XG4gIH1cblxuICBpdVBhcnRzW2FycmF5UG9zaXRpb25dID0gYWRkaXRpb247XG5cbiAgaXUgPSAnLycgKyBpdVBhcnRzLmpvaW4oJy8nKTtcblxuICByZXR1cm4gdXJsLnJlcGxhY2Uob3JpZ2luYWxJVSwgaXUpO1xufTtcblxuY29uc3QgZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmcgPSAob3B0aW9ucykgPT4ge1xuXG4gIGxldCBxdWVyeVN0cmluZyA9ICcnO1xuXG4gIGNvbnN0IHJlcXVlc3RVcmkgPSBnZXRSZXF1ZXN0VXJpKCk7XG4gIGlmKHJlcXVlc3RVcmkpIHtcbiAgICBsZXQgcmVxdWVzdFVyaVBhcnRzID0gcmVxdWVzdFVyaS5zcGxpdCgnLycpO1xuICAgIHJlcXVlc3RVcmlQYXJ0cyA9IHJlbW92ZUVtcHR5RWxlbWVudHMocmVxdWVzdFVyaVBhcnRzKTtcbiAgICBxdWVyeVN0cmluZyArPSAnc2VjdGlvbj0nICsgcmVxdWVzdFVyaVBhcnRzWzBdICsgJyYnO1xuICAgIHF1ZXJ5U3RyaW5nICs9ICdwYWdlPScgKyByZXF1ZXN0VXJpUGFydHMuam9pbignLCcpICsgJyYnO1xuICB9XG5cbiAgY29uc3QgYW1wX3VybCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnbGlua2Jhc2V1cmwnKTsvL2N1cnJlbnRseSBhc3N1bWluZyB0aGF0IGlmIGxpbmtiYXNldXJrIGlzIGZvdW5kIGl0cyBhbiBhbXAgcGFnZS5cbiAgaWYoYW1wX3VybCl7XG4gICAgcXVlcnlTdHJpbmcgKz0gJ2Vudmlyb25tZW50PWdvb2dsZWFtcCYnO1xuICB9XG5cbiAgY29uc3QgYWRVdGlsaXR5T2JqZWN0ID0gZ2V0QWRVdGlsaXR5KCk7XG4gIGNvbnN0IGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gZ2V0QWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcoKTtcblxuICBpZiAoYWRVdGlsaXR5T2JqZWN0ICE9IGZhbHNlICYmIGFkVXRpbGl0eU9iamVjdC5zcG9uc0lkICE9ICcnKSB7XG4gICAgcXVlcnlTdHJpbmcgKz0gJ1Nwb25zSWQ9JyArIGFkVXRpbGl0eU9iamVjdC5zcG9uc0lkICsgJyYnO1xuICB9XG5cbiAgaWYgKGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nICE9IGZhbHNlKSB7XG4gICAgcXVlcnlTdHJpbmcgKz0gYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmc7XG4gIH1cblxuICBpZiAocXVlcnlTdHJpbmdbcXVlcnlTdHJpbmcubGVuZ3RoIC0gMV0gPT0gJyYnKSB7IC8vIElmIGxhc3QgY2hhcmFjdGVyIGlzICZcbiAgICBxdWVyeVN0cmluZyA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZygwLCBxdWVyeVN0cmluZy5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiBxdWVyeVN0cmluZztcbn07XG5cbmNvbnN0IHJlbW92ZUVtcHR5RWxlbWVudHMgPSAoYXJyYXkpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhcnJheVtpXSA9PSAnJykge1xuICAgICAgYXJyYXkuc3BsaWNlKGksIDEpO1xuICAgICAgaS0tO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59O1xuXG5jb25zdCBnZXRBZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgbGV0IGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gJyc7XG4gIGNvbnN0IGFkVXRpbFRhcmdldE9iamVjdCA9IGdldEFkVXRpbFRhcmdldCgpO1xuXG4gIGlmIChhZFV0aWxUYXJnZXRPYmplY3QgPT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBub3RUYWdzID0gWydQb3N0SUQnLCAnQXV0aG9yJywgJ0NhdGVnb3J5JywgJ0NvbnRlbnRUeXBlJ107XG4gIGNvbnN0IGVsZW1lbnRzID0gW107XG5cbiAgZWxlbWVudHMuVGFncyA9ICcnO1xuXG4gIGZvciAoY29uc3Qga2V5IGluIGFkVXRpbFRhcmdldE9iamVjdCkge1xuICAgIGxldCB2YWx1ZSA9IGFkVXRpbFRhcmdldE9iamVjdFtrZXldO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUuam9pbignLCcpO1xuICAgIH1cblxuICAgIGlmIChub3RUYWdzLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICBlbGVtZW50c1trZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnRzLlRhZ3MgKz0gdmFsdWUgKyAnLCc7XG4gICAgfVxuICB9XG5cbiAgaWYgKGVsZW1lbnRzLlRhZ3NbZWxlbWVudHMuVGFncy5sZW5ndGggLSAxXSA9PSAnLCcpIHtcbiAgICBlbGVtZW50cy5UYWdzID0gZWxlbWVudHMuVGFncy5zdWJzdHJpbmcoMCwgZWxlbWVudHMuVGFncy5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIGZvciAoY29uc3Qga2V5IGluIGVsZW1lbnRzKSB7XG4gICAgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgKz0ga2V5ICsgJz0nICsgZWxlbWVudHNba2V5XSArICcmJztcbiAgfVxuXG4gIHJldHVybiBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbn07XG5cbmNvbnN0IGdldEFkVXRpbGl0eSA9ICgpID0+IHtcbiAgY29uc3QgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgaWYgKGluSWZyYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkVXRpbGl0eSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5hZFV0aWxpdHk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoJGUpIHtcbiAgICB9IC8vIHRvIGNhdGNoIGNyb3NzLW9yaWdpbiBhY2Nlc3NcbiAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93LmFkVXRpbGl0eSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93LmFkVXRpbGl0eTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBnZXRSZXF1ZXN0VXJpID0gKCkgPT4ge1xuICBjb25zdCBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcbiAgbGV0IHJlcXVlc3RVcmkgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgaWYgKGluSWZyYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlcXVlc3RVcmkgPSBwYXJlbnQubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgfSBjYXRjaCAoJGUpIHsvLyB0byBjYXRjaCBjcm9zcy1vcmlnaW4gaXNzdWVzLlxuICAgICAgcmVxdWVzdFVyaSA9ICcnOyAvLyBzZXR0aW5nIGl0IHRvIGZhbHNlLCBzbyBhcyB0byBub3QgcmVwb3J0IHdyb25nIHZhbHVlcy5cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RVcmk7XG59O1xuXG5jb25zdCBnZXRBZFV0aWxUYXJnZXQgPSAoKSA9PiB7XG4gIGNvbnN0IGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuXG4gIGlmIChpbklmcmFtZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIHBhcmVudC5hZHV0aWxfdGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gcGFyZW50LmFkdXRpbF90YXJnZXQ7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoJGUpIHtcbiAgICB9IC8vIHRvIGNhdGNoIGNyb3NzIG9yaWdpbiBlcnJvcnNcbiAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93LmFkdXRpbF90YXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5hZHV0aWxfdGFyZ2V0O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblxuY29uc3QgZ2V0SW5kZXhBZHM9IChhLGIpID0+IHtpZihcInN0cmluZ1wiIT10eXBlb2YgYXx8XCJvYmplY3RcIiE9dHlwZW9mIGIpcmV0dXJuIGE7dHJ5e2I9SlNPTi5zdHJpbmdpZnkoYik7dmFyIGM9d2luZG93LmxvY2F0aW9uIT09d2luZG93LnBhcmVudC5sb2NhdGlvbj9kb2N1bWVudC5yZWZlcnJlcjp3aW5kb3cubG9jYXRpb24uaHJlZixkPWVuY29kZVVSSUNvbXBvbmVudChhKS5yZXBsYWNlKC8oJTdCKShbXiVdKikoJTdEKS9nLFwieyQyfVwiKTtyZXR1cm4gY29uc29sZS5sb2coZCksXCIvL2FzLXNlYy5jYXNhbGVtZWRpYS5jb20vcGxheWxpc3Q/aXhfaWQ9JTVCaW5kZXhfZXByJTVEJml4X3Y9OC44Jml4X3U9XCIrZW5jb2RlVVJJQ29tcG9uZW50KGMpK1wiJml4X3Z0PVwiK2QrXCImaXhfcz0xOTE4ODgmaXhfdmFzZD0wJml4X2NhPVwiK2VuY29kZVVSSUNvbXBvbmVudCgne1wicHJvdG9jb2xzXCI6IFsyLDMsNSw2XSxcIm1pbWVzXCI6W1widmlkZW8vbXA0XCIsXCJ2aWRlby93ZWJtXCIsXCJhcHBsaWNhdGlvbi9qYXZhc2NyaXB0XCIsXCJ2aWRlby94LWZsdlwiLFwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIl0sXCJhcGlMaXN0XCI6WzEsIDJdLFwic2l6ZVwiOlwiNjQweDM2MFwiLFwidGltZW91dFwiOiAxMDAwLFwiZHVyYXRpb25zXCI6IFsxNSwzMF19JykrXCImaXhfc289XCIrZW5jb2RlVVJJQ29tcG9uZW50KGIpfWNhdGNoKGIpe3JldHVybiBhfX07XG5cbi8vcGx1Z2lucyB0byBiZSBsb2FkZWRcbmNvbnN0IHBsdWdpbkZ1bmN0aW9ucyA9IHtcblxuICBzZXR1cF9jaGFydGJlYXQ6IChwbGF5ZXIsIG9wdGlvbnMpID0+IHtcbiAgICBwbGF5ZXIuY2hhcnRiZWF0KHtcbiAgICAgIHVpZDogb3B0aW9ucy51aWQsXG4gICAgICBkb21haW46IG9wdGlvbnMuZG9tYWluXG4gICAgfSk7XG4gIH0sXG5cbiAgc2V0dXBfc3RyZWFtc2Vuc2U6IChwbGF5ZXIsIG9wdGlvbnMpID0+IHtcbiAgICBwbGF5ZXIuY29tc2NvcmUoe1xuICAgICAgYzI6IG9wdGlvbnMuYzIsXG4gICAgICBsYWJlbG1hcHBpbmc6ICdjMz0nICsgb3B0aW9ucy5jMyArICcsYzQ9JyArIG9wdGlvbnMuYzQgKyAnLGM2PScgKyBvcHRpb25zLmM2ICsgJyxuc19zdF9zdD0nICsgb3B0aW9ucy5icmFuZCArICcsbnNfc3RfcHU9JyArIG9wdGlvbnMucHVibGlzaGVyICsgJyxuc19zdF9wcj0nICsgb3B0aW9ucy5uc19zdF9wciArICcsbnNfc3RfZXA9JyArIG9wdGlvbnMubnNfc3RfZXAgKyAnLG5zX3N0X3NuPScgKyBvcHRpb25zLm5zX3N0X3NuICsgJyxuc19zdF9lbj0nICsgb3B0aW9ucy5uc19zdF9lbiArICcsbnNfc3RfZ2U9JyArIG9wdGlvbnMubnNfc3RfZ2UgKyAnLG5zX3N0X3RpPScgKyBvcHRpb25zLm5zX3N0X3RpICsgJyxuc19zdF9pYT0nICsgb3B0aW9ucy5uc19zdF9pYSArICcsIG5zX3N0X2NlPScgKyBvcHRpb25zLm5zX3N0X2NlICsgJyxuc19zdF9kZHQ9JyArIG9wdGlvbnMubnNfc3RfZGR0ICsgJyxuc19zdF90ZHQ9ICcgKyBvcHRpb25zLm5zX3N0X3RkdFxuICAgIH0pO1xuICB9LFxuXG4gIHNldHVwX29tbml0dXJlOiAgKHBsYXllciwgb3B0aW9ucykgPT4ge1xuICAgIGxldCB2c19hY2NvdW50ID0gJ3JvZ2Vyc3JtaXJhZGlvZGV2JztcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2l0ZV9jYXRhbHlzdF9hY2NvdW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdnNfYWNjb3VudCA9IG9wdGlvbnMuc2l0ZV9jYXRhbHlzdF9hY2NvdW50O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdy5zID09PSAnb2JqZWN0Jykge1xuICAgICAgdnNfYWNjb3VudCA9IHdpbmRvdy5zLmFjY291bnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93LnNfYWNjb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZzX2FjY291bnQgPSB3aW5kb3cuc19hY2NvdW50O1xuICAgIH1cblxuICAgIGxldCB2c19jaGFubmVsID0gJ1ZpZGVvJztcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zaXRlX2NhdGFseXN0X2JyYW5kICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdnNfY2hhbm5lbCA9IG9wdGlvbnMuc2l0ZV9jYXRhbHlzdF9icmFuZDtcbiAgICB9XG5cbiAgICBjb25zdCBiY2dzX2Fkb2JlX2NvbmZpZyA9IHtcblxuICAgICAgVklTSVRPUl9BUEk6IHtcbiAgICAgICAgTUFSS0VUSU5HX0NMT1VEX09SR19JRDogJ0Q3RkQzNEZBNTNENjNCODYwQTQ5MEQ0NEBBZG9iZU9yZycsXG4gICAgICAgIE5BTUVTUEFDRTogJ3JvZ2Vyc21lZGlhJywgLy9cbiAgICAgICAgVFJBQ0tJTkdfU0VSVkVSOiAnb20ucm9nZXJzbWVkaWEuY29tJyAvLyBvbS5yb2dlcnNtZWRpYS5jb20gLy8gbmVlZHMgdHAgY2hhbmdlXG4gICAgICB9LFxuXG4gICAgICBBUFBfTUVBU1VSRU1FTlQ6IHtcbiAgICAgICAgUlNJRDogdnNfYWNjb3VudCwgLy8gcm9nZXJzcm1pcmFkaW9kZXZcbiAgICAgICAgVFJBQ0tJTkdfU0VSVkVSOiAnb20ucm9nZXJzbWVkaWEuY29tJyAvLyBvbS5yb2dlcnNtZWRpYS5jb21cbiAgICAgIH0sXG5cbiAgICAgIEhFQVJUQkVBVDoge1xuICAgICAgICBESVNBQkxFOiBmYWxzZSwgLy8gZGlzYWJsZSBpZiB1c2luZyBtaWxlc3RvbmUgdHJhY2tpbmdcbiAgICAgICAgVFJBQ0tJTkdfU0VSVkVSOiAncm9nZXJzbWVkaWEuaGIub210cmRjLm5ldCcsIC8vIG9tLnJvZ2Vyc21lZGlhLmNvbVxuICAgICAgICBQVUJMSVNIRVI6ICdEN0ZEMzRGQTUzRDYzQjg2MEE0OTBENDRAQWRvYmVPcmcnLFxuICAgICAgICBDSEFOTkVMOiB2c19jaGFubmVsLFxuICAgICAgICBPVlA6ICdCcmlnaHRjb3ZlJyxcbiAgICAgICAgU0RLOiAnMS41LjInLFxuICAgICAgICBKT0JfSUQ6ICdzY192YScsXG4gICAgICAgIERFQlVHX0xPR0dJTkc6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICBRVUFMSVRZOiB7XG4gICAgICAgIEFWRVJBR0VfQklUUkFURTogMCxcbiAgICAgICAgVElNRV9UT19TVEFSVDogMFxuICAgICAgfSxcblxuICAgICAgQ1VTVE9NX0VWRU5UOiB7XG4gICAgICAgIGRpc2FibGU6IHRydWUsIC8vIGRpc2FibGUgaWYgdXNpbmcgaGVhcnRiZWF0IHRyYWNraW5nXG4gICAgICAgIGJjX2RhdGFfbWFwcGluZzoge1xuICAgICAgICAgIG5hbWU6ICdlVmFyMTA2LHByb3AyJywgLy8gdmlkZW8gbmFtZSwgYWNjZXB0cyBtdWx0aXBsZSBlVmFycy9wcm9wc1xuICAgICAgICAgIHNlZ21lbnQ6ICdlVmFyMjAzJywgLy8gY3VycmVudCBtaWxlc3RvbmUgKGUuZy4sICcxOk06MC0yNScpXG4gICAgICAgICAgY29udGVudFR5cGU6ICdlVmFyMjAxJywgLy8gY29udGVudCB0eXBlIChlLmcuLCAndmlkZW8nIG9yICdhZCcpXG4gICAgICAgICAgdGltZVBsYXllZDogJ2V2ZW50MjAzJywgLy8gYW1vdW50IG9mIHRpbWUgcGxheWVkIHNpbmNlIGxhc3QgdHJhY2tpbmcgZXZlbnQsIHRyYWNrZWQgd2l0aCBtaWxlc3RvbmUgZXZlbnRzXG4gICAgICAgICAgdmlldzogJ2V2ZW50MjAxJywgLy8gdmlkZW8gc3RhcnQgZXZlbnRcbiAgICAgICAgICBzZWdtZW50VmlldzogJ2V2ZW50MjAyJywgLy8gZ2VuZXJhbCBtaWxlc3RvbmUgdHJhY2tpbmcgZXZlbnQsIHRyYWNrZWQgd2l0aCBtaWxlc3RvbmUgZXZlbnRzXG4gICAgICAgICAgY29tcGxldGU6ICdldmVudDIwNycsIC8vIHZpZGVvIGNvbXBsZXRlIGV2ZW50XG4gICAgICAgICAgbWlsZXN0b25lczogeyAvLyBtaWxlc3RvbmVzIGluIHBlcmNlbnQ7IG1pbGVzdG9uZXMgY2FuIGJlIGFkZGVkL3JlbW92ZWQgZnJvbSBsaXN0XG4gICAgICAgICAgICAyNTogJ2V2ZW50MjA0JywgLy8gMjUlXG4gICAgICAgICAgICA1MDogJ2V2ZW50MjA1JywgLy8gNTAlXG4gICAgICAgICAgICA3NTogJ2V2ZW50MjA2JyAvLyA3NSVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgdm9sdW1lIGNoYW5nZSBldmVudHNcbiAgICAgICAgYmNfdm9sdW1lY2hhbmdlOiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIwOCcsIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICAgIGV2YXI6ICdwcm9wMScgLy8gdGhlIG5ldyB2b2x1bWUgY2hvc2VuIGJ5IHRoZSB1c2VyIChmcm9tIDAtMS4wMCksIG9ubHkgb25lIHByb3AvZVZhciBzdXBwb3J0ZWQgaGVyZVxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHdoZW4gdXNlciBoYXMgcGF1c2VkIGFuIGFkXG4gICAgICAgIGJjX2FkX3BhdXNlOiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIwOScsIC8vIGV2ZW50IHRyYWNraW5nIG51bWJlclxuICAgICAgICAgIGV2YXI6ICdlVmFyMjA1JyAvLyB0aW1lIHZhbHVlIG9mIHBhdXNpbmcgYW4gYWQsIG9ubHkgb25lIHByb3AvZVZhciBzdXBwb3J0ZWQgaGVyZVxuICAgICAgICB9LFxuICAgICAgICAvLyBrZWVwIHRvIHRyYWNrIHdoZW4gdXNlciBlbnRlcnMgZnVsbCBzY3JlZW4gbW9kZVxuICAgICAgICBiY19mdWxsc2NyZWVuX2VudGVyOiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIxMicgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgd2hlbiB1c2VyIGV4aXRzIGZ1bGwgc2NyZWVuIG1vZGVcbiAgICAgICAgYmNfZnVsbHNjcmVlbl9leGl0OiB7XG4gICAgICAgICAgZXZlbnQ6ICdldmVudDIxMycgLy8gZXZlbnQgdHJhY2tpbmcgbnVtYmVyXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGtlZXAgdG8gdHJhY2sgd2hlbiB1c2VyIG9wZW5zIHNvY2lhbCBzaGFyZSBtZW51XG4gICAgICAgIGJjX3NvY2lhbF9vcGVuZWQ6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjE0JyAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8ga2VlcCB0byB0cmFjayB3aGVuIHVzZXIgY2xvc2VzIHNvY2lhbCBzaGFyZSBtZW51XG4gICAgICAgIGJjX3NvY2lhbF9jbG9zZWQ6IHtcbiAgICAgICAgICBldmVudDogJ2V2ZW50MjE1JyAvLyBldmVudCB0cmFja2luZyBudW1iZXJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBwbGF5ZXIuQkNHU0Fkb2JlQW5hbHl0aWNzUGx1Z2luKHtcbiAgICAgIG9wdGlvbnM6IGJjZ3NfYWRvYmVfY29uZmlnXG4gICAgfSk7XG4gIH0sXG5cbiAgc2V0dXBfaW1hMzogKHBsYXllciwgb3B0aW9ucykgPT4ge1xuXG4gICAgbGV0IGFkU2VydmVyVXJsID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzLnNldHRpbmdzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgYWRTZXJ2ZXJVcmwgPSBwbGF5ZXIuaW1hMy5zZXR0aW5ncy5zZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuYWRfc2VydmVyX3VybCAhPSAnJykge1xuICAgICAgYWRTZXJ2ZXJVcmwgPSBvcHRpb25zLmFkX3NlcnZlcl91cmw7XG4gICAgfVxuXG4gIC8vIGlmIGl0IGlzIGxvYWRlZCBmcm9tIGJyaWdodGNvdmVcbiAgICBpZiAob3B0aW9ucy5zeW5kaWNhdGVkX2VuYWJsZSkge1xuICAgICAgY29uc3Qgc3luZGljYXRlZCA9IGdldFN5bmRpY2F0ZWRUYWcocGxheWVyKTtcblxuICAgICAgaWYgKHN5bmRpY2F0ZWQpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgPSBhZGRUb0lVKGFkU2VydmVyVXJsLCA1LCBzeW5kaWNhdGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjdXN0b21QYXJhbXMgPSBnZXRDdXN0b21QYXJhbXNRdWVyeVN0cmluZyhvcHRpb25zKTtcblxuICAgIGlmIChjdXN0b21QYXJhbXMgIT0gJycpIHtcbiAgICAgIGFkU2VydmVyVXJsICs9ICcmY3VzdF9wYXJhbXM9JyArIGVuY29kZVVSSUNvbXBvbmVudChjdXN0b21QYXJhbXMpO1xuICAgIH1cblxuICAgIC8vaW5kZXggYmlkZGluZyBleGNoYW5nZVxuICAgIGlmKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2luZGV4X2JpZGRpbmdfYWRfc2VydmVyX3VybF9leGNoYW5nZScpICYmIG9wdGlvbnMuaW5kZXhfYmlkZGluZ19hZF9zZXJ2ZXJfdXJsX2V4Y2hhbmdlLmhhc093blByb3BlcnR5KCdpbmRleF9iaWRkaW5nX2FkX2V4Y2hhbmdlX3NpdGVfaWQnKSl7XG4gICAgICBjb25zdCBzbyA9IG9wdGlvbnMuaW5kZXhfYmlkZGluZ19hZF9zZXJ2ZXJfdXJsX2V4Y2hhbmdlLmluZGV4X2JpZGRpbmdfYWRfZXhjaGFuZ2Vfc2l0ZV9pZDtcbiAgICAgIGFkU2VydmVyVXJsID0gZ2V0SW5kZXhBZHMoYWRTZXJ2ZXJVcmwsIHNvKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcGxheWVyLmltYTMgIT09ICdvYmplY3QnKSB7XG4gICAgICBwbGF5ZXIuaW1hMyh7XG4gICAgICAgIGFkVGVjaE9yZGVyOiBbJ2h0bWw1JywgJ2ZsYXNoJ10sXG4gICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgdGltZW91dDogNzAwMCxcbiAgICAgICAgcmVxdWVzdE1vZGU6ICdvbmxvYWQnLFxuICAgICAgICBsb2FkaW5nU3Bpbm5lcjogdHJ1ZSxcbiAgICAgICAgc2VydmVyVXJsOiBhZFNlcnZlclVybFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybCA9IGFkU2VydmVyVXJsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5hZF9tYWNyb19yZXBsYWNlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsYXllci5pbWEzLmFkTWFjcm9SZXBsYWNlbWVudCA9ICh1cmwpID0+IHtcbiAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IG9wdGlvbnMuYWRfbWFjcm9fcmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgZm9yIChjb25zdCBpIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoaSkuam9pbihlbmNvZGVVUklDb21wb25lbnQocGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmw7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgc2V0dXBNb2F0OiAgKHBsYXllcixvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLk1vYXQoe1xuICAgICAgcGFydG5lckNvZGU6IG9wdGlvbnMucGFydG5lcl9jb2RlXG4gICAgfSk7XG4gIH0sXG4gIHNldHVwX2Rpc3BsYXl0aXRsZTogKHBsYXllcixvcHRpb25zKSA9PiB7XG4gICAgcGxheWVyLmRpc3BsYXl0aXRsZSh7XCJhZHZlcnRpc2VtZW50X3RpdGxlXCI6b3B0aW9ucy5hZHZlcnRpc2VtZW50X3RpdGxlfSk7XG4gIH0sXG59O1xuXG5cbmNvbnN0IHNldHVwRXJyb3JIYW5kbGVycyA9IChwbGF5ZXIpID0+e1xuXG4vLyBoYW5kbGluZyBHZW8tcmVzdHJpY3RlZCBlcnJvcnMuXG4gIHBsYXllci5vbmUoJ2JjLWNhdGFsb2ctZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBsZXQgclBsYXllciA9IHRoaXMsXG4gICAgICBzcGVjaWZpY0Vycm9yO1xuXG4gICAgclBsYXllci5lcnJvcnMoe1xuICAgICAgZXJyb3JzOiB7XG4gICAgICAgICctMyc6IHtcbiAgICAgICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgbm90IGF2YWlsYWJsZSBpbiB5b3VyIHJlZ2lvbi4nLFxuICAgICAgICAgIHR5cGU6ICdDTElFTlRfR0VPJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodHlwZW9mIChyUGxheWVyLmNhdGFsb2cuZXJyb3IpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgc3BlY2lmaWNFcnJvciA9IHJQbGF5ZXIuY2F0YWxvZy5lcnJvci5kYXRhWzBdO1xuICAgICAgaWYgKHNwZWNpZmljRXJyb3IgIT09ICd1bmRlZmluZWQnICYmIHNwZWNpZmljRXJyb3IuZXJyb3Jfc3ViY29kZSA9PSAnQ0xJRU5UX0dFTycpIHtcbiAgICAgICAgclBsYXllci5lcnJvcih7Y29kZTogJy0zJ30pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBpbml0UGx1Z2luID0gKHBsYXllciwgcGx1Z2lucykgPT4ge1xuXG4gIHZhciByZWFkeV9ldmVudHMgPSBbXTtcbiAgdmFyIG90aGVyX2V2ZW50cyAgPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gcGx1Z2lucykge1xuXG4gICAgY29uc3Qgc2V0dXBfa2V5ID0gJ3NldHVwXycra2V5O1xuICAgIC8vIHNraXAgbG9vcCBpZiB0aGUgcHJvcGVydHkgaXMgZnJvbSBwcm90b3R5cGVcbiAgICBpZiAoIXBsdWdpbkZ1bmN0aW9ucy5oYXNPd25Qcm9wZXJ0eShzZXR1cF9rZXkpKSBjb250aW51ZTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBwbHVnaW5zW2tleV07XG4gICAgaWYgKG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2xvYWRpbmdfZXZlbnQnKSl7XG4gICAgICAgIGlmKG9wdGlvbnMubG9hZGluZ19ldmVudCA9PT0gJ3JlYWR5Jyl7XG4gICAgICAgICAgcmVhZHlfZXZlbnRzLnB1c2goeydmdW5jJzpzZXR1cF9rZXksICdvcHRpb25zJzogb3B0aW9uc30pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgb3RoZXJfZXZlbnRzLnB1c2goeydmdW5jJzpzZXR1cF9rZXksICdvcHRpb25zJzogb3B0aW9uc30pO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYocmVhZHlfZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgIHBsYXllci5yZWFkeSgoKSA9PiB7XG4gICAgICBmb3IoY29uc3Qga2V5IGluIHJlYWR5X2V2ZW50cyl7XG4gICAgICAgIGNvbnN0IGZ1bmMgPSByZWFkeV9ldmVudHNba2V5XS5mdW5jO1xuICAgICAgICBjb25zdCBvcHRpb25zID0gcmVhZHlfZXZlbnRzW2tleV0ub3B0aW9ucztcbiAgICAgICAgcGx1Z2luRnVuY3Rpb25zW2Z1bmNdKHBsYXllcixvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmKG90aGVyX2V2ZW50cy5sZW5ndGggPiAwKXtcbiAgICBmb3IoY29uc3Qga2V5IGluIG90aGVyX2V2ZW50cyl7XG4gICAgICBjb25zdCBmdW5jID0gb3RoZXJfZXZlbnRzW2tleV0uZnVuYztcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBvdGhlcl9ldmVudHNba2V5XS5vcHRpb25zO1xuICAgICAgcGxheWVyLm9uZShvcHRpb25zLmxvYWRpbmdfZXZlbnQsICgpID0+e1xuICAgICAgICBwbHVnaW5GdW5jdGlvbnNbZnVuY10ocGxheWVyLG9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpeGVzIGF1dG9wbGF5IGJ1Z1xuICAgKi9cbiAgcGxheWVyLm9uKCdhZHNyZWFkeScsICgpID0+IHtcbiAgICAgICAgLy8gRW5zdXJlIHRoZSBzZXR1cCB2YXJzIHdlcmUgc2V0XG4gICAgaWYgKHBsYXllci50YWdBdHRyaWJ1dGVzWydkYXRhLXNldHVwJ10pIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIGl0IHRvIEpTXG4gICAgICBjb25zdCBzZXR1cF92YXJzID0gSlNPTi5wYXJzZShwbGF5ZXIudGFnQXR0cmlidXRlc1snZGF0YS1zZXR1cCddKTtcblxuICAgICAgaWYgKHR5cGVvZiBzZXR1cF92YXJzLmF1dG9wbGF5X3ZhciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKChzZXR1cF92YXJzLmF1dG9wbGF5X3ZhciA9PT0gdHJ1ZSkgJiYgKHBsYXllci5hZHMuc3RhdGUgIT0gJ2FkLXBsYXliYWNrJykpIHtcbiAgICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvKipcbiAgICogc2V0dXAgY3VzdG9tIGVycm9yIGhhbmRsZXJzXG4gICAqL1xuICBzZXR1cEVycm9ySGFuZGxlcnMocGxheWVyKTtcblxufTtcblxuY29uc3QgZ2V0UGx1Z2luQ29uZmlnVXJsPSAob3B0aW9ucykgPT4ge1xuICAvL2dldCBwYXJhbWV0ZXIgdGFrZXMgcHJlY2VkZW5jZVxuICB2YXIgcGx1Z2luX3VybCA9IGdldFBhcmFtZXRlckJ5TmFtZSgncGx1Z2luQ29uZmlnJyk7XG4gIGlmKHBsdWdpbl91cmwpe1xuICAgIHJldHVybiBwbHVnaW5fdXJsO1xuICB9XG5cbiAgLy9jaGVjayBpbiB0aGUgb3B0aW9uc1xuICBpZih0eXBlb2Ygb3B0aW9ucy5wbHVnaW5fY29uZmlnICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICByZXR1cm4gb3B0aW9ucy5wbHVnaW5fY29uZmlnO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuLyoqXG4gKiBBIHZpZGVvLmpzIHBsdWdpbi5cbiAqXG4gKiBJbiB0aGUgcGx1Z2luIGZ1bmN0aW9uLCB0aGUgdmFsdWUgb2YgYHRoaXNgIGlzIGEgdmlkZW8uanMgYFBsYXllcmBcbiAqIGluc3RhbmNlLiBPbiByZWFkeSB3ZSBpbml0aWFsaXplIHRoZSBwbHVnaW5zIHRoYXQgYXJlIHJlcXVpcmVkLlxuICpcbiAqIEBmdW5jdGlvbiByZG1QbHVnaW5Mb2FkZXJcbiAqIEBwYXJhbSAgICB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAqICAgICAgICAgICBBbiBvYmplY3Qgb2Ygb3B0aW9ucyBsZWZ0IHRvIHRoZSBwbHVnaW4gYXV0aG9yIHRvIGRlZmluZS5cbiAqL1xuY29uc3QgcmRtUGx1Z2luTG9hZGVyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gIGNvbnN0IHBsYXllciA9IHRoaXM7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cucGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIHZhciBwbHVnaW5fY29uZmlnX3VybCA9IGdldFBsdWdpbkNvbmZpZ1VybChvcHRpb25zKTtcbiAgICBpZihwbHVnaW5fY29uZmlnX3VybCkge1xuICAgICAgYXhpb3MuZ2V0KHBsdWdpbl9jb25maWdfdXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICBvcHRpb25zID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICBpbml0UGx1Z2luKHBsYXllciwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgY29uc29sZS5lcnJvcihcIlBsdWdpbiBjb25maWcgdXJsIHdhcyBub3QgZm91bmRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluaXRQbHVnaW4ocGxheWVyLCB3aW5kb3cucGx1Z2lucyk7XG4gIH1cblxufTtcblxuLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB3aXRoIHZpZGVvLmpzLlxucmVnaXN0ZXJQbHVnaW4oJ3JkbVBsdWdpbkxvYWRlcicsIHJkbVBsdWdpbkxvYWRlcik7XG5cbi8vIEluY2x1ZGUgdGhlIHZlcnNpb24gbnVtYmVyLlxucmRtUGx1Z2luTG9hZGVyLlZFUlNJT04gPSAnMi45Nic7XG5cbmV4cG9ydCBkZWZhdWx0IHJkbVBsdWdpbkxvYWRlcjtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvanMvaW5kZXguanMiLCJtb2R1bGUuZXhwb3J0cyA9IHZpZGVvanM7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJ2aWRlb2pzXCJcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZSh1dGlscy5tZXJnZShkZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9heGlvcy5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAtPiB1bmRlZmluZWRcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgPT09ICdmdW5jdGlvbidcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmICFpc0FycmF5KG9iaikpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0eXBlb2YgcmVzdWx0W2tleV0gPT09ICdvYmplY3QnICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSB1dGlscy5tZXJnZSh7XG4gICAgICB1cmw6IGFyZ3VtZW50c1swXVxuICAgIH0sIGFyZ3VtZW50c1sxXSk7XG4gIH1cblxuICBjb25maWcgPSB1dGlscy5tZXJnZShkZWZhdWx0cywgdGhpcy5kZWZhdWx0cywgeyBtZXRob2Q6ICdnZXQnIH0sIGNvbmZpZyk7XG5cbiAgLy8gU3VwcG9ydCBiYXNlVVJMIGNvbmZpZ1xuICBpZiAoY29uZmlnLmJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwoY29uZmlnLnVybCkpIHtcbiAgICBjb25maWcudXJsID0gY29tYmluZVVSTHMoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdCh1dGlscy5tZXJnZShjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QodXRpbHMubWVyZ2UoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgUFJPVEVDVElPTl9QUkVGSVggPSAvXlxcKVxcXVxcfScsP1xcbi87XG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoUFJPVEVDVElPTl9QUkVGSVgsICcnKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1laHRvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2RlZmF1bHRzLmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vbm9kZS1saWJzLWJyb3dzZXIvfi9wcm9jZXNzL2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgYnRvYSA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuYnRvYSAmJiB3aW5kb3cuYnRvYS5iaW5kKHdpbmRvdykpIHx8IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idG9hJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdmFyIGxvYWRFdmVudCA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnO1xuICAgIHZhciB4RG9tYWluID0gZmFsc2U7XG5cbiAgICAvLyBGb3IgSUUgOC85IENPUlMgc3VwcG9ydFxuICAgIC8vIE9ubHkgc3VwcG9ydHMgUE9TVCBhbmQgR0VUIGNhbGxzIGFuZCBkb2Vzbid0IHJldHVybnMgdGhlIHJlc3BvbnNlIGhlYWRlcnMuXG4gICAgLy8gRE9OJ1QgZG8gdGhpcyBmb3IgdGVzdGluZyBiL2MgWE1MSHR0cFJlcXVlc3QgaXMgbW9ja2VkLCBub3QgWERvbWFpblJlcXVlc3QuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAndGVzdCcgJiZcbiAgICAgICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgd2luZG93LlhEb21haW5SZXF1ZXN0ICYmICEoJ3dpdGhDcmVkZW50aWFscycgaW4gcmVxdWVzdCkgJiZcbiAgICAgICAgIWlzVVJMU2FtZU9yaWdpbihjb25maWcudXJsKSkge1xuICAgICAgcmVxdWVzdCA9IG5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcbiAgICAgIGxvYWRFdmVudCA9ICdvbmxvYWQnO1xuICAgICAgeERvbWFpbiA9IHRydWU7XG4gICAgICByZXF1ZXN0Lm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiBoYW5kbGVQcm9ncmVzcygpIHt9O1xuICAgICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge307XG4gICAgfVxuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCB8fCAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdFtsb2FkRXZlbnRdID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCAocmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0ICYmICF4RG9tYWluKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICAvLyBJRSBzZW5kcyAxMjIzIGluc3RlYWQgb2YgMjA0IChodHRwczovL2dpdGh1Yi5jb20vbXphYnJpc2tpZS9heGlvcy9pc3N1ZXMvMjAxKVxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzID09PSAxMjIzID8gMjA0IDogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzID09PSAxMjIzID8gJ05vIENvbnRlbnQnIDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnKSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcigndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnKSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICB2YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG5cbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihjb25maWcudXJsKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0RGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIC8vIE5vdGU6IHN0YXR1cyBpcyBub3QgZXhwb3NlZCBieSBYRG9tYWluUmVxdWVzdFxuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS9zZXR0bGUuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gQCBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlc3BvbnNlKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuIEAgQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICByZXR1cm4gZXJyb3I7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyU0MC9naSwgJ0AnKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH1cblxuICAgICAgaWYgKCF1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgfVxuXG4gICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICB9O1xuICAgIH1cblxuICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICB9O1xuICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9KSgpXG4pO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBidG9hIHBvbHlmaWxsIGZvciBJRTwxMCBjb3VydGVzeSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRjaGFtYmVycy9CYXNlNjQuanNcblxudmFyIGNoYXJzID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JztcblxuZnVuY3Rpb24gRSgpIHtcbiAgdGhpcy5tZXNzYWdlID0gJ1N0cmluZyBjb250YWlucyBhbiBpbnZhbGlkIGNoYXJhY3Rlcic7XG59XG5FLnByb3RvdHlwZSA9IG5ldyBFcnJvcjtcbkUucHJvdG90eXBlLmNvZGUgPSA1O1xuRS5wcm90b3R5cGUubmFtZSA9ICdJbnZhbGlkQ2hhcmFjdGVyRXJyb3InO1xuXG5mdW5jdGlvbiBidG9hKGlucHV0KSB7XG4gIHZhciBzdHIgPSBTdHJpbmcoaW5wdXQpO1xuICB2YXIgb3V0cHV0ID0gJyc7XG4gIGZvciAoXG4gICAgLy8gaW5pdGlhbGl6ZSByZXN1bHQgYW5kIGNvdW50ZXJcbiAgICB2YXIgYmxvY2ssIGNoYXJDb2RlLCBpZHggPSAwLCBtYXAgPSBjaGFycztcbiAgICAvLyBpZiB0aGUgbmV4dCBzdHIgaW5kZXggZG9lcyBub3QgZXhpc3Q6XG4gICAgLy8gICBjaGFuZ2UgdGhlIG1hcHBpbmcgdGFibGUgdG8gXCI9XCJcbiAgICAvLyAgIGNoZWNrIGlmIGQgaGFzIG5vIGZyYWN0aW9uYWwgZGlnaXRzXG4gICAgc3RyLmNoYXJBdChpZHggfCAwKSB8fCAobWFwID0gJz0nLCBpZHggJSAxKTtcbiAgICAvLyBcIjggLSBpZHggJSAxICogOFwiIGdlbmVyYXRlcyB0aGUgc2VxdWVuY2UgMiwgNCwgNiwgOFxuICAgIG91dHB1dCArPSBtYXAuY2hhckF0KDYzICYgYmxvY2sgPj4gOCAtIGlkeCAlIDEgKiA4KVxuICApIHtcbiAgICBjaGFyQ29kZSA9IHN0ci5jaGFyQ29kZUF0KGlkeCArPSAzIC8gNCk7XG4gICAgaWYgKGNoYXJDb2RlID4gMHhGRikge1xuICAgICAgdGhyb3cgbmV3IEUoKTtcbiAgICB9XG4gICAgYmxvY2sgPSBibG9jayA8PCA4IHwgY2hhckNvZGU7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBidG9hO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL2J0b2EuanNcbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgfSxcblxuICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgIHJldHVybiB7XG4gICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH0pKClcbik7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qc1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzIHx8IHt9XG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qc1xuLy8gbW9kdWxlIGlkID0gMjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanNcbi8vIG1vZHVsZSBpZCA9IDI2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qc1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==