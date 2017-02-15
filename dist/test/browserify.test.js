(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _index = require(2);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

QUnit.module("browserify require"); /**
                                     * browserify test 
                                     */

QUnit.test("videojs-rdm-plugin-loader should be requireable via browserify", function (assert) {
  assert.ok(_index2.default, "videojs-rdm-plugin-loader is required properly");
});

},{"2":2}],2:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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
rdmPluginLoader.VERSION = '0.0.0';

exports.default = rdmPluginLoader;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L3Rlc3QvYnJvd3NlcmlmeS5zdGFydC5qcyIsInNyYy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7Ozs7OztBQUVBLE1BQU0sTUFBTixDQUFhLG9CQUFiLEUsQ0FMQTs7OztBQU1BLE1BQU0sSUFBTixDQUFXLGdFQUFYLEVBQTZFLFVBQUMsTUFBRCxFQUFZO0FBQ3ZGLFNBQU8sRUFBUCxrQkFBZSxnREFBZjtBQUNELENBRkQ7Ozs7Ozs7Ozs7OztBQ05BOzs7Ozs7QUFFQTtBQUNBLElBQU0sV0FBVyxFQUFqQjs7QUFFQTtBQUNBLElBQU0saUJBQWlCLGdCQUFRLGNBQVIsSUFBMEIsZ0JBQVEsTUFBekQ7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7OztBQWFBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBcUIsQ0FBRSxDQUE3Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxHQUFNO0FBQ3JCLFdBQU8sT0FBTyxJQUFQLEtBQWdCLE9BQU8sR0FBOUI7QUFDSCxDQUZEOztBQUlBLElBQU0scUJBQXFCLFNBQXJCLGtCQUFxQixDQUFDLElBQUQsRUFBTyxHQUFQLEVBQWU7QUFDdEMsV0FBTyxLQUFLLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCLENBQVA7QUFDQSxRQUFJLENBQUMsR0FBTCxFQUFVO0FBQ04sY0FBTSxPQUFPLFFBQVAsQ0FBZ0IsSUFBdEI7QUFDSDs7QUFFRCxRQUFJLFFBQVEsSUFBSSxNQUFKLENBQVcsU0FBUyxJQUFULEdBQWdCLG1CQUEzQixDQUFaO0FBQUEsUUFDSSxVQUFVLE1BQU0sSUFBTixDQUFXLEdBQVgsQ0FEZDs7QUFHQSxRQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1YsZUFBTyxJQUFQO0FBQ0g7QUFDRCxRQUFJLENBQUMs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V0FBNUMsRUFBeUQ7QUFDckQsZUFBTyxJQUFQLENBQVksa0JBQVosR0FBaUMsVUFBVSxHQUFWLEVBQWU7QUFDNUMsZ0JBQUksYUFBYSxRQUFRLG9CQUF6QjtBQUNBLGlCQUFLLElBQUksQ0FBVCxJQUFjLFVBQWQsRUFBMEI7QUFDdEIsc0JBQU0sSUFBSSxLQUFKLENBQVUsQ0FBVixFQUFhLElBQWIsQ0FBa0IsbUJBQW1CLFdBQVcsQ0FBWCxDQUFuQixDQUFsQixDQUFOO0FBQ0g7QUFDRCxtQkFBTyxHQUFQO0FBQ0gsU0FORDtBQU9IO0FBQ0osQ0FoREQ7O0FBa0RBOzs7Ozs7Ozs7O0FBVUEsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBUyxPQUFULEVBQWtCO0FBQUE7O0FBRXhDLFNBQUssS0FBTCxDQUFXLFlBQU07QUFDYiw2QkFBb0IsZ0JBQVEsWUFBUixDQUFxQixRQUFyQixFQUErQixPQUEvQixDQUFwQjtBQUNILEtBRkQ7O0FBSUEsU0FBSyxjQUFMLENBQW9CLFlBQU07QUFDdEIseUJBQWdCLGdCQUFRLFlBQVIsQ0FBcUIsUUFBckIsRUFBK0IsT0FBL0IsQ0FBaEI7QUFDSCxLQUZEO0FBR0QsQ0FURDs7QUFXQTtBQUNBLGVBQWUsaUJBQWYsRUFBa0MsZUFBbEM7O0FBRUE7QUFDQSxnQkFBZ0IsT0FBaEIsR0FBMEIsYUFBMUI7O2tCQUVlLGUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBicm93c2VyaWZ5IHRlc3QgXG4gKi9cbmltcG9ydCBwa2cgZnJvbSBcIi4uLy4uL3NyYy9qcy9pbmRleC5qc1wiO1xuXG5RVW5pdC5tb2R1bGUoXCJicm93c2VyaWZ5IHJlcXVpcmVcIik7XG5RVW5pdC50ZXN0KFwidmlkZW9qcy1yZG0tcGx1Z2luLWxvYWRlciBzaG91bGQgYmUgcmVxdWlyZWFibGUgdmlhIGJyb3dzZXJpZnlcIiwgKGFzc2VydCkgPT4ge1xuICBhc3NlcnQub2socGtnLCBcInZpZGVvanMtcmRtLXBsdWdpbi1sb2FkZXIgaXMgcmVxdWlyZWQgcHJvcGVybHlcIik7XG59KTsiLCJpbXBvcnQgdmlkZW9qcyBmcm9tICd2aWRlby5qcyc7XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbmNvbnN0IGRlZmF1bHRzID0ge307XG5cbi8vIENyb3NzLWNvbXBhdGliaWxpdHkgZm9yIFZpZGVvLmpzIDUgYW5kIDYuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG4vLyBjb25zdCBkb20gPSB2aWRlb2pzLmRvbSB8fCB2aWRlb2pzO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGludm9rZSB3aGVuIHRoZSBwbGF5ZXIgaXMgcmVhZHkuXG4gKlxuICogVGhpcyBpcyBhIGdyZWF0IHBsYWNlIGZvciB5b3VyIHBsdWdpbiB0byBpbml0aWFsaXplIGl0c2VsZi4gV2hlbiB0aGlzXG4gKiBmdW5jdGlvbiBpcyBjYWxsZWQsIHRoZSBwbGF5ZXIgd2lsbCBoYXZlIGl0cyBET00gYW5kIGNoaWxkIGNvbXBvbmVudHNcbiAqIGluIHBsYWNlLlxuICpcbiAqIEBmdW5jdGlvbiBvblBsYXllclJlYWR5XG4gKiBAcGFyYW0gICAge1BsYXllcn0gcGxheWVyXG4gKiAgICAgICAgICAgQSBWaWRlby5qcyBwbGF5ZXIuXG4gKiBAcGFyYW0gICAge09iamVjdH0gW29wdGlvbnM9e31dXG4gKiAgICAgICAgICAgQW4gb2JqZWN0IG9mIG9wdGlvbnMgbGVmdCB0byB0aGUgcGx1Z2luIGF1dGhvciB0byBkZWZpbmUuXG4gKi9cbmNvbnN0IG9uUGxheWVyUmVhZHkgPSAocGxheWVyLCBvcHRpb25zKSA9PiB7fTtcblxuLy8gY29uc3QgZ2V0VXJsUGFyYW1ldGVyID0gKG5hbWUpID0+IHtcbi8vICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuLy8gICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBuYW1lICsgJz0oW14mI10qKScpO1xuLy8gICAgICAgICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcbi8vICAgICAgICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbi8vIH07XG5cbmNvbnN0IGlzSW5JZnJhbWUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wO1xufTtcblxuY29uc3QgZ2V0UGFyYW1ldGVyQnlOYW1lID0gKG5hbWUsIHVybCkgPT4ge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtcXF1dL2csIFwiXFxcXCQmXCIpO1xuICAgIGlmICghdXJsKSB7XG4gICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgIH1cblxuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbPyZdXCIgKyBuYW1lICsgXCIoPShbXiYjXSopfCZ8I3wkKVwiKSxcbiAgICAgICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcblxuICAgIGlmICghcmVzdWx0cykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFyZXN1bHRzWzJdKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XG59O1xuXG5jb25zdCBnZXRTeW5kaWNhdGVkVGFnID0gKHBsYXllcikgPT4ge1xuICAgIHZhciB0YWdzID0gcGxheWVyLm1lZGlhaW5mby50YWdzO1xuICAgIHZhciBzeW5kaWNhdGVkID0gXCJcIjtcbiAgICBmb3IodmFyIGkgaW4gdGFncykge1xuICAgICAgICBpZiAodGFnc1tpXS5pbmRleE9mKFwic3luZGljYXRlZD1cIikgPj0gMCkge1xuICAgICAgICAgICAgc3luZGljYXRlZCA9IHRhZ3NbaV0uc3BsaXQoXCI9XCIpWzFdOyAvLyBHZXR0aW5nIHRoZSB2YWx1ZSBvZiBzeW5kaWNhdGVkXG4gICAgICAgICAgICByZXR1cm4gc3luZGljYXRlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBhZGRUb0lVID0gKHVybCwgcG9zaXRpb24sIGFkZGl0aW9uKSA9PiB7XG4gICAgdmFyIGl1ID0gZ2V0UGFyYW1ldGVyQnlOYW1lKFwiaXVcIiwgdXJsKTtcbiAgICB2YXIgb3JpZ2luYWxJVSA9IGl1O1xuXG4gICAgaWYgKGl1LmNoYXJBdCgwKSA9PSBcIi9cIikge1xuICAgICAgICBpdSA9IGl1LnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICBpdVBhcnRzID0gaXUuc3BsaXQoXCIvXCIpO1xuXG4gICAgdmFyIGFycmF5UG9zaXRpb24gPSBwb3NpdGlvbiAtIDE7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5UG9zaXRpb247IGkrKykge1xuICAgICAgICBpZiAoaXVQYXJ0c1tpXSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBpdVBhcnRzW2ldID0gXCJ2aWRlb1wiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXVQYXJ0c1thcnJheVBvc2l0aW9uXSA9IGFkZGl0aW9uO1xuXG4gICAgaXUgPSBcIi9cIiArIGl1UGFydHMuam9pbihcIi9cIik7XG5cbiAgICByZXR1cm4gdXJsLnJlcGxhY2Uob3JpZ2luYWxJVSwgaXUpO1xufTtcblxuY29uc3QgZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmcgPSAoKSA9PiB7XG5cbiAgICB2YXIgcXVlcnlTdHJpbmcgPSBcIlwiO1xuXG4gICAgdmFyIHJlcXVlc3RVcmkgPSBnZXRSZXF1ZXN0VXJpKCk7XG4gICAgdmFyIHJlcXVlc3RVcmlQYXJ0cyA9IHJlcXVlc3RVcmkuc3BsaXQoXCIvXCIpO1xuICAgIHJlcXVlc3RVcmlQYXJ0cyA9IHJlbW92ZUVtcHR5RWxlbWVudHMocmVxdWVzdFVyaVBhcnRzKTtcblxuICAgIHZhciBhZFV0aWxpdHlPYmplY3QgPSBnZXRBZFV0aWxpdHkoKTtcbiAgICB2YXIgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSBnZXRBZFV0aWxUYXJnZXRRdWVyeVN0cmluZygpO1xuXG5cbiAgICBpZiAocmVxdWVzdFVyaVBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gXCJzZWN0aW9uPVwiICsgcmVxdWVzdFVyaVBhcnRzWzBdICsgXCImXCI7XG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IFwicGFnZT1cIiArIHJlcXVlc3RVcmlQYXJ0cy5qb2luKFwiLFwiKSArIFwiJlwiO1xuICAgIH1cblxuICAgIGlmIChhZFV0aWxpdHlPYmplY3QgIT0gZmFsc2UgJiYgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgIT0gXCJcIikge1xuICAgICAgICBxdWVyeVN0cmluZyArPSBcIlNwb25zSWQ9XCIgKyBhZFV0aWxpdHlPYmplY3Quc3BvbnNJZCArIFwiJlwiO1xuICAgIH1cblxuICAgIGlmIChhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyAhPSBmYWxzZSkge1xuICAgICAgICBxdWVyeVN0cmluZyArPSBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbiAgICB9XG5cbiAgICBpZiAocXVlcnlTdHJpbmdbcXVlcnlTdHJpbmcubGVuZ3RoIC0gMV0gPT0gXCImXCIpIHsgLy8gSWYgbGFzdCBjaGFyYWN0ZXIgaXMgJlxuICAgICAgICBxdWVyeVN0cmluZyA9IHF1ZXJ5U3RyaW5nLnN1YnN0cmluZygwLCBxdWVyeVN0cmluZy5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcXVlcnlTdHJpbmc7XG59O1xuXG5jb25zdCByZW1vdmVFbXB0eUVsZW1lbnRzID0gKGFycmF5KSA9PiB7XG4gICAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PSBcIlwiKSB7XG4gICAgICAgICAgICBhcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpLS07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufTtcblxuY29uc3QgZ2V0QWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gICAgdmFyIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gXCJcIjtcbiAgICB2YXIgYWRVdGlsVGFyZ2V0T2JqZWN0ID0gZ2V0QWRVdGlsVGFyZ2V0KCk7XG5cbiAgICBpZiAoYWRVdGlsVGFyZ2V0T2JqZWN0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbm90VGFncyA9IFtcIlBvc3RJRFwiLFwiQXV0aG9yXCIsXCJDYXRlZ29yeVwiLFwiQ29udGVudFR5cGVcIl07XG4gICAgdmFyIGVsZW1lbnRzID0gW107XG4gICAgZWxlbWVudHNbXCJUYWdzXCJdID0gXCJcIjtcblxuICAgIGZvciAodmFyIGtleSBpbiBhZFV0aWxUYXJnZXRPYmplY3QpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYWRVdGlsVGFyZ2V0T2JqZWN0W2tleV07XG5cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiIHx8IHR5cGVvZiB2YWx1ZSA9PSBcImFycmF5XCIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuam9pbihcIixcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm90VGFncy5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICAgICAgZWxlbWVudHNba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHNbXCJUYWdzXCJdICs9IHZhbHVlICsgXCIsXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudHNbXCJUYWdzXCJdW2VsZW1lbnRzW1wiVGFnc1wiXS5sZW5ndGggLSAxXSA9PSBcIixcIikge1xuICAgICAgICBlbGVtZW50c1tcIlRhZ3NcIl0gPSBlbGVtZW50c1tcIlRhZ3NcIl0uc3Vic3RyaW5nKDAsIGVsZW1lbnRzW1wiVGFnc1wiXS5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZWxlbWVudHMpIHtcbiAgICAgICAgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgKz0ga2V5ICsgXCI9XCIgKyBlbGVtZW50c1trZXldICsgXCImXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgZ2V0QWRVdGlsaXR5ID0gKCkgPT4ge1xuICAgIHZhciBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcblxuICAgIGlmIChpbklmcmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuYWRVdGlsaXR5ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5hZFV0aWxpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goJGUpe30gLy90byBjYXRjaCBjcm9zcy1vcmlnaW4gYWNjZXNzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuYWRVdGlsaXR5ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmFkVXRpbGl0eTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5cbmNvbnN0IGdldFJlcXVlc3RVcmkgPSgpID0+IHtcbiAgICB2YXIgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG4gICAgdmFyIHJlcXVlc3RVcmkgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgICBpZiAoaW5JZnJhbWUpIHtcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgcmVxdWVzdFVyaSA9IHBhcmVudC5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCgkZSl7Ly90byBjYXRjaCBjcm9zcy1vcmlnaW4gaXNzdWVzLlxuICAgICAgICAgICAgcmVxdWVzdFVybCA9ICcnOyAvL3NldHRpbmcgaXQgdG8gZmFsc2UsIHNvIGFzIHRvIG5vdCByZXBvcnQgd3JvbmcgdmFsdWVzLlxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0VXJpO1xufTtcblxuY29uc3QgZ2V0QWRVdGlsVGFyZ2V0ID0gKCkgPT4ge1xuICAgIHZhciBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcblxuICAgIGlmIChpbklmcmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnQuYWR1dGlsX3RhcmdldCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnQuYWR1dGlsX3RhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCgkZSl7fSAvL3RvIGNhdGNoIGNyb3NzIG9yaWdpbiBlcnJvcnNcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5hZHV0aWxfdGFyZ2V0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmFkdXRpbF90YXJnZXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3Qgc2V0dXBJTUEzID0gKHBsYXllciwgcGx1Z2lucykgPT4ge1xuXG5cbiAgICB2YXIgYWRTZXJ2ZXJVcmwgPSBcIlwiO1xuXG4gICAgaWYgKHR5cGVvZiBwbGF5ZXIuaW1hMy5zZXR0aW5ncyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBhZFNlcnZlclVybCA9IHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybDtcbiAgICB9XG5cbiAgICBpZiAocGx1Z2lucy5hZF9zZXJ2ZXJfdXJsICE9IFwiXCIpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgPSBwbHVnaW5zLmFkX3NlcnZlcl91cmw7XG4gICAgfVxuXG4gICAgLy8gaWYgaXQgaXMgbG9hZGVkIGZyb20gYnJpZ2h0Y292ZVxuICAgIGlmIChwbHVnaW5zLnN5bmRpY2F0ZWRfZW5hYmxlKSB7XG4gICAgICAgIHZhciBzeW5kaWNhdGVkID0gZ2V0U3luZGljYXRlZFRhZyhwbGF5ZXIpO1xuICAgICAgICBpZiAoc3luZGljYXRlZCkge1xuICAgICAgICAgICAgYWRTZXJ2ZXJVcmwgPSBhZGRUb0lVKGFkU2VydmVyVXJsLCA1LCBzeW5kaWNhdGVkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjdXN0b21QYXJhbXMgPSBnZXRDdXN0b21QYXJhbXNRdWVyeVN0cmluZygpO1xuICAgIGlmIChjdXN0b21QYXJhbXMgIT0gXCJcIikge1xuICAgICAgICBhZFNlcnZlclVybCArPSBcIiZjdXN0X3BhcmFtcz1cIiArIGVuY29kZVVSSUNvbXBvbmVudChjdXN0b21QYXJhbXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHBsYXllci5pbWEzICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHBsYXllci5pbWEzKHtcbiAgICAgICAgICAgIGFkVGVjaE9yZGVyOiBbXCJodG1sNVwiLCBcImZsYXNoXCJdLFxuICAgICAgICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgICAgICAgdGltZW91dDogNzAwMCxcbiAgICAgICAgICAgIHJlcXVlc3RNb2RlOiAnb25sb2FkJyxcbiAgICAgICAgICAgIGxvYWRpbmdTcGlubmVyOiB0cnVlLFxuICAgICAgICAgICAgc2VydmVyVXJsOiBhZFNlcnZlclVybFxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXIuaW1hMy5zZXR0aW5ncy5zZXJ2ZXJVcmwgPSBhZFNlcnZlclVybDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBsdWdpbnMuYWRfbWFjcm9fcmVwbGFjZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBsYXllci5pbWEzLmFkTWFjcm9SZXBsYWNlbWVudCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gcGx1Z2lucy5hZF9tYWNyb19yZXBsYWNlbWVudDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcGFyYW1ldGVycykge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybC5zcGxpdChpKS5qb2luKGVuY29kZVVSSUNvbXBvbmVudChwYXJhbWV0ZXJzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBBIHZpZGVvLmpzIHBsdWdpbi5cbiAqXG4gKiBJbiB0aGUgcGx1Z2luIGZ1bmN0aW9uLCB0aGUgdmFsdWUgb2YgYHRoaXNgIGlzIGEgdmlkZW8uanMgYFBsYXllcmBcbiAqIGluc3RhbmNlLiBPbiByZWFkeSB3ZSBpbml0aWFsaXplIHRoZSBwbHVnaW5zIHRoYXQgYXJlIHJlcXVpcmVkLlxuICpcbiAqIEBmdW5jdGlvbiByZG1QbHVnaW5Mb2FkZXJcbiAqIEBwYXJhbSAgICB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAqICAgICAgICAgICBBbiBvYmplY3Qgb2Ygb3B0aW9ucyBsZWZ0IHRvIHRoZSBwbHVnaW4gYXV0aG9yIHRvIGRlZmluZS5cbiAqL1xuY29uc3QgcmRtUGx1Z2luTG9hZGVyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gIHRoaXMucmVhZHkoKCkgPT4ge1xuICAgICAgb25QbGF5ZXJSZWFkeSh0aGlzLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucykpO1xuICB9KTtcblxuICB0aGlzLmxvYWRlZG1ldGFkYXRhKCgpID0+IHtcbiAgICAgIHNldHVwSU1BMyh0aGlzLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucykpO1xuICB9KTtcbn07XG5cbi8vIFJlZ2lzdGVyIHRoZSBwbHVnaW4gd2l0aCB2aWRlby5qcy5cbnJlZ2lzdGVyUGx1Z2luKCdyZG1QbHVnaW5Mb2FkZXInLCByZG1QbHVnaW5Mb2FkZXIpO1xuXG4vLyBJbmNsdWRlIHRoZSB2ZXJzaW9uIG51bWJlci5cbnJkbVBsdWdpbkxvYWRlci5WRVJTSU9OID0gJ19fVkVSU0lPTl9fJztcblxuZXhwb3J0IGRlZmF1bHQgcmRtUGx1Z2luTG9hZGVyO1xuIl19
