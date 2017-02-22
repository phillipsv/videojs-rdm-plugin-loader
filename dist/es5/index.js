'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _video = require('video.js');

var _video2 = _interopRequireDefault(_video);

var _axios = require('axios');

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
        var func = ready_events[_key2].func;
        var _options = ready_events[_key2].options;
        pluginFunctions[func](player, _options);
      }
    });
  }

  if (other_events.length > 0) {
    var _loop = function _loop(_key3) {
      var func = ready_events[_key3].func;
      var options = ready_events[_key3].options;
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