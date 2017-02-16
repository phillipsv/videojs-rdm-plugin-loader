(function(window, videojs) {
  var defaults = {};

  var init = function ( options ) {

    var player = this;
    var settings = extend({}, defaults, options || {});

    function resizePlayer() {
        var width = parseInt(jQuery(player.el_).parent().width());
        var height = Math.ceil((width * 9) / 16);
        player.dimensions(width, height);
    }
    resizePlayer();
    player.on("fullscreenchange", resizePlayer);
    window.addEventListener("resize", resizePlayer);
    window.addEventListener("DOMContentLoaded", resizePlayer);
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
  videojs.plugin('responsiveplayer', init);

})(window, window.videojs);
