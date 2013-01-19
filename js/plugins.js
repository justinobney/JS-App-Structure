(function($, doc) {
  
  /* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
  * http://benalman.com/
  * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
  var o = $({});
 
  $.subscribe = function() {
    o.on.apply(o, arguments);
  };
 
  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };
 
  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

  
  /* jQuery MapEvents - v0.1 - 1/10/2013
  * Justin Obney
  * Copyright (c) 2013 Justin Obney; Licensed MIT, GPL 
  * ** Using Ben Alman 'Pub/Sub' method       */
  var _doc = $(doc);

  $.mapEvents = function (eventMap) {
      for (var i = eventMap.length - 1; i >= 0; i--) {

          if (eventMap[i].length == 2) eventMap[i].push('*'); // add a default filter if one is not provided
          var sub = eventMap[i][0];
          var pub = eventMap[i][1];
          var filter = eventMap[i][2];


          _doc.on(sub, filter, function () {
              $.publish(pub, jQuery.makeArray(arguments).slice(1));
          });
      };
  };
 
}(jQuery, document));