(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _global = require(1);

var _qunitjs = (typeof window !== "undefined" ? window['QUnit'] : typeof global !== "undefined" ? global['QUnit'] : null);

var _qunitjs2 = _interopRequireDefault(_qunitjs);

var _sinon = (typeof window !== "undefined" ? window['sinon'] : typeof global !== "undefined" ? global['sinon'] : null);

var _sinon2 = _interopRequireDefault(_sinon);

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _index = require(2);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Player = _video2.default.getComponent('Player');

_qunitjs2.default.module('sanity tests');

_qunitjs2.default.test('the environment is sane', function (assert) {
  assert.strictEqual(_typeof(Array.isArray), 'function', 'es5 exists');
  assert.strictEqual(typeof _sinon2.default === 'undefined' ? 'undefined' : _typeof(_sinon2.default), 'object', 'sinon exists');
  assert.strictEqual(typeof _video2.default === 'undefined' ? 'undefined' : _typeof(_video2.default), 'function', 'videojs exists');
  assert.strictEqual(typeof _index2.default === 'undefined' ? 'undefined' : _typeof(_index2.default), 'function', 'plugin is a function');
});

_qunitjs2.default.module('videojs-rdm-plugin-loader', {
  beforeEach: function beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = _sinon2.default.useFakeTimers();

    this.fixture = _global.document.getElementById('qunit-fixture');
    this.video = _global.document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = (0, _video2.default)(this.video);
  },
  afterEach: function afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

_qunitjs2.default.test('registers itself with video.js', function (assert) {
  assert.expect(2);

  assert.strictEqual(_typeof(Player.prototype.rdmPluginLoader), 'function', 'videojs-rdm-plugin-loader plugin was registered');

  this.player.rdmPluginLoader();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(this.player.hasClass('vjs-rdm-plugin-loader'), 'the plugin adds a class to the player');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"1":1,"2":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsInNyYy9qcy9pbmRleC5qcyIsInRlc3QvaW5kZXgudGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ1RBOzs7Ozs7QUFFQTtBQUNBLElBQU0sV0FBVyxFQUFqQjs7QUFFQTtBQUNBLElBQU0saUJBQWlCLGdCQUFRLGNBQVIsSUFBMEIsZ0JBQVEsTUFBekQ7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7OztBQWFBLElBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBcUIsQ0FBRSxDQUE3Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBTSxhQUFhLFNBQWIsVUFBYSxHQUFNO0FBQ3JCLFdBQU8sT0FBTyxJQUFQLEtBQWdCLE9BQU8sR0FBOUI7QUFDSCxDQUZEOztBQUlBLElBQU0scUJBQXFCLFNBQXJCLGtCQUFxQixDQUFDLElBQUQsRUFBTyxHQUFQLEVBQWU7QUFDdEMsV0FBTyxLQUFLLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLE1BQXhCLENBQVA7QUFDQSxRQUFJLENBQUMsR0FBTCxFQUFVO0FBQ04sY0FBTSxPQUFPLFFBQVAsQ0FBZ0IsSUFBdEI7QUFDSDs7QUFFRCxRQUFJLFFBQVEsSUFBSSxNQUFKLENBQVcsU0FBUyxJQUFULEdBQWdCLG1CQUEzQixDQUFaO0FBQUEsUUFDSSxVQUFVLE1BQU0sSUFBTixDQUFXLEdBQVgsQ0FEZDs7QUFHQSxRQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1YsZUFBTyxJQUFQO0FBQ0g7QUFDRCxRQUFJLENBQUMsUUFBUSxDQUFSLENBQUwsRUFBaUI7QUFDYixlQUFPLEVBQVA7QUFDSDs7QUFFRCxXQUFPLG1CQUFtQixR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TSxNQUFOLENBQWEsMkJBQWIsRUFBMEM7QUFFeEMsWUFGd0Msd0JBRTNCOztBQUVYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBSyxLQUFMLEdBQWEsZ0JBQU0sYUFBTixFQUFiOztBQUVBLFNBQUssT0FBTCxHQUFlLGlCQUFTLGNBQVQsQ0FBd0IsZUFBeEIsQ0FBZjtBQUNBLFNBQUssS0FBTCxHQUFhLGlCQUFTLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBYjtBQUNBLFNBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxLQUE5QjtBQUNBLFNBQUssTUFBTCxHQUFjLHFCQUFRLEtBQUssS0FBYixDQUFkO0FBQ0QsR0FkdUM7QUFnQnhDLFdBaEJ3Qyx1QkFnQjVCO0FBQ1YsU0FBSyxNQUFMLENBQVksT0FBWjtBQUNBLFNBQUssS0FBTCxDQUFXLE9BQVg7QUFDRDtBQW5CdUMsQ0FBMUM7O0FBc0JBLGtCQUFNLElBQU4sQ0FBVyxnQ0FBWCxFQUE2QyxVQUFTLE1BQVQsRUFBaUI7QUFDNUQsU0FBTyxNQUFQLENBQWMsQ0FBZDs7QUFFQSxTQUFPLFdBQVAsU0FDUyxPQUFPLFNBQVAsQ0FBaUIsZUFEMUIsR0FFRSxVQUZGLEVBR0UsaURBSEY7O0FBTUEsT0FBSyxNQUFMLENBQVksZUFBWjs7QUFFQTtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7O0FBRUEsU0FBTyxFQUFQLENBQ0UsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQix1QkFBckIsQ0FERixFQUVFLHVDQUZGO0FBSUQsQ0FsQkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG5jb25zdCBkZWZhdWx0cyA9IHt9O1xuXG4vLyBDcm9zcy1jb21wYXRpYmlsaXR5IGZvciBWaWRlby5qcyA1IGFuZCA2LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuLy8gY29uc3QgZG9tID0gdmlkZW9qcy5kb20gfHwgdmlkZW9qcztcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBpbnZva2Ugd2hlbiB0aGUgcGxheWVyIGlzIHJlYWR5LlxuICpcbiAqIFRoaXMgaXMgYSBncmVhdCBwbGFjZSBmb3IgeW91ciBwbHVnaW4gdG8gaW5pdGlhbGl6ZSBpdHNlbGYuIFdoZW4gdGhpc1xuICogZnVuY3Rpb24gaXMgY2FsbGVkLCB0aGUgcGxheWVyIHdpbGwgaGF2ZSBpdHMgRE9NIGFuZCBjaGlsZCBjb21wb25lbnRzXG4gKiBpbiBwbGFjZS5cbiAqXG4gKiBAZnVuY3Rpb24gb25QbGF5ZXJSZWFkeVxuICogQHBhcmFtICAgIHtQbGF5ZXJ9IHBsYXllclxuICogICAgICAgICAgIEEgVmlkZW8uanMgcGxheWVyLlxuICogQHBhcmFtICAgIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuICogICAgICAgICAgIEFuIG9iamVjdCBvZiBvcHRpb25zIGxlZnQgdG8gdGhlIHBsdWdpbiBhdXRob3IgdG8gZGVmaW5lLlxuICovXG5jb25zdCBvblBsYXllclJlYWR5ID0gKHBsYXllciwgb3B0aW9ucykgPT4ge307XG5cbi8vIGNvbnN0IGdldFVybFBhcmFtZXRlciA9IChuYW1lKSA9PiB7XG4vLyAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbi8vICAgICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknKTtcbi8vICAgICAgICAgdmFyIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4vLyAgICAgICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4vLyB9O1xuXG5jb25zdCBpc0luSWZyYW1lID0gKCkgPT4ge1xuICAgIHJldHVybiB3aW5kb3cuc2VsZiAhPT0gd2luZG93LnRvcDtcbn07XG5cbmNvbnN0IGdldFBhcmFtZXRlckJ5TmFtZSA9IChuYW1lLCB1cmwpID0+IHtcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCBcIlxcXFwkJlwiKTtcbiAgICBpZiAoIXVybCkge1xuICAgICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICB9XG5cbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiWz8mXVwiICsgbmFtZSArIFwiKD0oW14mI10qKXwmfCN8JClcIiksXG4gICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG5cbiAgICBpZiAoIXJlc3VsdHMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghcmVzdWx0c1syXSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xufTtcblxuY29uc3QgZ2V0U3luZGljYXRlZFRhZyA9IChwbGF5ZXIpID0+IHtcbiAgICB2YXIgdGFncyA9IHBsYXllci5tZWRpYWluZm8udGFncztcbiAgICB2YXIgc3luZGljYXRlZCA9IFwiXCI7XG4gICAgZm9yKHZhciBpIGluIHRhZ3MpIHtcbiAgICAgICAgaWYgKHRhZ3NbaV0uaW5kZXhPZihcInN5bmRpY2F0ZWQ9XCIpID49IDApIHtcbiAgICAgICAgICAgIHN5bmRpY2F0ZWQgPSB0YWdzW2ldLnNwbGl0KFwiPVwiKVsxXTsgLy8gR2V0dGluZyB0aGUgdmFsdWUgb2Ygc3luZGljYXRlZFxuICAgICAgICAgICAgcmV0dXJuIHN5bmRpY2F0ZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuY29uc3QgYWRkVG9JVSA9ICh1cmwsIHBvc2l0aW9uLCBhZGRpdGlvbikgPT4ge1xuICAgIHZhciBpdSA9IGdldFBhcmFtZXRlckJ5TmFtZShcIml1XCIsIHVybCk7XG4gICAgdmFyIG9yaWdpbmFsSVUgPSBpdTtcblxuICAgIGlmIChpdS5jaGFyQXQoMCkgPT0gXCIvXCIpIHtcbiAgICAgICAgaXUgPSBpdS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgaXVQYXJ0cyA9IGl1LnNwbGl0KFwiL1wiKTtcblxuICAgIHZhciBhcnJheVBvc2l0aW9uID0gcG9zaXRpb24gLSAxO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheVBvc2l0aW9uOyBpKyspIHtcbiAgICAgICAgaWYgKGl1UGFydHNbaV0gPT0gXCJcIikge1xuICAgICAgICAgICAgaXVQYXJ0c1tpXSA9IFwidmlkZW9cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGl1UGFydHNbYXJyYXlQb3NpdGlvbl0gPSBhZGRpdGlvbjtcblxuICAgIGl1ID0gXCIvXCIgKyBpdVBhcnRzLmpvaW4oXCIvXCIpO1xuXG4gICAgcmV0dXJuIHVybC5yZXBsYWNlKG9yaWdpbmFsSVUsIGl1KTtcbn07XG5cbmNvbnN0IGdldEN1c3RvbVBhcmFtc1F1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuXG4gICAgdmFyIHF1ZXJ5U3RyaW5nID0gXCJcIjtcblxuICAgIHZhciByZXF1ZXN0VXJpID0gZ2V0UmVxdWVzdFVyaSgpO1xuICAgIHZhciByZXF1ZXN0VXJpUGFydHMgPSByZXF1ZXN0VXJpLnNwbGl0KFwiL1wiKTtcbiAgICByZXF1ZXN0VXJpUGFydHMgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHJlcXVlc3RVcmlQYXJ0cyk7XG5cbiAgICB2YXIgYWRVdGlsaXR5T2JqZWN0ID0gZ2V0QWRVdGlsaXR5KCk7XG4gICAgdmFyIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gZ2V0QWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcoKTtcblxuXG4gICAgaWYgKHJlcXVlc3RVcmlQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IFwic2VjdGlvbj1cIiArIHJlcXVlc3RVcmlQYXJ0c1swXSArIFwiJlwiO1xuICAgICAgICBxdWVyeVN0cmluZyArPSBcInBhZ2U9XCIgKyByZXF1ZXN0VXJpUGFydHMuam9pbihcIixcIikgKyBcIiZcIjtcbiAgICB9XG5cbiAgICBpZiAoYWRVdGlsaXR5T2JqZWN0ICE9IGZhbHNlICYmIGFkVXRpbGl0eU9iamVjdC5zcG9uc0lkICE9IFwiXCIpIHtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gXCJTcG9uc0lkPVwiICsgYWRVdGlsaXR5T2JqZWN0LnNwb25zSWQgKyBcIiZcIjtcbiAgICB9XG5cbiAgICBpZiAoYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmcgIT0gZmFsc2UpIHtcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gYWRVdGlsVGFyZ2V0UXVlcnlTdHJpbmc7XG4gICAgfVxuXG4gICAgaWYgKHF1ZXJ5U3RyaW5nW3F1ZXJ5U3RyaW5nLmxlbmd0aCAtIDFdID09IFwiJlwiKSB7IC8vIElmIGxhc3QgY2hhcmFjdGVyIGlzICZcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZy5zdWJzdHJpbmcoMCwgcXVlcnlTdHJpbmcubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xufTtcblxuY29uc3QgcmVtb3ZlRW1wdHlFbGVtZW50cyA9IChhcnJheSkgPT4ge1xuICAgIGZvciAodmFyIGk9MDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT0gXCJcIikge1xuICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nID0gKCkgPT4ge1xuICAgIHZhciBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZyA9IFwiXCI7XG4gICAgdmFyIGFkVXRpbFRhcmdldE9iamVjdCA9IGdldEFkVXRpbFRhcmdldCgpO1xuXG4gICAgaWYgKGFkVXRpbFRhcmdldE9iamVjdCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5vdFRhZ3MgPSBbXCJQb3N0SURcIixcIkF1dGhvclwiLFwiQ2F0ZWdvcnlcIixcIkNvbnRlbnRUeXBlXCJdO1xuICAgIHZhciBlbGVtZW50cyA9IFtdO1xuICAgIGVsZW1lbnRzW1wiVGFnc1wiXSA9IFwiXCI7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gYWRVdGlsVGFyZ2V0T2JqZWN0KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFkVXRpbFRhcmdldE9iamVjdFtrZXldO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgdmFsdWUgPT0gXCJhcnJheVwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmpvaW4oXCIsXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vdFRhZ3MuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW1wiVGFnc1wiXSArPSB2YWx1ZSArIFwiLFwiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnRzW1wiVGFnc1wiXVtlbGVtZW50c1tcIlRhZ3NcIl0ubGVuZ3RoIC0gMV0gPT0gXCIsXCIpIHtcbiAgICAgICAgZWxlbWVudHNbXCJUYWdzXCJdID0gZWxlbWVudHNbXCJUYWdzXCJdLnN1YnN0cmluZygwLCBlbGVtZW50c1tcIlRhZ3NcIl0ubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIGVsZW1lbnRzKSB7XG4gICAgICAgIGFkVXRpbFRhcmdldFF1ZXJ5U3RyaW5nICs9IGtleSArIFwiPVwiICsgZWxlbWVudHNba2V5XSArIFwiJlwiO1xuICAgIH1cblxuICAgIHJldHVybiBhZFV0aWxUYXJnZXRRdWVyeVN0cmluZztcbn07XG5cbmNvbnN0IGdldEFkVXRpbGl0eSA9ICgpID0+IHtcbiAgICB2YXIgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgICBpZiAoaW5JZnJhbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkVXRpbGl0eSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnQuYWRVdGlsaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCRlKXt9IC8vdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGFjY2Vzc1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmFkVXRpbGl0eSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hZFV0aWxpdHk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG5jb25zdCBnZXRSZXF1ZXN0VXJpID0oKSA9PiB7XG4gICAgdmFyIGluSWZyYW1lID0gaXNJbklmcmFtZSgpO1xuICAgIHZhciByZXF1ZXN0VXJpID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gICAgaWYgKGluSWZyYW1lKSB7XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIHJlcXVlc3RVcmkgPSBwYXJlbnQubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goJGUpey8vdG8gY2F0Y2ggY3Jvc3Mtb3JpZ2luIGlzc3Vlcy5cbiAgICAgICAgICAgIHJlcXVlc3RVcmwgPSAnJzsgLy9zZXR0aW5nIGl0IHRvIGZhbHNlLCBzbyBhcyB0byBub3QgcmVwb3J0IHdyb25nIHZhbHVlcy5cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVxdWVzdFVyaTtcbn07XG5cbmNvbnN0IGdldEFkVXRpbFRhcmdldCA9ICgpID0+IHtcbiAgICB2YXIgaW5JZnJhbWUgPSBpc0luSWZyYW1lKCk7XG5cbiAgICBpZiAoaW5JZnJhbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50LmFkdXRpbF90YXJnZXQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50LmFkdXRpbF90YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goJGUpe30gLy90byBjYXRjaCBjcm9zcyBvcmlnaW4gZXJyb3JzXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuYWR1dGlsX3RhcmdldCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5hZHV0aWxfdGFyZ2V0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmNvbnN0IHNldHVwSU1BMyA9IChwbGF5ZXIsIHBsdWdpbnMpID0+IHtcblxuXG4gICAgdmFyIGFkU2VydmVyVXJsID0gXCJcIjtcblxuICAgIGlmICh0eXBlb2YgcGxheWVyLmltYTMuc2V0dGluZ3MgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgPSBwbGF5ZXIuaW1hMy5zZXR0aW5ncy5zZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKHBsdWdpbnMuYWRfc2VydmVyX3VybCAhPSBcIlwiKSB7XG4gICAgICAgIGFkU2VydmVyVXJsID0gcGx1Z2lucy5hZF9zZXJ2ZXJfdXJsO1xuICAgIH1cblxuICAgIC8vIGlmIGl0IGlzIGxvYWRlZCBmcm9tIGJyaWdodGNvdmVcbiAgICBpZiAocGx1Z2lucy5zeW5kaWNhdGVkX2VuYWJsZSkge1xuICAgICAgICB2YXIgc3luZGljYXRlZCA9IGdldFN5bmRpY2F0ZWRUYWcocGxheWVyKTtcbiAgICAgICAgaWYgKHN5bmRpY2F0ZWQpIHtcbiAgICAgICAgICAgIGFkU2VydmVyVXJsID0gYWRkVG9JVShhZFNlcnZlclVybCwgNSwgc3luZGljYXRlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY3VzdG9tUGFyYW1zID0gZ2V0Q3VzdG9tUGFyYW1zUXVlcnlTdHJpbmcoKTtcbiAgICBpZiAoY3VzdG9tUGFyYW1zICE9IFwiXCIpIHtcbiAgICAgICAgYWRTZXJ2ZXJVcmwgKz0gXCImY3VzdF9wYXJhbXM9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoY3VzdG9tUGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBsYXllci5pbWEzICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBwbGF5ZXIuaW1hMyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBwbGF5ZXIuaW1hMyh7XG4gICAgICAgICAgICBhZFRlY2hPcmRlcjogW1wiaHRtbDVcIiwgXCJmbGFzaFwiXSxcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDcwMDAsXG4gICAgICAgICAgICByZXF1ZXN0TW9kZTogJ29ubG9hZCcsXG4gICAgICAgICAgICBsb2FkaW5nU3Bpbm5lcjogdHJ1ZSxcbiAgICAgICAgICAgIHNlcnZlclVybDogYWRTZXJ2ZXJVcmxcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyLmltYTMuc2V0dGluZ3Muc2VydmVyVXJsID0gYWRTZXJ2ZXJVcmw7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zLmFkX21hY3JvX3JlcGxhY2VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwbGF5ZXIuaW1hMy5hZE1hY3JvUmVwbGFjZW1lbnQgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IHBsdWdpbnMuYWRfbWFjcm9fcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwuc3BsaXQoaSkuam9pbihlbmNvZGVVUklDb21wb25lbnQocGFyYW1ldGVyc1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogQSB2aWRlby5qcyBwbHVnaW4uXG4gKlxuICogSW4gdGhlIHBsdWdpbiBmdW5jdGlvbiwgdGhlIHZhbHVlIG9mIGB0aGlzYCBpcyBhIHZpZGVvLmpzIGBQbGF5ZXJgXG4gKiBpbnN0YW5jZS4gT24gcmVhZHkgd2UgaW5pdGlhbGl6ZSB0aGUgcGx1Z2lucyB0aGF0IGFyZSByZXF1aXJlZC5cbiAqXG4gKiBAZnVuY3Rpb24gcmRtUGx1Z2luTG9hZGVyXG4gKiBAcGFyYW0gICAge09iamVjdH0gW29wdGlvbnM9e31dXG4gKiAgICAgICAgICAgQW4gb2JqZWN0IG9mIG9wdGlvbnMgbGVmdCB0byB0aGUgcGx1Z2luIGF1dGhvciB0byBkZWZpbmUuXG4gKi9cbmNvbnN0IHJkbVBsdWdpbkxvYWRlciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICB0aGlzLnJlYWR5KCgpID0+IHtcbiAgICAgIG9uUGxheWVyUmVhZHkodGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgfSk7XG5cbiAgdGhpcy5sb2FkZWRtZXRhZGF0YSgoKSA9PiB7XG4gICAgICBzZXR1cElNQTModGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgfSk7XG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbigncmRtUGx1Z2luTG9hZGVyJywgcmRtUGx1Z2luTG9hZGVyKTtcblxuLy8gSW5jbHVkZSB0aGUgdmVyc2lvbiBudW1iZXIuXG5yZG1QbHVnaW5Mb2FkZXIuVkVSU0lPTiA9ICdfX1ZFUlNJT05fXyc7XG5cbmV4cG9ydCBkZWZhdWx0IHJkbVBsdWdpbkxvYWRlcjtcbiIsImltcG9ydCB7ZG9jdW1lbnR9IGZyb20gJ2dsb2JhbCc7XG5cbmltcG9ydCBRVW5pdCBmcm9tICdxdW5pdGpzJztcbmltcG9ydCBzaW5vbiBmcm9tICdzaW5vbic7XG5pbXBvcnQgdmlkZW9qcyBmcm9tICd2aWRlby5qcyc7XG5cbmltcG9ydCBwbHVnaW4gZnJvbSAnLi4vc3JjL2pzL2luZGV4LmpzJztcblxuY29uc3QgUGxheWVyID0gdmlkZW9qcy5nZXRDb21wb25lbnQoJ1BsYXllcicpO1xuXG5RVW5pdC5tb2R1bGUoJ3Nhbml0eSB0ZXN0cycpO1xuXG5RVW5pdC50ZXN0KCd0aGUgZW52aXJvbm1lbnQgaXMgc2FuZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIEFycmF5LmlzQXJyYXksICdmdW5jdGlvbicsICdlczUgZXhpc3RzJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0eXBlb2Ygc2lub24sICdvYmplY3QnLCAnc2lub24gZXhpc3RzJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0eXBlb2YgdmlkZW9qcywgJ2Z1bmN0aW9uJywgJ3ZpZGVvanMgZXhpc3RzJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0eXBlb2YgcGx1Z2luLCAnZnVuY3Rpb24nLCAncGx1Z2luIGlzIGEgZnVuY3Rpb24nKTtcbn0pO1xuXG5RVW5pdC5tb2R1bGUoJ3ZpZGVvanMtcmRtLXBsdWdpbi1sb2FkZXInLCB7XG5cbiAgYmVmb3JlRWFjaCgpIHtcblxuICAgIC8vIE1vY2sgdGhlIGVudmlyb25tZW50J3MgdGltZXJzIGJlY2F1c2UgY2VydGFpbiB0aGluZ3MgLSBwYXJ0aWN1bGFybHlcbiAgICAvLyBwbGF5ZXIgcmVhZGluZXNzIC0gYXJlIGFzeW5jaHJvbm91cyBpbiB2aWRlby5qcyA1LiBUaGlzIE1VU1QgY29tZVxuICAgIC8vIGJlZm9yZSBhbnkgcGxheWVyIGlzIGNyZWF0ZWQ7IG90aGVyd2lzZSwgdGltZXJzIGNvdWxkIGdldCBjcmVhdGVkXG4gICAgLy8gd2l0aCB0aGUgYWN0dWFsIHRpbWVyIG1ldGhvZHMhXG4gICAgdGhpcy5jbG9jayA9IHNpbm9uLnVzZUZha2VUaW1lcnMoKTtcblxuICAgIHRoaXMuZml4dHVyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdW5pdC1maXh0dXJlJyk7XG4gICAgdGhpcy52aWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG4gICAgdGhpcy5maXh0dXJlLmFwcGVuZENoaWxkKHRoaXMudmlkZW8pO1xuICAgIHRoaXMucGxheWVyID0gdmlkZW9qcyh0aGlzLnZpZGVvKTtcbiAgfSxcblxuICBhZnRlckVhY2goKSB7XG4gICAgdGhpcy5wbGF5ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuY2xvY2sucmVzdG9yZSgpO1xuICB9XG59KTtcblxuUVVuaXQudGVzdCgncmVnaXN0ZXJzIGl0c2VsZiB3aXRoIHZpZGVvLmpzJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGFzc2VydC5leHBlY3QoMik7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKFxuICAgIHR5cGVvZiBQbGF5ZXIucHJvdG90eXBlLnJkbVBsdWdpbkxvYWRlcixcbiAgICAnZnVuY3Rpb24nLFxuICAgICd2aWRlb2pzLXJkbS1wbHVnaW4tbG9hZGVyIHBsdWdpbiB3YXMgcmVnaXN0ZXJlZCdcbiAgKTtcblxuICB0aGlzLnBsYXllci5yZG1QbHVnaW5Mb2FkZXIoKTtcblxuICAvLyBUaWNrIHRoZSBjbG9jayBmb3J3YXJkIGVub3VnaCB0byB0cmlnZ2VyIHRoZSBwbGF5ZXIgdG8gYmUgXCJyZWFkeVwiLlxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG5cbiAgYXNzZXJ0Lm9rKFxuICAgIHRoaXMucGxheWVyLmhhc0NsYXNzKCd2anMtcmRtLXBsdWdpbi1sb2FkZXInKSxcbiAgICAndGhlIHBsdWdpbiBhZGRzIGEgY2xhc3MgdG8gdGhlIHBsYXllcidcbiAgKTtcbn0pO1xuIl19
