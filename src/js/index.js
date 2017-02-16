import videojs from 'video.js';
import axios from 'axios';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

// const getUrlParameter = (name) => {
//         name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
//         var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
//         var results = regex.exec(location.search);
//         return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
// };
const isInIframe = () => {
    return window.self !== window.top;
};

const getParameterByName = (name, url) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    if (!url) {
        url = window.location.href;
    }

    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);

    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const getSyndicatedTag = (player) => {
    let tags = player.mediainfo.tags;
    for (const i in tags) {
        if (tags[i].indexOf("syndicated=") >= 0) {
            let syndicated= tags[i].split("=")[1]; // Getting the value of syndicated
            return syndicated;
        }
    }
    return false;
};

const addToIU = (url, position, addition) => {
    let iu = getParameterByName("iu", url);
    let originalIU = iu;

    if (iu.charAt(0) == "/") {
        iu = iu.substring(1);
    }

    let iuParts = iu.split("/");

    let arrayPosition = position - 1;

    for (let i = 0; i < arrayPosition; i++) {
        if (iuParts[i] == "") {
            iuParts[i] = "video";
        }
    }

    iuParts[arrayPosition] = addition;

    iu = "/" + iuParts.join("/");

    return url.replace(originalIU, iu);
};

const getCustomParamsQueryString = () => {

    let queryString = "";

    let requestUri = getRequestUri();
    let requestUriParts = requestUri.split("/");
    requestUriParts = removeEmptyElements(requestUriParts);

    let adUtilityObject = getAdUtility();
    let adUtilTargetQueryString = getAdUtilTargetQueryString();


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

    if (queryString[queryString.length - 1] == "&") { // If last character is &
        queryString = queryString.substring(0, queryString.length - 1);
    }

    return queryString;
};

const removeEmptyElements = (array) => {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == "") {
            array.splice(i, 1);
            i--;
        }
    }
    return array;
};

const getAdUtilTargetQueryString = () => {
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

        if (typeof value == "object" || typeof value == "array") {
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

const getAdUtility = () => {
    var inIframe = isInIframe();

    if (inIframe) {
        try {
            if (typeof parent.adUtility !== "undefined") {
                return parent.adUtility;
            }
        }
        catch ($e) {
        } //to catch cross-origin access
    } else {
        if (typeof window.adUtility !== "undefined") {
            return window.adUtility;
        }
    }
    return false;
};


const getRequestUri = () => {
    var inIframe = isInIframe();
    var requestUri = window.location.pathname;

    if (inIframe) {
        try {
            requestUri = parent.location.pathname;
        }
        catch ($e) {//to catch cross-origin issues.
            requestUri = ''; //setting it to false, so as to not report wrong values.
        }
    }
    return requestUri;
};

const getAdUtilTarget = () => {
    var inIframe = isInIframe();

    if (inIframe) {
        try {
            if (typeof parent.adutil_target !== "undefined") {
                return parent.adutil_target;
            }
        }
        catch ($e) {
        } //to catch cross origin errors
    } else {
        if (typeof window.adutil_target !== "undefined") {
            return window.adutil_target;
        }
    }
    return false;
};

const setupIMA3 = (player, plugins) => {
    let adServerUrl = "";

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

    if (typeof player.ima3 !== "undefined" && typeof player.ima3 !== "object") {
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
        player.ima3.adMacroReplacement = (url) => {
            const parameters = plugins.ad_macro_replacement;
            for (const i in parameters) {
                url = url.split(i).join(encodeURIComponent(parameters[i]));
            }
            return url;
        };
    }
};

const setupMoat = (player) => {
    player["Moat"]({
        "partnerCode": "rogersbrightcoveint878700116445"
    });
};

const setupChartbeat = (player, plugins) => {
    player['chartbeat']({
        "uid": plugins.chartbeat.uid,
        "domain": plugins.chartbeat.domain
    });
};

const setupStreamsense = (player, plugins) => {
    player['comscore']({
        "c2": plugins.streamsense.c2,
        "labelmapping": "c3=" + plugins.streamsense.c3 + ",c4=" + plugins.streamsense.c4 + ",c6=" + plugins.streamsense.c6 + ",ns_st_st=" + plugins.streamsense.brand + ",ns_st_pu=" + plugins.streamsense.publisher + ",ns_st_pr=" + plugins.streamsense.ns_st_pr + ",ns_st_ep=" + plugins.streamsense.ns_st_ep + ",ns_st_sn=" + plugins.streamsense.ns_st_sn + ",ns_st_en=" + plugins.streamsense.ns_st_en + ",ns_st_ge=" + plugins.streamsense.ns_st_ge + ",ns_st_ti=" + plugins.streamsense.ns_st_ti  + ",ns_st_ia=" + plugins.streamsense.ns_st_ia + ", ns_st_ce=" + plugins.streamsense.ns_st_ce + ",ns_st_ddt=" + plugins.streamsense.ns_st_ddt + ",ns_st_tdt= " + plugins.streamsense.ns_st_tdt
    });
};

const setupOmniture = (player, plugins) => {

    let vs_account = 'rogersrmiradiodev';
    if (typeof plugins.site_catalyst_account !== 'undefined') {
        vs_account = plugins.site_catalyst_account;
    } else {
        if (typeof window.s === 'object') {
            vs_account = s.account;
        } else if (typeof window.s_account !== 'undefined') {
            vs_account = s_account;
        } else {
            console.error('***No reporting variables set for video analytics');
        }
    }

    let vs_channel = 'Video';
    if (typeof plugins.site_catalyst_brand !== 'undefined') {
        vs_channel = plugins.site_catalyst_brand;
    }

    const bcgs_adobe_config = {

        VISITOR_API : {
            MARKETING_CLOUD_ORG_ID : 'D7FD34FA53D63B860A490D44@AdobeOrg',
            NAMESPACE : 'rogersmedia', //
            TRACKING_SERVER : 'om.rogersmedia.com' // om.rogersmedia.com // needs tp change
        },

        APP_MEASUREMENT : {
            RSID :  vs_account, // rogersrmiradiodev
            TRACKING_SERVER : 'om.rogersmedia.com' // om.rogersmedia.com
        },

        HEARTBEAT : {
            DISABLE : false, // disable if using milestone tracking
            TRACKING_SERVER : 'rogersmedia.hb.omtrdc.net', // om.rogersmedia.com
            PUBLISHER : 'D7FD34FA53D63B860A490D44@AdobeOrg',
            CHANNEL : vs_channel,
            OVP : 'Brightcove',
            SDK : '1.5.2',
            JOB_ID : 'sc_va',
            DEBUG_LOGGING : false
        },

        QUALITY: {
            AVERAGE_BITRATE: 0,
            TIME_TO_START: 0
        },

        CUSTOM_EVENT : {
            disable : true, // disable if using heartbeat tracking
            bc_data_mapping : {
                name : "eVar106,prop2", // video name, accepts multiple eVars/props
                segment : "eVar203", // current milestone (e.g., '1:M:0-25')
                contentType : "eVar201", // content type (e.g., 'video' or 'ad')
                timePlayed : "event203", // amount of time played since last tracking event, tracked with milestone events
                view : "event201", // video start event
                segmentView : "event202", // general milestone tracking event, tracked with milestone events
                complete : "event207", // video complete event
                milestones : { // milestones in percent; milestones can be added/removed from list
                    25 : "event204", // 25%
                    50 : "event205", // 50%
                    75 : "event206" // 75%
                }
            },
            // keep to track volume change events
            bc_volumechange : {
                event : 'event208', // event tracking number
                evar : 'prop1' // the new volume chosen by the user (from 0-1.00), only one prop/eVar supported here
            },
            // keep to track when user has paused an ad
            bc_ad_pause : {
                event : 'event209', // event tracking number
                evar : 'eVar205' // time value of pausing an ad, only one prop/eVar supported here
            },
            // keep to track when user enters full screen mode
            bc_fullscreen_enter : {
                event : 'event212' // event tracking number
            },
            // keep to track when user exits full screen mode
            bc_fullscreen_exit : {
                event : 'event213' // event tracking number
            },
            // keep to track when user opens social share menu
            bc_social_opened : {
                event : 'event214' // event tracking number
            },
            // keep to track when user closes social share menu
            bc_social_closed : {
                event : 'event215' // event tracking number
            }
        }
    };

    player.BCGSAdobeAnalyticsPlugin({
        options: bcgs_adobe_config
    });
};

const setupErrorHandlers = (player) =>{

    //handling Geo-restricted errors.
    player.one('bc-catalog-error', function(){
        var rPlayer = this,
            specificError;

        rPlayer.errors({
            'errors': {
                '-3': {
                    'headline': 'This video is not available in your region.',
                    'type': 'CLIENT_GEO'
                }
            }
        });

        if (typeof(rPlayer.catalog.error) !== 'undefined') {
            specificError = rPlayer.catalog.error.data[0];
            if (specificError !== 'undefined' && specificError.error_subcode == "CLIENT_GEO" ) {
                rPlayer.error({code:'-3'});
            }
        }
    });
};

const hideLoaders = (player) => {
    // Hide loaders
    //jQuery(this.el_).closest('.rdm-bc-video').find('.vjs-loader').fadeOut();

}

const initPlugin = (player, plugins) => {

    player.ready(() => {
        setupChartbeat(player, plugins);
        setupStreamsense(player, plugins);
        setupOmniture(player, plugins);
        if(plugins.local_ima3_enable) {
            setupMoat(player);
        }
    });

    if(plugins.local_ima3_enable) {
        player.on('loadedmetadata', () => {
            setupIMA3(player, plugins);
            hideLoaders(player);
        });
    }

    /**
     * Fixes autoplay bug
     */
    player.on('adsready', () => {
        // Ensure the setup vars were set
        if( this.tagAttributes['data-setup'] ){
            // Parse it to JS
            var setup_vars = JSON.parse(this.tagAttributes['data-setup']);
            if (typeof setup_vars.autoplay_var !== 'undefined') {
                if ((setup_vars.autoplay_var === true) && (this.ads.state != 'ad-playback')) {
                    this.play();
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
const rdmPluginLoader = function (options) {

    const player = this;
    if(!options.plugin_url){
        //plugin cannot be instantiated
        return;
    }

    if(typeof window !== 'undefined' && typeof window.plugins === 'undefined') {

            axios.get(options.plugin_url).then(function (response) {
                if(response.status === 200) {
                    initPlugin(player, response.data);
                }
            })
            .catch(function (error) {
                console.log(error);
                return;
            });
    }
    else{
        initPlugin(player, window.plugins);
    }

};

// Register the plugin with video.js.
registerPlugin('rdmPluginLoader', rdmPluginLoader);

// Include the version number.
rdmPluginLoader.VERSION = '__VERSION__';

export default rdmPluginLoader;
