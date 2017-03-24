import videojs from 'video.js';
import axios from 'axios';

// Default options for the plugin.
// const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

const getParameterByName = (name, url) => {
  name = name.replace(/[\[\]]/g, '\\$&');
  if (!url) {
    url = window.location.href;
  }

  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const getSyndicatedTag = (player) => {
  const tags = player.mediainfo.tags;

  for (const i in tags) {
    if (tags[i].indexOf('syndicated=') >= 0) {
      // Getting the value of syndicated
      const syndicated = tags[i].split('=')[1];

      return syndicated;
    }
  }
  return false;
};

const addToIU = (url, position, addition) => {
  let iu = getParameterByName('iu', url);
  const originalIU = iu;

  if (iu.charAt(0) == '/') {
    iu = iu.substring(1);
  }

  const iuParts = iu.split('/');

  const arrayPosition = position - 1;

  for (let i = 0; i < arrayPosition; i++) {
    if (iuParts[i] == '') {
      iuParts[i] = 'video';
    }
  }

  iuParts[arrayPosition] = addition;

  iu = '/' + iuParts.join('/');

  return url.replace(originalIU, iu);
};

const getCustomParamsQueryString = (options) => {

  let queryString = '';
  let requestUri = '';

  const amp_url = getParameterByName('linkbaseurl');//currently assuming that if linkbaseurk is found its an amp page.
  if(amp_url){
    queryString += 'environment=googleamp&';
    const urlobj = parseUrl(amp_url);
    requestUri = urlobj.pathname; //since its an amp page lets get the path from the linkbaseurl;

  }
  else{
    requestUri = getRequestUri();
  }

  if(requestUri) {
    let requestUriParts = requestUri.split('/');
    requestUriParts = removeEmptyElements(requestUriParts);
    queryString += 'section=' + ( (typeof requestUriParts[0] !== 'undefined')  ? requestUriParts[0] : '' ) + '&';
    queryString += 'page=' + requestUriParts.join(',') + '&';
  }

  const adUtilityObject = getAdUtility();
  const adUtilTargetQueryString = getAdUtilTargetQueryString();

  if (adUtilityObject != false && adUtilityObject.sponsId != '') {
    queryString += 'SponsId=' + adUtilityObject.sponsId + '&';
  }

  if (adUtilTargetQueryString != false) {
    queryString += adUtilTargetQueryString;
  }

  if (queryString[queryString.length - 1] == '&') { // If last character is &
    queryString = queryString.substring(0, queryString.length - 1);
  }

  return queryString;
};

const removeEmptyElements = (array) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == '') {
      array.splice(i, 1);
      i--;
    }
  }
  return array;
};

const getAdUtilTargetQueryString = () => {
  let adUtilTargetQueryString = '';
  const adUtilTargetObject = getAdUtilTarget();

  if (adUtilTargetObject == false) {
    return false;
  }

  const notTags = ['PostID', 'Author', 'Category', 'ContentType'];
  const elements = [];

  elements.Tags = '';

  for (const key in adUtilTargetObject) {
    let value = adUtilTargetObject[key];

    if (typeof value === 'object') {
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

  for (const key in elements) {
    adUtilTargetQueryString += key + '=' + elements[key] + '&';
  }

  return adUtilTargetQueryString;
};

const getAdUtility = () => {
  const inIframe = isInIframe();

  if (inIframe) {
    try {
      if (typeof parent.adUtility !== 'undefined') {
        return parent.adUtility;
      }
    } catch ($e) {
    } // to catch cross-origin access
  } else if (typeof window.adUtility !== 'undefined') {
    return window.adUtility;
  }
  return false;
};

const getRequestUri = () => {
  const inIframe = isInIframe();
  let requestUri = window.location.pathname;

  if (inIframe) {
    try {
      requestUri = parent.location.pathname;
    } catch ($e) {// to catch cross-origin issues.
      requestUri = ''; // setting it to false, so as to not report wrong values.
    }
  }
  return requestUri;
};

const getAdUtilTarget = () => {
  const inIframe = isInIframe();

  if (inIframe) {
    try {
      if (typeof parent.adutil_target !== 'undefined') {
        return parent.adutil_target;
      }
    } catch ($e) {
    } // to catch cross origin errors
  } else if (typeof window.adutil_target !== 'undefined') {
    return window.adutil_target;
  }
  return false;
};

const parseUrl = ( url ) => {
  var a = document.createElement('a');
  a.href = url;
  return a;
};

const getIndexAds= (a,b) => {if("string"!=typeof a||"object"!=typeof b)return a;try{b=JSON.stringify(b);var c=window.location!==window.parent.location?document.referrer:window.location.href,d=encodeURIComponent(a).replace(/(%7B)([^%]*)(%7D)/g,"{$2}");return console.log(d),"//as-sec.casalemedia.com/playlist?ix_id=%5Bindex_epr%5D&ix_v=8.8&ix_u="+encodeURIComponent(c)+"&ix_vt="+d+"&ix_s=191888&ix_vasd=0&ix_ca="+encodeURIComponent('{"protocols": [2,3,5,6],"mimes":["video/mp4","video/webm","application/javascript","video/x-flv","application/x-shockwave-flash"],"apiList":[1, 2],"size":"640x360","timeout": 1000,"durations": [15,30]}')+"&ix_so="+encodeURIComponent(b)}catch(b){return a}};

//plugins to be loaded
const pluginFunctions = {

  setup_chartbeat: (player, options) => {
    player.chartbeat({
      uid: options.uid,
      domain: options.domain
    });
  },

  setup_streamsense: (player, options) => {
    player.comscore({
      c2: options.c2,
      labelmapping: 'c3=' + options.c3 + ',c4=' + options.c4 + ',c6=' + options.c6 + ',ns_st_st=' + options.brand + ',ns_st_pu=' + options.publisher + ',ns_st_pr=' + options.ns_st_pr + ',ns_st_ep=' + options.ns_st_ep + ',ns_st_sn=' + options.ns_st_sn + ',ns_st_en=' + options.ns_st_en + ',ns_st_ge=' + options.ns_st_ge + ',ns_st_ti=' + options.ns_st_ti + ',ns_st_ia=' + options.ns_st_ia + ', ns_st_ce=' + options.ns_st_ce + ',ns_st_ddt=' + options.ns_st_ddt + ',ns_st_tdt= ' + options.ns_st_tdt
    });
  },

  setup_omniture:  (player, options) => {
    let vs_account = 'rogersrmiradiodev';
    if (typeof options.site_catalyst_account !== 'undefined') {
      vs_account = options.site_catalyst_account;
    } else if (typeof window.s === 'object') {
      vs_account = window.s.account;
    } else if (typeof window.s_account !== 'undefined') {
      vs_account = window.s_account;
    }

    let vs_channel = 'Video';

    if (typeof options.site_catalyst_brand !== 'undefined') {
      vs_channel = options.site_catalyst_brand;
    }

    const bcgs_adobe_config = {

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

  setup_ima3: (player, options) => {

    let adServerUrl = '';

    if (typeof player.ima3.settings !== 'undefined') {
      adServerUrl = player.ima3.settings.serverUrl;
    }

    if (options.ad_server_url != '') {
      adServerUrl = options.ad_server_url;
    }

  // if it is loaded from brightcove
    if (options.syndicated_enable) {
      const syndicated = getSyndicatedTag(player);

      if (syndicated) {
        adServerUrl = addToIU(adServerUrl, 5, syndicated);
      }
    }

    const customParams = getCustomParamsQueryString(options);

    if (customParams != '') {
      adServerUrl += '&cust_params=' + encodeURIComponent(customParams);
    }

    //index bidding exchange
    if(options.hasOwnProperty('index_bidding_ad_server_url_exchange') && options.index_bidding_ad_server_url_exchange.hasOwnProperty('index_bidding_ad_exchange_site_id')){
      const so = options.index_bidding_ad_server_url_exchange.index_bidding_ad_exchange_site_id;
      adServerUrl = getIndexAds(adServerUrl, so);
    }

    if (typeof player.ima3 !== 'undefined' && typeof player.ima3 !== 'object') {
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
      player.ima3.adMacroReplacement = (url) => {
        const parameters = options.ad_macro_replacement;

        for (const i in parameters) {
          url = url.split(i).join(encodeURIComponent(parameters[i]));
        }
        return url;
      };
    }
  },
  setupMoat:  (player,options) => {
    player.Moat({
      partnerCode: options.partner_code
    });
  },
  setup_displaytitle: (player,options) => {
    player.displaytitle({"advertisement_title":options.advertisement_title});
  },
};


const setupErrorHandlers = (player) =>{

// handling Geo-restricted errors.
  player.one('bc-catalog-error', function() {
    let rPlayer = this,
      specificError;

    rPlayer.errors({
      errors: {
        '-3': {
          headline: 'This video is not available in your region.',
          type: 'CLIENT_GEO'
        }
      }
    });

    if (typeof (rPlayer.catalog.error) !== 'undefined') {
      specificError = rPlayer.catalog.error.data[0];
      if (specificError !== 'undefined' && specificError.error_subcode == 'CLIENT_GEO') {
        rPlayer.error({code: '-3'});
      }
    }
  });
};

const initPlugin = (player, plugins) => {

  var ready_events = [];
  var other_events  = [];
  for (const key in plugins) {

    const setup_key = 'setup_'+key;
    // skip loop if the property is from prototype
    if (!pluginFunctions.hasOwnProperty(setup_key)) continue;

    const options = plugins[key];
    if (options.hasOwnProperty('loading_event')){
        if(options.loading_event === 'ready'){
          ready_events.push({'func':setup_key, 'options': options});
        }
        else{
          other_events.push({'func':setup_key, 'options': options});
        }
    }
  }

  if(ready_events.length > 0){
    player.ready(() => {
      for(const key in ready_events){
        const func = ready_events[key].func;
        const options = ready_events[key].options;
        pluginFunctions[func](player,options);
      }
    });
  }

  if(other_events.length > 0){
    for(const key in other_events){
      const func = other_events[key].func;
      const options = other_events[key].options;
      player.one(options.loading_event, () =>{
        pluginFunctions[func](player,options);
      });
    }
  }

  /**
   * Fixes autoplay bug
   */
  player.on('adsready', () => {
        // Ensure the setup vars were set
    if (player.tagAttributes['data-setup']) {
            // Parse it to JS
      const setup_vars = JSON.parse(player.tagAttributes['data-setup']);

      if (typeof setup_vars.autoplay_var !== 'undefined') {
        if ((setup_vars.autoplay_var === true) && (player.ads.state != 'ad-playback')) {
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

const getPluginConfigUrl= (options) => {
  //get parameter takes precedence
  var plugin_url = getParameterByName('pluginConfig');
  if(plugin_url){
    return plugin_url;
  }

  //check in the options
  if(typeof options.plugin_config !== 'undefined'){
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
const rdmPluginLoader = function(options) {

  const player = this;

  if (typeof window !== 'undefined' && typeof window.plugins === 'undefined') {

    var plugin_config_url = getPluginConfigUrl(options);
    if(plugin_config_url) {
      axios.get(plugin_config_url).then(function (response) {
        if (response.status === 200) {
          options = response.data;
          initPlugin(player, options);
        }
      }).catch(function (error) {
        console.error(error);
      });
    }
    else{
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

export default rdmPluginLoader;