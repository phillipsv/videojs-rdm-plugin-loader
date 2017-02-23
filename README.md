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

The minified js will be available at dist/browser/videojs-rdm-plugin-loader.min.js after build is successfully completed, which should be uploaded to the `rdm_video_cloud` repo on brightcove.

## License

MIT. Copyright (c) Vineet Phillips &lt;phillipsv@github.com&gt;


[videojs]: http://videojs.com/
