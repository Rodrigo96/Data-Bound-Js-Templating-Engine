(function () {
  'use strict';
  
  var page = {
	init: function () {
		// js code here
	}
  };

  window.addEventListener('load', function load(event){
	window.removeEventListener('load', load, false);
	page.init();  
  },false);
}());