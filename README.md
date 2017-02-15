# videojs-rdm-plugin-loader

Loads all the plugins after acquiring the configuration from the page or URL

## Installation

```sh
npm install --save videojs-rdm-plugin-loader
```

## Usage

To include videojs-rdm-plugin-loader on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-rdm-plugin-loader.min.js"></script>
<script>
  var player = videojs('my-video');

  player.rdmPluginLoader();
</script>
```

### Browserify

When using with Browserify, install videojs-rdm-plugin-loader via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-rdm-plugin-loader');

var player = videojs('my-video');

player.rdmPluginLoader();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-rdm-plugin-loader'], function(videojs) {
  var player = videojs('my-video');

  player.rdmPluginLoader();
});
```

## License

MIT. Copyright (c) Vineet Phillips &lt;phillipsv@github.com&gt;


[videojs]: http://videojs.com/
