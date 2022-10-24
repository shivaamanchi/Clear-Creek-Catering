
  (function ($) {
  
  "use strict";

    // NAVBAR
    $('.navbar-nav .nav-link').click(function(){
        $(".navbar-collapse").collapse('hide');
    });

    setTimeout(()=>{

      getLoationLatLng();
    });
    
  })(window.jQuery);