(function(window, videojs) {
  var defaults = {};

  var init = function ( options ) {

    var player = this;
    var settings = extend({}, defaults, options || {});

    if (typeof player.social === "undefined")
      return;

    player.on('loadedmetadata', function() {
      var metadata = {
        title: player.mediainfo.name,
        description: player.mediainfo.description,
        url: window.location.href
      }

      if (typeof player.el_.dataset.iframeUrl !== 'undefined') {
        metadata.embedCode = player.el_.dataset.iframeUrl;
      }

      player.social(metadata);
    });

  };  

  var extend = function(obj) {
    var arg, i, k;
    for (i = 1; i < arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  };

  // register the plugin
  videojs.plugin('socialplayer', init);

})(window, window.videojs);