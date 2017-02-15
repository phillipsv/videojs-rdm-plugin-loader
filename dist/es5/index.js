"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _video = require("video.js");

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