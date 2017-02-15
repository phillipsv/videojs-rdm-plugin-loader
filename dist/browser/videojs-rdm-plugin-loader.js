(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsRdmPluginLoader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7O0FBRUE7QUFDQSxJQUFNLFdBQVcsRUFBakI7O0FBRUE7QUFDQSxJQUFNLGlCQUFpQixnQkFBUSxjQUFSLElBQTBCLGdCQUFRLE1BQXpEO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFNLGdCQUFnQixTQUFoQixhQUFnQixDQUFDLE1BQUQsRUFBUyxPQUFULEVBQXFCLENBQUUsQ0FBN0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQU0sYUFBYSxTQUFiLFVBQWEsR0FBTTtBQUNyQixXQUFPLE9BQU8sSUFBUCxLQUFnQixPQUFPLEdBQTlCO0FBQ0gsQ0FGRDs7QUFJQSxJQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FBQyxJQUFELEVBQU8sR0FBUCxFQUFlO0FBQ3RDLFdBQU8sS0FBSyxPQUFMLENBQWEsU0FBYixFQUF3QixNQUF4QixDQUFQO0FBQ0EsUUFBSSxDQUFDLEdBQUwsRUFBVTtBQUNOLGNBQU0sT0FBTyxRQUFQLENBQWdCLElBQXRCO0FBQ0g7O0FBRUQsUUFBSSxRQUFRLElBQUksTUFBSixDQUFXLFNBQVMsSUFBVCxHQUFnQixtQkFBM0IsQ0FBWjtBQUFBLFFBQ0ksVUFBVSxNQUFNLElBQU4sQ0FBVyxHQUFYLENBRGQ7O0FBR0EsUUFBSSxDQUFDLE9BQUwsRUFBYztBQUNWLGVBQU8sSUFBUDtBQUNIO0FBQ0QsUUFBSSxDQUFDLFFBQVEsQ0FBUixDQUFMLEVBQWlCO0FBQ2IsZUFBTyxFQUFQO0FBQ0g7O0FBRUQsV0FBTyxtQkFBbUIsUUFBUSxDQUFSLEVBQVcsT0FBWCxDQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFuQixDQUFQO0FBQ0gsQ0FqQkQ7O0FBbUJBLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFDLE1BQUQs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LENBQWtCLG1CQUFtQixXQUFXLENBQVgsQ0FBbkIsQ0FBbEIsQ0FBTjtBQUNIO0FBQ0QsbUJBQU8sR0FBUDtBQUNILFNBTkQ7QUFPSDtBQUNKLENBaEREOztBQWtEQTs7Ozs7Ozs7OztBQVVBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQVMsT0FBVCxFQUFrQjtBQUFBOztBQUV4QyxTQUFLLEtBQUwsQ0FBVyxZQUFNO0FBQ2IsNkJBQW9CLGdCQUFRLFlBQVIsQ0FBcUIsUUFBckIsRUFBK0IsT0FBL0IsQ0FBcEI7QUFDSCxLQUZEOztBQUlBLFNBQUssY0FBTCxDQUFvQixZQUFNO0FBQ3RCLHlCQUFnQixnQkFBUSxZQUFSLENBQXFCLFFBQXJCLEVBQStCLE9BQS9CLENBQWhCO0FBQ0gsS0FGRDtBQUdELENBVEQ7O0FBV0E7QUFDQSxlQUFlLGlCQUFmLEVBQWtDLGVBQWxDOztBQUVBO0FBQ0EsZ0JBQWdCLE9BQWhCLEdBQTBCLGFBQTFCOztrQkFFZSxlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcblxuLy8gRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgcGx1Z2luLlxuY29uc3QgZGVmYXVsdHMgPSB7fTtcblxuLy8gQ3Jvc3MtY29tcGF0aWJpbGl0eSBmb3IgVmlkZW8uanMgNSBhbmQgNi5cbmNvbnN0IHJlZ2lzdGVyUGx1Z2luID0gdmlkZW9qcy5yZWdpc3RlclBsdWdpbiB8fCB2aWRlb2pzLnBsdWdpbjtcbi8vIGNvbnN0IGRvbSA9IHZpZGVvanMuZG9tIHx8IHZpZGVvanM7XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gdGhlIHBsYXllciBpcyByZWFkeS5cbiAqXG4gKiBUaGlzIGlzIGEgZ3JlYXQgcGxhY2UgZm9yIHlvdXIgcGx1Z2luIHRvIGluaXRpYWxpemUgaXRzZWxmLiBXaGVuIHRoaXNcbiAqIGZ1bmN0aW9uIGlzIGNhbGxlZCwgdGhlIHBsYXllciB3aWxsIGhhdmUgaXRzIERPTSBhbmQgY2hpbGQgY29tcG9uZW50c1xuICogaW4gcGxhY2UuXG4gKlxuICogQGZ1bmN0aW9uIG9uUGxheWVyUmVhZHlcbiAqIEBwYXJhbSAgICB7UGxheWVyfSBwbGF5ZXJcbiAqICAgICAgICAgICBBIFZpZGVvLmpzIHBsYXllci5cbiAqIEBwYXJhbSAgICB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAqICAgICAgICAgICBBbiBvYmplY3Qgb2Ygb3B0aW9ucyBsZWZ0IHRvIHRoZSBwbHVnaW4gYXV0aG9yIHRvIGRlZmluZS5cbiAqL1xuY29uc3Qgb25QbGF5ZXJSZWFkeSA9IChwbGF5ZXIsIG9wdGlvbnMpID0+IHt9O1xuXG4vLyBjb25zdCBnZXRVcmxQYXJhbWV0ZXIgPSAobmFtZSkgPT4ge1xuLy8gICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4vLyAgICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5hbWUgKyAnPShbXiYjXSopJyk7XG4vLyAgICAgICAgIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xuLy8gICAgICAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuLy8gfTtcblxuY29uc3QgaXNJbklmcmFtZSA9ICgpID0+IHtcbiAgICByZXR1cm4gd2luZG93LnNlbGYgIT09IHdpbmRvdy50b3A7XG59O1xuXG5jb25zdCBnZXRQYXJhbWV0ZXJCeU5hbWUgPSAobmFtZSwgdXJsKSA9PiB7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgXCJcXFxcJCZcIik7XG4gICAgaWYgKCF1cmwpIHtcbiAgICAgICAgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgfVxuXG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIls/Jl1cIiArIG5hbWUgKyBcIig9KFteJiNdKil8JnwjfCQpXCIpLFxuICAgICAgICByZXN1bHRzID0gcmVnZXguZXhlYyh1cmwpO1xuXG4gICAgaWYgKCFyZXN1bHRzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIXJlc3VsdHNbMl0pIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbn07XG5cbmNvbnN0IGdldFN5bmRpY2F0ZWRUYWcgPSAocGxheWVyKSA9PiB7XG4gICAgdmFyIHRhZ3MgPSBwbGF5ZXIubWVkaWFpbmZvLnRhZ3M7XG4gICAgdmFyIHN5bmRpY2F0ZWQgPSBcIlwiO1xuICAgIGZvcih2YXIgaSBpbiB0YWdzKSB7XG4gICAgICAgIGlmICh0YWdzW2ldLmluZGV4T2YoXCJzeW5kaWNhdGVkPVwiKSA+PSAwKSB7XG4gICAgICAgICAgICBzeW5kaWNhdGVkID0gdGFnc1tpXS5zcGxpdChcIj1cIilbMV07IC8vIEdldHRpbmcgdGhlIHZhbHVlIG9mIHN5bmRpY2F0ZWRcbiAgICAgICAgICAgIHJldHVybiBzeW5kaWNhdGVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IGFkZFRvSVUgPSAodXJsLCBwb3NpdGlvbiwgYWRkaXRpb24pID0+IHtcbiAgICB2YXIgaXUgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoXCJpdVwiLCB1cmwpO1xuICAgIHZhciBvcmlnaW5hbElVID0gaXU7XG5cbiAgICBpZiAoaXUuY2hhckF0KDApID09IFwiL1wiKSB7XG4gICAgICAgIGl1ID0gaXUuc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIGl1UGFydHMgPSBpdS5zcGxpdChcIi9cIik7XG5cbiAgICB2YXIgYXJyYXlQb3NpdGlvbiA9IHBvc2l0aW9uIC0gMTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlQb3NpdGlvbjsgaSsrKSB7XG4gICAgICAgIGlmIChpdVBhcnRzW2ldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGl1UGFydHNbaV0gPSBcInZpZGVvXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpdVBhcnRzW2FycmF5UG9zaXRpb25dID0gYWRkaXRpb247XG5cbiAgICBpdSA9IFwiL1wiICsgaXVQYXJ0cy5qb2luKFwiL1wiKTtcblxuICAgIHJldHVybiB1cmwucmVwbGFjZShvcmlnaW5hbElVLCBpdSk7XG59O1xuXG5jb25zdCBnZXRDdXN0b21QYXJhbXNRdWVyeVN0cmluZyA9ICgpID0+IHtcblxuICAgIHZhciBxdWVyeVN0cmluZyA9IFwiXCI7XG5cbiAgICB2YXIgcmVxdWVzdFVyaSA9IGdldFJlcXVlc3RVcmkoKTtcbiAgICB2YXIgcmVxdWVzdFVyaVBhcnRzID0gcmVxdWVzdFVyaS5zcGxpdChcIi9cIik7XG4gICAgcmVxdWVzdFVyaVBhcnRzID0gcmVtb3ZlRW1wdHlFbGVtZW50cyhyZXF1ZXN0VXJpUGFydHMpO1xuXG4gICAgdmFyIGFkVXRpbGl0eU9iamVjdCA9IGdldEFkVXRpbGl0eSgpO1xuICAgIHZhciBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nKCk7XG5cblxuICAgIGlmIChyZXF1ZXN0VXJpUGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBxdWVyeVN0cmluZyArPSBcInNlY3Rpb249XCIgKyByZXF1ZXN0VXJpUGFydHNbMF0gKyBcIiZcIjtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gXCJwYWdlPVwiICsgcmVxdWVzdFVyaVBhcnRzLmpvaW4oXCIsXCIpICsgXCImXCI7XG4gICAgfVxuXG4gICAgaWYgKGFkVXRpbGl0eU9iamVjdCAhPSBmYWxzZSAmJiBhZFV0aWxpdHlPYmplY3Quc3BvbnNJZCAhPSBcIlwiKSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IFwiU3BvbnNJZD1cIiArIGFkVXRpbGl0eU9iamVjdC5zcG9uc0lkICsgXCImXCI7XG4gICAgfVxuXG4gICAgaWYgKGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nICE9IGZhbHNlKSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nO1xuICAgIH1cblxuICAgIGlmIChxdWVyeVN0cmluZ1txdWVyeVN0cmluZy5sZW5ndGggLSAxXSA9PSBcIiZcIikgeyAvLyBJZiBsYXN0IGNoYXJhY3RlciBpcyAmXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gcXVlcnlTdHJpbmcuc3Vic3RyaW5nKDAsIHF1ZXJ5U3RyaW5nLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBxdWVyeVN0cmluZztcbn07XG5cbmNvbnN0IHJlbW92ZUVtcHR5RWxlbWVudHMgPSAoYXJyYXkpID0+IHtcbiAgICBmb3IgKHZhciBpPTA7IGk8YXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09IFwiXCIpIHtcbiAgICAgICAgICAgIGFycmF5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59O1xuXG5jb25zdCBnZXRBZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgICB2YXIgYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgPSBcIlwiO1xuICAgIHZhciBhZFV0aWxUYXJnZXRPYmplY3QgPSBnZXRBZFV0aWxUYXJnZXQoKTtcblxuICAgIGlmIChhZFV0aWxUYXJnZXRPYmplY3QgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBub3RUYWdzID0gW1wiUG9zdElEXCIsXCJBdXRob3JcIixcIkNhdGVnb3J5XCIsXCJDb250ZW50VHlwZVwiXTtcbiAgICB2YXIgZWxlbWVudHMgPSBbXTtcbiAgICBlbGVtZW50c1tcIlRhZ3NcIl0gPSBcIlwiO1xuXG4gICAgZm9yICh2YXIga2V5IGluIGFkVXRpbFRhcmdldE9iamVjdCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBhZFV0aWxUYXJnZXRPYmplY3Rba2V5XTtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgfHwgdHlwZW9mIHZhbHVlID09IFwiYXJyYXlcIikge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5qb2luKFwiLFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub3RUYWdzLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgICAgICBlbGVtZW50c1trZXldID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50c1tcIlRhZ3NcIl0gKz0gdmFsdWUgKyBcIixcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbGVtZW50c1tcIlRhZ3NcIl1bZWxlbWVudHNbXCJUYWdzXCJdLmxlbmd0aCAtIDFdID09IFwiLFwiKSB7XG4gICAgICAgIGVsZW1lbnRzW1wiVGFnc1wiXSA9IGVsZW1lbnRzW1wiVGFnc1wiXS5zdWJzdHJpbmcoMCwgZWxlbWVudHNbXCJUYWdzXCJdLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBlbGVtZW50cykge1xuICAgICAgICBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyArPSBrZXkgKyBcIj1cIiArIGVsZW1lbnRzW2tleV0gKyBcIiZcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmc7XG59O1xuXG5jb25zdCBnZXRBZFV0aWxpdHkgPSAoKSA9PiB7XG4gICAgdmFyIGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuXG4gICAgaWYgKGluSWZyYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudC5hZFV0aWxpdHkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50LmFkVXRpbGl0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCgkZSl7fSAvL3RvIGNhdGNoIGNyb3NzLW9yaWdpbiBhY2Nlc3NcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5hZFV0aWxpdHkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuYWRVdGlsaXR5O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblxuY29uc3QgZ2V0UmVxdWVzdFVyaSA9KCkgPT4ge1xuICAgIHZhciBpbklmcmFtZSA9IGlzSW5JZnJhbWUoKTtcbiAgICB2YXIgcmVxdWVzdFVyaSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcblxuICAgIGlmIChpbklmcmFtZSkge1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICByZXF1ZXN0VXJpID0gcGFyZW50LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCRlKXsvL3RvIGNhdGNoIGNyb3NzLW9yaWdpbiBpc3N1ZXMuXG4gICAgICAgICAgICByZXF1ZXN0VXJsID0gJyc7IC8vc2V0dGluZyBpdCB0byBmYWxzZSwgc28gYXMgdG8gbm90IHJlcG9ydCB3cm9uZyB2YWx1ZXMuXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcXVlc3RVcmk7XG59O1xuXG5jb25zdCBnZXRBZFV0aWxUYXJnZXQgPSAoKSA9PiB7XG4gICAgdmFyIGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuXG4gICAgaWYgKGluSWZyYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcmVudC5hZHV0aWxfdGFyZ2V0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudC5hZHV0aWxfdGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCRlKXt9IC8vdG8gY2F0Y2ggY3Jvc3Mgb3JpZ2luIGVycm9yc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmFkdXRpbF90YXJnZXQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cuYWR1dGlsX3RhcmdldDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBzZXR1cElNQTMgPSAocGxheWVyLCBwbHVnaW5zKSA9PiB7XG5cblxuICAgIHZhciBhZFNlcnZlclVybCA9IFwiXCI7XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzLnNldHRpbmdzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGFkU2VydmVyVXJsID0gcGxheWVyLmltYTMuc2V0dGluZ3Muc2VydmVyVXJsO1xuICAgIH1cblxuICAgIGlmIChwbHVnaW5zLmFkX3NlcnZlcl91cmwgIT0gXCJcIikge1xuICAgICAgICBhZFNlcnZlclVybCA9IHBsdWdpbnMuYWRfc2VydmVyX3VybDtcbiAgICB9XG5cbiAgICAvLyBpZiBpdCBpcyBsb2FkZWQgZnJvbSBicmlnaHRjb3ZlXG4gICAgaWYgKHBsdWdpbnMuc3luZGljYXRlZF9lbmFibGUpIHtcbiAgICAgICAgdmFyIHN5bmRpY2F0ZWQgPSBnZXRTeW5kaWNhdGVkVGFnKHBsYXllcik7XG4gICAgICAgIGlmIChzeW5kaWNhdGVkKSB7XG4gICAgICAgICAgICBhZFNlcnZlclVybCA9IGFkZFRvSVUoYWRTZXJ2ZXJVcmwsIDUsIHN5bmRpY2F0ZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGN1c3RvbVBhcmFtcyA9IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nKCk7XG4gICAgaWYgKGN1c3RvbVBhcmFtcyAhPSBcIlwiKSB7XG4gICAgICAgIGFkU2VydmVyVXJsICs9IFwiJmN1c3RfcGFyYW1zPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KGN1c3RvbVBhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwbGF5ZXIuaW1hMyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcGxheWVyLmltYTMgIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcGxheWVyLmltYTMoe1xuICAgICAgICAgICAgYWRUZWNoT3JkZXI6IFtcImh0bWw1XCIsIFwiZmxhc2hcIl0sXG4gICAgICAgICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICAgICAgICB0aW1lb3V0OiA3MDAwLFxuICAgICAgICAgICAgcmVxdWVzdE1vZGU6ICdvbmxvYWQnLFxuICAgICAgICAgICAgbG9hZGluZ1NwaW5uZXI6IHRydWUsXG4gICAgICAgICAgICBzZXJ2ZXJVcmw6IGFkU2VydmVyVXJsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYXllci5pbWEzLnNldHRpbmdzLnNlcnZlclVybCA9IGFkU2VydmVyVXJsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGx1Z2lucy5hZF9tYWNyb19yZXBsYWNlbWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcGxheWVyLmltYTMuYWRNYWNyb1JlcGxhY2VtZW50ID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBwbHVnaW5zLmFkX21hY3JvX3JlcGxhY2VtZW50O1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnNwbGl0KGkpLmpvaW4oZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtZXRlcnNbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIEEgdmlkZW8uanMgcGx1Z2luLlxuICpcbiAqIEluIHRoZSBwbHVnaW4gZnVuY3Rpb24sIHRoZSB2YWx1ZSBvZiBgdGhpc2AgaXMgYSB2aWRlby5qcyBgUGxheWVyYFxuICogaW5zdGFuY2UuIE9uIHJlYWR5IHdlIGluaXRpYWxpemUgdGhlIHBsdWdpbnMgdGhhdCBhcmUgcmVxdWlyZWQuXG4gKlxuICogQGZ1bmN0aW9uIHJkbVBsdWdpbkxvYWRlclxuICogQHBhcmFtICAgIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICogICAgICAgICAgIEFuIG9iamVjdCBvZiBvcHRpb25zIGxlZnQgdG8gdGhlIHBsdWdpbiBhdXRob3IgdG8gZGVmaW5lLlxuICovXG5jb25zdCByZG1QbHVnaW5Mb2FkZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgdGhpcy5yZWFkeSgoKSA9PiB7XG4gICAgICBvblBsYXllclJlYWR5KHRoaXMsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKSk7XG4gIH0pO1xuXG4gIHRoaXMubG9hZGVkbWV0YWRhdGEoKCkgPT4ge1xuICAgICAgc2V0dXBJTUEzKHRoaXMsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKSk7XG4gIH0pO1xufTtcblxuLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB3aXRoIHZpZGVvLmpzLlxucmVnaXN0ZXJQbHVnaW4oJ3JkbVBsdWdpbkxvYWRlcicsIHJkbVBsdWdpbkxvYWRlcik7XG5cbi8vIEluY2x1ZGUgdGhlIHZlcnNpb24gbnVtYmVyLlxucmRtUGx1Z2luTG9hZGVyLlZFUlNJT04gPSAnX19WRVJTSU9OX18nO1xuXG5leHBvcnQgZGVmYXVsdCByZG1QbHVnaW5Mb2FkZXI7XG4iXX0=
