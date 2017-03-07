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

  var addStyleToHead = function(css){
    var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  };

  var init = function ( options ) {

    var player = this;
    var settings = extend({}, defaults, options || {});
    var amp_page = false;

    if (typeof player.social === "undefined")
      return;

    var url_a = getGetQueryParam('linkbaseurl');
    if(url_a){
      amp_page = true;
    }
    else{
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

      //if its an amp page we hide the embedCode block
      if(amp_page){
        var css = '.video-js .vjs-social-embed-code { display: none; }';
        addStyleToHead(css);
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