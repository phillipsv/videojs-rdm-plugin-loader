# videojs-rdm-plugin-loader

Loads critical RDM Video Cloud plugins. 

## Usage
Built to be used with the Brightcove Video Cloud player. Should be added at the end of the plugin list while setting up the player on Brightcove. The plugins configuration should be available in global variable `window.plugins` on the page where the player is loaded. An example JSON is given below. 

```js
window.plugins = {
	"ima3": {
		"loading_event": "loadedmetadata",
		"ad_server_url": "http:\/\/pubads.g.doubleclick.net\/gampad\/ads?sz=640x360&iu=\/7326\/en.bttoronto.web&ciu_szs=728x90,975x50,300x250&impl=s&gdfp_req=1&ad_rule=1&cmsid=984&env=vp&output=xml_vast2&unviewed_position_start=1&url={window.location.href}&correlator={timestamp}&vid={mediainfo.id}&title={mediainfo.name}&referrer={document.referrer}&duration={mediainfo.duration}&description_url=BTToronto.ca",
		"syndicated_enable": true
	},
	"moat": {
		"loading_event": "loadedmetadata",
		"partner_code": "rogersbrightcoveint878700116445"
	},
	"streamsense": {
		"publisher": "\"Rogers\"",
		"brand": "",
		"c2": "16433041",
		"c3": "\"BTTORONTO\"",
		"c4": "\"*null\"",
		"c6": "\"*null\"",
		"ns_st_pr": "\"*null\"",
		"ns_st_ep": "\"*null\"",
		"ns_st_sn": "\"*null\"",
		"ns_st_en": "\"*null\"",
		"ns_st_ge": "\"*null\"",
		"ns_st_ti": "\"*null\"",
		"ns_st_ia": "\"*null\"",
		"ns_st_ce": "\"*null\"",
		"ns_st_ddt": "\"*null\"",
		"ns_st_tdt": "\"*null\"",
		"loading_event": "ready"
	},
	"chartbeat": {
		"uid": "55711",
		"domain": "bttoronto.ca",
		"loading_event": "ready"
	},
	"omniture": {
		"loading_event": "ready",
		"site_catalyst_account": "rogersrmitvdev",
		"site_catalyst_brand": "BT Toronto"
	},
	"displaytitle": {
		"loading_event": "ready",
		"advertisement_title": "Advertisement"
	}
}
```
In case, the global variable is missing, the plugin will try to fetch the configuration from a predefined endpoint on the site where it is loaded.

### Adding a new plugin setup

In order to add a new plugin, the plugin configuration should be added to the above JSON. For eg.
```js
"newplugin":{
    "loading_event":"ready", //This field is required to tell the plugin at which videojs event the plugin should be loaded
    "config":"config1"
}
```

The `src/js/index.js` file needs to be edited and a new function has to be added to the `pluginFunctions` object. The name of which should be `setup_newplugin(player, options)` and it should contain the logic required to load the plugin. The configuration will be automatically passed as the `options` argument to the function. **Please note the plugin name defined in the JSON should match the function name as shown**

### Building the plugin

```shell
npm run build
```

The js files will be available at `dist/browser/`. We should push both `videojs-rdm-plugin-loader.js` and `videojs-rdm-plugin-loader.min.js` after build is successfully completed  to the `rdm_video_cloud` repo on brightcove.

## Other brightcove video cloud plugins
This repository contains all the plugins that are being loaded using the brightcove player interface. They are in the `plugins/js` directory
 
### Pushing the files to the brightcove repository
Once we have build the videojs-rdm-plugin-loader or updated one or more plugins in the plugin directory, we need to push the updated files to brightcove. We are hosting our plugins with brightcove. We use the [Delivery System API](https://docs.brightcove.com/en/video-cloud/concepts/delivery-system-api/references/v1/index.html) of the Video Cloud to push these files to the `rdm_video_cloud` repository on brightcove. The account ID used to create the `rdm_video_cloud` repository was the City non-DRM account (Account ID: 2226196965001), hence all the requests need to be made using that account ID. To upload a file, for eg. videojs-rdm-plugin-loader.js, we can use the following command
```shell
curl \
  --user vineet.phillips@rci.rogers.com \
  --form contents=@dist/browser/videojs-rdm-plugin-loader.js \
  --request PUT \
  https://repos.api.brightcove.com/v1/accounts/2226196965001/repos/rdm_video_cloud/files/videojs-rdm-plugin-loader.js
```
You will get the following JSON response on success.
```shell
{"name":"videojs-rdm-plugin-loader.js","public_url":"http://players.brightcove.net/2226196965001/rdm_video_cloud/videojs-rdm-plugin-loader.js"}
```
Please note: You will be prompted to enter the password for vineet.phillips@rci.rogers.com if you use the above command. You can replace the username with your own brightcove username or you can use an [OAuth Access Token](https://docs.brightcove.com/en/video-cloud/concepts/delivery-system-api/guides/dev-system-api-overview.html#authentication)
```shell
curl \
  --header "Authorization: Bearer $ACCESS_TOKEN"  \
  --form contents=@dist/browser/videojs-rdm-plugin-loader.js \
  --request PUT \
  https://repos.api.brightcove.com/v1/accounts/2226196965001/repos/rdm_video_cloud/files/videojs-rdm-plugin-loader.js
```


## License

MIT. Copyright (c) Vineet Phillips &lt;phillipsv@github.com&gt;


[videojs]: http://videojs.com/
