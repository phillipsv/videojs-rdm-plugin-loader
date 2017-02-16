(function(window, videojs) {
 'use strict';
  var init, extend, setup;
  var className = 'vjs-watermark';
  
  var defaults = {};

  init = function ( options ) {

    var player = this;
    var el = player.el_;
    var settings = extend({}, defaults, options || {});
    
    // Loaded once so we don't insert the same div more than once
    // player.on('loadedmetadata', function() {
    //   setupTitle(player);
    //   player.off('loadedmetadata');
    // });
    player.on('loadedmetadata-post', function() {
      setup(player);
      player.off('loadedmetadata-post');
    });

  };  

  setup = function(player) {
    var w_div = player.el_.getElementsByClassName( className );
    if (w_div.length !== 0) 
      return;
    var div = document.createElement("div");
    div.className = className;
    div.innerHTML = '<span class="site-logo"></span>';
    player.el_.appendChild(div); 
  }

  extend = function(obj) {
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
  }

  // register the plugin
  videojs.plugin('watermark', init);

})(window, window.videojs);