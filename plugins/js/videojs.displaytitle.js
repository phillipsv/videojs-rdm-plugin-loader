(function(window, videojs) {
 'use strict';
  var init, titleHTML, extend, setupTitle;
  var className = 'vjs-title-display';

  var defaults = {"advertisement_title":"Advertisement"};

  init = function ( options ) {

    var player = this;
    var el = player.el_;
    defaults = extend({}, defaults, options || {});

    player.on('loadedmetadata', function() {
      var title = player.el_.getElementsByClassName( className );
      if (title.length === 0) {
        setupTitle(player);
      } else if (!player.hasClass("vjs-ad-playing")) {
        title[0].innerHTML = titleHTML(player.mediainfo.name);
      }
    });

    // When an ad starts, replace the content of the title with Advertisement
    player.on('adstart', function() {
      var title = player.el_.getElementsByClassName( className );
      if (title.length === 0)
        return;
      title[0].innerHTML = titleHTML();
    });

    // Whenever video ad ends
    player.on('adend', function() {
      var title = player.el_.getElementsByClassName( className );
      if (title.length === 0)
        return;
      title[0].innerHTML = titleHTML(player.mediainfo.name);
    });

    // Whenever video content plays
    player.on('play', function() {
      var title = player.el_.getElementsByClassName( className );
      if (title.length === 0 || player.hasClass("vjs-ad-playing"))
        return;
      title[0].innerHTML = titleHTML(player.mediainfo.name);
    });
  };

  titleHTML = function(videoName) {
    if (typeof videoName !== 'undefined')
      return '<span class="text-container"><span class="site-logo"></span><span class="text"><span class="now-playing">'+videoName+'</span></span></span>';
    else
      return '<div class="text-container">' + defaults.advertisement_title + '</div>';
  };

  setupTitle = function(player) {
    var title = player.el_.getElementsByClassName( className );
    if (title.length !== 0)
      return;
    var div = document.createElement("div");
    div.className = className;
    div.innerHTML = titleHTML(player.mediainfo.name);
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
  videojs.plugin('displaytitle', init);

})(window, window.videojs);
