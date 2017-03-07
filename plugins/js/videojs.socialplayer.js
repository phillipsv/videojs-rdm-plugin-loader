(function(window, videojs) {
  var defaults = {};

  var getGetQueryParam = function (name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  var init = function ( options ) {

    var player = this;
    var settings = extend({}, defaults, options || {});

    if (typeof player.social === "undefined")
      return;

    var url_a = getGetQueryParam('linkbaseurl');
    if(!url_a){
      url_a = window.location.href;
    }
    player.on('loadedmetadata', function() {
      var metadata = {
        title: player.mediainfo.name,
        description: player.mediainfo.description,
        url: url_a
      };

      if (typeof player.el_.dataset.iframeUrl !== 'undefined') {
        metadata.embedCode = "<iframe src='"+player.el_.dataset.iframeUrl+"' allowfullscreen frameborder=0></iframe>";
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