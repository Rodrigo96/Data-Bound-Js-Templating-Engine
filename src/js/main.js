(function () {
  'use strict';
  
  var page = {
    init: function () {

      var getComponents = new XMLHttpRequest(),
          getData = new XMLHttpRequest(),
          generatedHtml = '<p>testing</p>',
          components,
          data;

      getComponents.addEventListener('load', successRequest);
      getComponents.open('GET', '/components.html', true);
      getComponents.send();

      getData.addEventListener('load', successRequest);
      getData.open('GET', '/data.json', true);
      getData.send();

      function successRequest(response) {
        if (response.currentTarget.status === 200 && getData.readyState === 4 && getComponents.readyState === 4) {
          components = getComponents.response;
          data = JSON.parse(getData.response);
          //generatedHtml = jet.fillData(components, data);
          generatedHtml = jet.buildHtml(components, data);
          document.body.innerHTML += generatedHtml;
        }
      }
    }
  };

  window.addEventListener('load', function load(event){
	window.removeEventListener('load', load, false);
	page.init();
  },false);
}());