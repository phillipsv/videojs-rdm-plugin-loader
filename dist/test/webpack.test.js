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

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _video = __webpack_require__(2);
	
	var _video2 = _interopRequireDefault(_video);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Default options for the plugin.
	var defaults = {};
	
	// Cross-compatibility for Video.js 5 and 6.
	var registerPlugin = _video2.default.registerPlugin || _video2.default.plugin;
	// const dom = videojs.dom || videojs;
	
	/**
	 * Function to invoke when the player is ready.
	 *
	 * This is a great place for your plugin to initialize itself. When this
	 * function is called, the player will have its DOM and child components
	 * in place.
	 *
	 * @function onPlayerReady
	 * @param    {Player} player
	 *           A Video.js player.
	 * @param    {Object} [options={}]
	 *           An object of options left to the plugin author to define.
	 */
	var onPlayerReady = function onPlayerReady(player, options) {};
	
	// const getUrlParameter = (name) => {
	//         name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	//         var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	//         var results = regex.exec(location.search);
	//         return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	// };
	
	var isInIframe = function isInIframe() {
	    return window.self !== window.top;
	};
	
	var getParameterByName = function getParameterByName(name, url) {
	    name = name.replace(/[\[\]]/g, "\\$&");
	    if (!url) {
	        url = window.location.href;
	    }
	
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	
	    if (!results) {
	        return null;
	    }
	    if (!results[2]) {
	        return '';
	    }
	
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	};
	
	var getSyndicatedTag = function getSyndicatedTag(player) {
	    var tags = player.mediainfo.tags;
	    var syndicated = "";
	    for (var i in tags) {
	        if (tags[i].indexOf("syndicated=") >= 0) {
	            syndicated = tags[i].split("=")[1]; // Getting the value of syndicated
	            return syndicated;
	        }
	    }
	    return false;
	};
	
	var addToIU = function addToIU(url, position, addition) {
	    var iu = getParameterByName("iu", url);
	    var originalIU = iu;
	
	    if (iu.charAt(0) == "/") {
	        iu = iu.substring(1);
	    }
	
	    iuParts = iu.split("/");
	
	    var arrayPosition = position - 1;
	
	    for (var i = 0; i < arrayPosition; i++) {
	        if (iuParts[i] == "") {
	            iuParts[i] = "video";
	        }
	    }
	
	    iuParts[arrayPosition] = addition;
	
	    iu = "/" + iuParts.join("/");
	
	    return url.replace(originalIU, iu);
	};
	
	var getCustomParamsQueryString = function getCustomParamsQueryString() {
	
	    var queryString = "";
	
	    var requestUri = getRequestUri();
	    var requestUriParts = requestUri.split("/");
	    requestUriParts = removeEmptyElements(requestUriParts);
	
	    var adUtilityObject = getAdUtility();
	    var adUtilTargetQueryString = getAdUtilTargetQueryString();
	
	    if (requestUriParts.length > 0) {
	        queryString += "section=" + requestUriParts[0] + "&";
	        queryString += "page=" + requestUriParts.join(",") + "&";
	    }
	
	    if (adUtilityObject != false && adUtilityObject.sponsId != "") {
	        queryString += "SponsId=" + adUtilityObject.sponsId + "&";
	    }
	
	    if (adUtilTargetQueryString != false) {
	        queryString += adUtilTargetQueryString;
	    }
	
	    if (queryString[queryString.length - 1] == "&") {
	        // If last character is &
	        queryString = queryString.substring(0, queryString.length - 1);
	    }
	
	    return queryString;
	};
	
	var removeEmptyElements = function removeEmptyElements(array) {
	    for (var i = 0; i < array.length; i++) {
	        if (array[i] == "") {
	            array.splice(i, 1);
	            i--;
	        }
	    }
	    return array;
	};
	
	var getAdUtilTargetQueryString = function getAdUtilTargetQueryString() {
	    var adUtilTargetQueryString = "";
	    var adUtilTargetObject = getAdUtilTarget();
	
	    if (adUtilTargetObject == false) {
	        return false;
	    }
	
	    var notTags = ["PostID", "Author", "Category", "ContentType"];
	    var elements = [];
	    elements["Tags"] = "";
	
	    for (var key in adUtilTargetObject) {
	        var value = adUtilTargetObject[key];
	
	        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" || typeof value == "array") {
	            value = value.join(",");
	        }
	
	        if (notTags.indexOf(key) >= 0) {
	            elements[key] = value;
	        } else {
	            elements["Tags"] += value + ",";
	        }
	    }
	
	    if (elements["Tags"][elements["Tags"].length - 1] == ",") {
	        elements["Tags"] = elements["Tags"].substring(0, elements["Tags"].length - 1);
	    }
	
	    for (var key in elements) {
	        adUtilTargetQueryString += key + "=" + elements[key] + "&";
	    }
	
	    return adUtilTargetQueryString;
	};
	
	var getAdUtility = function getAdUtility() {
	    var inIframe = isInIframe();
	
	    if (inIframe) {
	        try {
	            if (typeof parent.adUtility !== "undefined") {
	                return parent.adUtility;
	            }
	        } catch ($e) {} //to catch cross-origin access
	    } else {
	        if (typeof window.adUtility !== "undefined") {
	            return window.adUtility;
	        }
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
	            //to catch cross-origin issues.
	            requestUrl = ''; //setting it to false, so as to not report wrong values.
	        }
	    }
	    return requestUri;
	};
	
	var getAdUtilTarget = function getAdUtilTarget() {
	    var inIframe = isInIframe();
	
	    if (inIframe) {
	        try {
	            if (typeof parent.adutil_target !== "undefined") {
	                return parent.adutil_target;
	            }
	        } catch ($e) {} //to catch cross origin errors
	    } else {
	        if (typeof window.adutil_target !== "undefined") {
	            return window.adutil_target;
	        }
	    }
	    return false;
	};
	
	var setupIMA3 = function setupIMA3(player, plugins) {
	
	    var adServerUrl = "";
	
	    if (typeof player.ima3.settings !== "undefined") {
	        adServerUrl = player.ima3.settings.serverUrl;
	    }
	
	    if (plugins.ad_server_url != "") {
	        adServerUrl = plugins.ad_server_url;
	    }
	
	    // if it is loaded from brightcove
	    if (plugins.syndicated_enable) {
	        var syndicated = getSyndicatedTag(player);
	        if (syndicated) {
	            adServerUrl = addToIU(adServerUrl, 5, syndicated);
	        }
	    }
	
	    var customParams = getCustomParamsQueryString();
	    if (customParams != "") {
	        adServerUrl += "&cust_params=" + encodeURIComponent(customParams);
	    }
	
	    if (typeof player.ima3 !== "undefined" && _typeof(player.ima3) !== "object") {
	        player.ima3({
	            adTechOrder: ["html5", "flash"],
	            debug: false,
	            timeout: 7000,
	            requestMode: 'onload',
	            loadingSpinner: true,
	            serverUrl: adServerUrl
	        });
	    } else {
	        player.ima3.settings.serverUrl = adServerUrl;
	    }
	
	    if (typeof plugins.ad_macro_replacement !== 'undefined') {
	        player.ima3.adMacroReplacement = function (url) {
	            var parameters = plugins.ad_macro_replacement;
	            for (var i in parameters) {
	                url = url.split(i).join(encodeURIComponent(parameters[i]));
	            }
	            return url;
	        };
	    }
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
	    var _this = this;
	
	    this.ready(function () {
	        onPlayerReady(_this, _video2.default.mergeOptions(defaults, options));
	    });
	
	    this.loadedmetadata(function () {
	        setupIMA3(_this, _video2.default.mergeOptions(defaults, options));
	    });
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDAwYzhjYjA5ZjkxNjRiNWQyMTAiLCJ3ZWJwYWNrOi8vLy4vZGlzdC90ZXN0L3dlYnBhY2suc3RhcnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2luZGV4LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiJdLCJuYW1lcyI6WyJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayIsImRlZmF1bHRzIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW4iLCJvblBsYXllclJlYWR5IiwicGxheWVyIiwib3B0aW9ucyIsImlzSW5JZnJhbWUiLCJ3aW5kb3ciLCJzZWxmIiwidG9wIiwiZ2V0UGFyYW1ldGVyQnlOYW1lIiwibmFtZSIsInVybCIsInJlcGxhY2UiLCJsb2NhdGlvbiIsImhyZWYiLCJyZWdleCIsIlJlZ0V4cCIsInJlc3VsdHMiLCJleGVjIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZ2V0U3luZGljYXRlZFRhZyIsInRhZ3MiLCJtZWRpYWluZm8iLCJzeW5kaWNhdGVkIiwiaSIsImluZGV4T2YiLCJzcGxpdCIsImFkZFRvSVUiLCJwb3NpdGlvbiIsImFkZGl0aW9uIiwiaXUiLCJvcmlnaW5hbElVIiwiY2hhckF0Iiwic3Vic3RyaW5nIiwiaXVQYXJ0cyIsImFycmF5UG9zaXRpb24iLCJqb2luIiwiZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmciLCJxdWVyeVN0cmluZyIsInJlcXVlc3RVcmkiLCJnZXRSZXF1ZXN0VXJpIiwicmVxdWVzdFVyaVBhcnRzIiwicmVtb3ZlRW1wdHlFbGVtZW50cyIsImFkVXRpbGl0eU9iamVjdCIsImdldEFkVXRpbGl0eSIsImFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nIiwiZ2V0QWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmciLCJsZW5ndGgiLCJzcG9uc0lkIiwiYXJyYXkiLCJzcGxpY2UiLCJhZFV0aWxUYXJnZXRPYmplY3QiLCJnZXRBZFV0aWxUYXJnZXQiLCJub3RUYWdzIiwiZWxlbWVudHMiLCJrZXkiLCJ2YWx1ZSIsImluSWZyYW1lIiwicGFyZW50IiwiYWRVdGlsaXR5IiwiJGUiLCJwYXRobmFtZSIsInJlcXVlc3RVcmwiLCJhZHV0aWxfdGFyZ2V0Iiwic2V0dXBJTUEzIiwicGx1Z2lucyIsImFkU2VydmVyVXJsIiwiaW1hMyIsInNldHRpbmdzIiwic2VydmVyVXJsIiwiYWRfc2VydmVyX3VybCIsInN5bmRpY2F0ZWRfZW5hYmxlIiwiY3VzdG9tUGFyYW1zIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYWRUZWNoT3JkZXIiLCJkZWJ1ZyIsInRpbWVvdXQiLCJyZXF1ZXN0TW9kZSIsImxvYWRpbmdTcGlubmVyIiwiYWRfbWFjcm9fcmVwbGFjZW1lbnQiLCJhZE1hY3JvUmVwbGFjZW1lbnQiLCJwYXJhbWV0ZXJzIiwicmRtUGx1Z2luTG9hZGVyIiwicmVhZHkiLCJtZXJnZU9wdGlvbnMiLCJsb2FkZWRtZXRhZGF0YSIsIlZFUlNJT04iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUNuQ0E7Ozs7OztBQUVBQSxPQUFNQyxNQUFOLENBQWEsaUJBQWIsRSxDQUxBOzs7O0FBTUFELE9BQU1FLElBQU4sQ0FBVyw2REFBWCxFQUEwRSxVQUFDQyxNQUFELEVBQVk7QUFDcEZBLFVBQU9DLEVBQVAsa0JBQWUsZ0RBQWY7QUFDRCxFQUZELEU7Ozs7Ozs7Ozs7Ozs7O0FDTkE7Ozs7OztBQUVBO0FBQ0EsS0FBTUMsV0FBVyxFQUFqQjs7QUFFQTtBQUNBLEtBQU1DLGlCQUFpQixnQkFBUUEsY0FBUixJQUEwQixnQkFBUUMsTUFBekQ7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7OztBQWFBLEtB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WixHQUFpQyxVQUFVckUsR0FBVixFQUFlO0FBQzVDLGlCQUFJc0UsYUFBYWhCLFFBQVFjLG9CQUF6QjtBQUNBLGtCQUFLLElBQUl2RCxDQUFULElBQWN5RCxVQUFkLEVBQTBCO0FBQ3RCdEUsdUJBQU1BLElBQUllLEtBQUosQ0FBVUYsQ0FBVixFQUFhWSxJQUFiLENBQWtCcUMsbUJBQW1CUSxXQUFXekQsQ0FBWCxDQUFuQixDQUFsQixDQUFOO0FBQ0g7QUFDRCxvQkFBT2IsR0FBUDtBQUNILFVBTkQ7QUFPSDtBQUNKLEVBaEREOztBQWtEQTs7Ozs7Ozs7OztBQVVBLEtBQU11RSxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQVM5RSxPQUFULEVBQWtCO0FBQUE7O0FBRXhDLFVBQUsrRSxLQUFMLENBQVcsWUFBTTtBQUNiakYsOEJBQW9CLGdCQUFRa0YsWUFBUixDQUFxQnJGLFFBQXJCLEVBQStCSyxPQUEvQixDQUFwQjtBQUNILE1BRkQ7O0FBSUEsVUFBS2lGLGNBQUwsQ0FBb0IsWUFBTTtBQUN0QnJCLDBCQUFnQixnQkFBUW9CLFlBQVIsQ0FBcUJyRixRQUFyQixFQUErQkssT0FBL0IsQ0FBaEI7QUFDSCxNQUZEO0FBR0QsRUFURDs7QUFXQTtBQUNBSixnQkFBZSxpQkFBZixFQUFrQ2tGLGVBQWxDOztBQUVBO0FBQ0FBLGlCQUFnQkksT0FBaEIsR0FBMEIsYUFBMUI7O21CQUVlSixlOzs7Ozs7QUMzU2YsMEIiLCJmaWxlIjoid2VicGFjay50ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZDAwYzhjYjA5ZjkxNjRiNWQyMTAiLCIvKipcbiAqIHdlYnBhY2sgdGVzdCBcbiAqL1xuaW1wb3J0IHBrZyBmcm9tIFwiLi4vLi4vc3JjL2pzL2luZGV4LmpzXCI7XG5cblFVbml0Lm1vZHVsZShcIndlYnBhY2sgcmVxdWlyZVwiKTtcblFVbml0LnRlc3QoXCJ2aWRlb2pzLXJkbS1wbHVnaW4tbG9hZGVyIHNob3VsZCBiZSByZXF1aXJlYWJsZSB2aWEgd2VicGFja1wiLCAoYXNzZXJ0KSA9PiB7XG4gIGFzc2VydC5vayhwa2csIFwidmlkZW9qcy1yZG0tcGx1Z2luLWxvYWRlciBpcyByZXF1aXJlZCBwcm9wZXJseVwiKTtcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwiaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG5jb25zdCBkZWZhdWx0cyA9IHt9O1xuXG4vLyBDcm9zcy1jb21wYXRpYmlsaXR5IGZvciBWaWRlby5qcyA1IGFuZCA2LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuLy8gY29uc3QgZG9tID0gdmlkZW9qcy5kb20gfHwgdmlkZW9qcztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBpbnZva2Ugd2hlbiB0aGUgcGxheWVyIGlzIHJlYWR5LlxuICpcbiAqIFRoaXMgaXMgYSBncmVhdCBwbGFjZSBmb3IgeW91ciBwbHVnaW4gdG8gaW5pdGlhbGl6ZSBpdHNlbGYuIFdoZW4gdGhpc1xuICogZnVuY3Rpb24gaXMgY2FsbGVkLCB0aGUgcGxheWVyIHdpbGwgaGF2ZSBpdHMgRE9NIGFuZCBjaGlsZCBjb21wb25lbnRzXG4gKiBpbiBwbGFjZS5cbiAqXG4gKiBAZnVuY3Rpb24gb25QbGF5ZXJSZWFkeVxuICogQHBhcmFtICAgIHtQbGF5ZXJ9IHBsYXllclxuICogICAgICAgICAgIEEgVmlkZW8uanMgcGxheWVyLlxuICogQHBhcmFtICAgIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICogICAgICAgICAgIEFuIG9iamVjdCBvZiBvcHRpb25zIGxlZnQgdG8gdGhlIHBsdWdpbiBhdXRob3IgdG8gZGVmaW5lLlxuICovXG5jb25zdCBvblBsYXllclJlYWR5ID0gKHBsYXllciwgb3B0aW9ucykgPT4ge307XG5cbi8vIGNvbnN0IGdldFVybFBhcmFtZXRlciA9IChuYW1lKSA9PiB7XG4vLyAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbi8vICAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknKTtcbi8vICAgICAgICAgdmFyIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4vLyAgICAgICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4vLyB9O1xuXG5jb25zdCBpc0luSWZyYW1lID0gKCkgPT4ge1xuICAgIHJldHVybiB3aW5kb3cuc2VsZiAhPT0gd2luZG93LnRvcDtcbn07XG5cbmNvbnN0IGdldFBhcmFtZXRlckJ5TmFtZSA9IChuYW1lLCB1cmwpID0+IHtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCBcIlxcXFwkJlwiKTtcbiAgICBpZiAoIXVybCkge1xuICAgICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICB9XG5cbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiWz8mXVwiICsgbmFtZSArIFwiKD0oW14mI10qKXwmfCN8JClcIiksXG4gICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG5cbiAgICBpZiAoIXJlc3VsdHMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghcmVzdWx0c1syXSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xufTtcblxuY29uc3QgZ2V0U3luZGljYXRlZFRhZyA9IChwbGF5ZXIpID0+IHtcbiAgICB2YXIgdGFncyA9IHBsYXllci5tZWRpYWluZm8udGFncztcbiAgICB2YXIgc3luZGljYXRlZCA9IFwiXCI7XG4gICAgZm9yKHZhciBpIGluIHRhZ3MpIHtcbiAgICAgICAgaWYgKHRhZ3NbaV0uaW5kZXhPZihcInN5bmRpY2F0ZWQ9XCIpID49IDApIHtcbiAgICAgICAgICAgIHN5bmRpY2F0ZWQgPSB0YWdzW2ldLnNwbGl0KFwiPVwiKVsxXTsgLy8gR2V0dGluZyB0aGUgdmFsdWUgb2Ygc3luZGljYXRlZFxuICAgICAgICAgICAgcmV0dXJuIHN5bmRpY2F0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgYWRkVG9JVSA9ICh1cmwsIHBvc2l0aW9uLCBhZGRpdGlvbikgPT4ge1xuICAgIHZhciBpdSA9IGdldFBhcmFtZXRlckJ5TmFtZShcIml1XCIsIHVybCk7XG4gICAgdmFyIG9yaWdpbmFsSVUgPSBpdTtcblxuICAgIGlmIChpdS5jaGFyQXQoMCkgPT0gXCIvXCIpIHtcbiAgICAgICAgaXUgPSBpdS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgaXVQYXJ0cyA9IGl1LnNwbGl0KFwiL1wiKTtcblxuICAgIHZhciBhcnJheVBvc2l0aW9uID0gcG9zaXRpb24gLSAxO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheVBvc2l0aW9uOyBpKyspIHtcbiAgICAgICAgaWYgKGl1UGFydHNbaV0gPT0gXCJcIikge1xuICAgICAgICAgICAgaXVQYXJ0c1tpXSA9IFwidmlkZW9cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGl1UGFydHNbYXJyYXlQb3NpdGlvbl0gPSBhZGRpdGlvbjtcblxuICAgIGl1ID0gXCIvXCIgKyBpdVBhcnRzLmpvaW4oXCIvXCIpO1xuXG4gICAgcmV0dXJuIHVybC5yZXBsYWNlKG9yaWdpbmFsSVUsIGl1KTtcbn07XG5cbmNvbnN0IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuXG4gICAgdmFyIHF1ZXJ5U3RyaW5nID0gXCJcIjtcblxuICAgIHZhciByZXF1ZXN0VXJpID0gZ2V0UmVxdWVzdFVyaSgpO1xuICAgIHZhciByZXF1ZXN0VXJpUGFydHMgPSByZXF1ZXN0VXJpLnNwbGl0KFwiL1wiKTtcbiAgICByZXF1ZXN0VXJpUGFydHMgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHJlcXVlc3RVcmlQYXJ0cyk7XG5cbiAgICB2YXIgYWRVdGlsaXR5T2JqZWN0ID0gZ2V0QWRVdGlsaXR5KCk7XG4gICAgdmFyIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gZ2V0QWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcoKTtcblxuXG4gICAgaWYgKHJlcXVlc3RVcmlQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IFwic2VjdGlvbj1cIiArIHJlcXVlc3RVcmlQYXJ0c1swXSArIFwiJlwiO1xuICAgICAgICBxdWVyeVN0cmluZyArPSBcInBhZ2U9XCIgKyByZXF1ZXN0VXJpUGFydHMuam9pbihcIixcIikgKyBcIiZcIjtcbiAgICB9XG5cbiAgICBpZiAoYWRVdGlsaXR5T2JqZWN0ICE9IGZhbHNlICYmIGFkVXRpbGl0eU9iamVjdC5zcG9uc0lkICE9IFwiXCIpIHtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gXCJTcG9uc0lkPVwiICsgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgKyBcIiZcIjtcbiAgICB9XG5cbiAgICBpZiAoYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgIT0gZmFsc2UpIHtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmc7XG4gICAgfVxuXG4gICAgaWYgKHF1ZXJ5U3RyaW5nW3F1ZXJ5U3RyaW5nLmxlbmd0aCAtIDFdID09IFwiJlwiKSB7IC8vIElmIGxhc3QgY2hhcmFjdGVyIGlzICZcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoMCwgcXVlcnlTdHJpbmcubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgcmVtb3ZlRW1wdHlFbGVtZW50cyA9IChhcnJheSkgPT4ge1xuICAgIGZvciAodmFyIGk9MDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT0gXCJcIikge1xuICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICAgIHZhciBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9IFwiXCI7XG4gICAgdmFyIGFkVXRpbFRhcmdldE9iamVjdCA9IGdldEFkVXRpbFRhcmdldCgpO1xuXG4gICAgaWYgKGFkVXRpbFRhcmdldE9iamVjdCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5vdFRhZ3MgPSBbXCJQb3N0SURcIixcIkF1dGhvclwiLFwiQ2F0ZWdvcnlcIixcIkNvbnRlbnRUeXBlXCJdO1xuICAgIHZhciBlbGVtZW50cyA9IFtdO1xuICAgIGVsZW1lbnRzW1wiVGFnc1wiXSA9IFwiXCI7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gYWRVdGlsVGFyZ2V0T2JqZWN0KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFkVXRpbFRhcmdldE9iamVjdFtrZXldO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgdmFsdWUgPT0gXCJhcnJheVwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4oXCIsXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vdFRhZ3MuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW1wiVGFnc1wiXSArPSB2YWx1ZSArIFwiLFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnRzW1wiVGFnc1wiXVtlbGVtZW50c1tcIlRhZ3NcIl0ubGVuZ3RoIC0gMV0gPT0gXCIsXCIpIHtcbiAgICAgICAgZWxlbWVudHNbXCJUYWdzXCJdID0gZWxlbWVudHNbXCJUYWdzXCJdLnN1YnN0cmluZygwLCBlbGVtZW50c1tcIlRhZ3NcIl0ubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIGVsZW1lbnRzKSB7XG4gICAgICAgIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nICs9IGtleSArIFwiPVwiICsgZWxlbWVudHNba2V5XSArIFwiJlwiO1xuICAgIH1cblxuICAgIHJldHVybiBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbn07XG5cbmNvbnN0IGdldEFkVXRpbGl0eSA9ICgpID0+IHtcbiAgICB2YXIgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgICBpZiAoaW5JZnJhbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkVXRpbGl0eSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnQuYWRVdGlsaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCRlKXt9IC8vdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGFjY2Vzc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmFkVXRpbGl0eSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hZFV0aWxpdHk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG5jb25zdCBnZXRSZXF1ZXN0VXJpID0oKSA9PiB7XG4gICAgdmFyIGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuICAgIHZhciByZXF1ZXN0VXJpID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICAgaWYgKGluSWZyYW1lKSB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHJlcXVlc3RVcmkgPSBwYXJlbnQubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goJGUpey8vdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGlzc3Vlcy5cbiAgICAgICAgICAgIHJlcXVlc3RVcmwgPSAnJzsgLy9zZXR0aW5nIGl0IHRvIGZhbHNlLCBzbyBhcyB0byBub3QgcmVwb3J0IHdyb25nIHZhbHVlcy5cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdFVyaTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldCA9ICgpID0+IHtcbiAgICB2YXIgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgICBpZiAoaW5JZnJhbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkdXRpbF90YXJnZXQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50LmFkdXRpbF90YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goJGUpe30gLy90byBjYXRjaCBjcm9zcyBvcmlnaW4gZXJyb3JzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuYWR1dGlsX3RhcmdldCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hZHV0aWxfdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IHNldHVwSU1BMyA9IChwbGF5ZXIsIHBsdWdpbnMpID0+IHtcblxuXG4gICAgdmFyIGFkU2VydmVyVXJsID0gXCJcIjtcblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMuc2V0dGluZ3MgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgPSBwbGF5ZXIuaW1hMy5zZXR0aW5ncy5zZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKHBsdWdpbnMuYWRfc2VydmVyX3VybCAhPSBcIlwiKSB7XG4gICAgICAgIGFkU2VydmVyVXJsID0gcGx1Z2lucy5hZF9zZXJ2ZXJfdXJsO1xuICAgIH1cblxuICAgIC8vIGlmIGl0IGlzIGxvYWRlZCBmcm9tIGJyaWdodGNvdmVcbiAgICBpZiAocGx1Z2lucy5zeW5kaWNhdGVkX2VuYWJsZSkge1xuICAgICAgICB2YXIgc3luZGljYXRlZCA9IGdldFN5bmRpY2F0ZWRUYWcocGxheWVyKTtcbiAgICAgICAgaWYgKHN5bmRpY2F0ZWQpIHtcbiAgICAgICAgICAgIGFkU2VydmVyVXJsID0gYWRkVG9JVShhZFNlcnZlclVybCwgNSwgc3luZGljYXRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY3VzdG9tUGFyYW1zID0gZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmcoKTtcbiAgICBpZiAoY3VzdG9tUGFyYW1zICE9IFwiXCIpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgKz0gXCImY3VzdF9wYXJhbXM9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBwbGF5ZXIuaW1hMyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBwbGF5ZXIuaW1hMyh7XG4gICAgICAgICAgICBhZFRlY2hPcmRlcjogW1wiaHRtbDVcIiwgXCJmbGFzaFwiXSxcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDAsXG4gICAgICAgICAgICByZXF1ZXN0TW9kZTogJ29ubG9hZCcsXG4gICAgICAgICAgICBsb2FkaW5nU3Bpbm5lcjogdHJ1ZSxcbiAgICAgICAgICAgIHNlcnZlclVybDogYWRTZXJ2ZXJVcmxcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmltYTMuc2V0dGluZ3Muc2VydmVyVXJsID0gYWRTZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zLmFkX21hY3JvX3JlcGxhY2VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwbGF5ZXIuaW1hMy5hZE1hY3JvUmVwbGFjZW1lbnQgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHBsdWdpbnMuYWRfbWFjcm9fcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoaSkuam9pbihlbmNvZGVVUklDb21wb25lbnQocGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogQSB2aWRlby5qcyBwbHVnaW4uXG4gKlxuICogSW4gdGhlIHBsdWdpbiBmdW5jdGlvbiwgdGhlIHZhbHVlIG9mIGB0aGlzYCBpcyBhIHZpZGVvLmpzIGBQbGF5ZXJgXG4gKiBpbnN0YW5jZS4gT24gcmVhZHkgd2UgaW5pdGlhbGl6ZSB0aGUgcGx1Z2lucyB0aGF0IGFyZSByZXF1aXJlZC5cbiAqXG4gKiBAZnVuY3Rpb24gcmRtUGx1Z2luTG9hZGVyXG4gKiBAcGFyYW0gICAge09iamVjdH0gW29wdGlvbnM9e31dXG4gKiAgICAgICAgICAgQW4gb2JqZWN0IG9mIG9wdGlvbnMgbGVmdCB0byB0aGUgcGx1Z2luIGF1dGhvciB0byBkZWZpbmUuXG4gKi9cbmNvbnN0IHJkbVBsdWdpbkxvYWRlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICB0aGlzLnJlYWR5KCgpID0+IHtcbiAgICAgIG9uUGxheWVyUmVhZHkodGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgfSk7XG5cbiAgdGhpcy5sb2FkZWRtZXRhZGF0YSgoKSA9PiB7XG4gICAgICBzZXR1cElNQTModGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgfSk7XG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbigncmRtUGx1Z2luTG9hZGVyJywgcmRtUGx1Z2luTG9hZGVyKTtcblxuLy8gSW5jbHVkZSB0aGUgdmVyc2lvbiBudW1iZXIuXG5yZG1QbHVnaW5Mb2FkZXIuVkVSU0lPTiA9ICdfX1ZFUlNJT05fXyc7XG5cbmV4cG9ydCBkZWZhdWx0IHJkbVBsdWdpbkxvYWRlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9pbmRleC5qcyIsIm1vZHVsZS5leHBvcnRzID0gdmlkZW9qcztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInZpZGVvanNcIlxuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9