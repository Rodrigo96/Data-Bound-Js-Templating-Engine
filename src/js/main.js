var jet = {
  buildHtml: function (tpl, data) {
    var reComponentStart = /<@ ([^\/].+?) @>/g,
        match,
        componentsHtml = '';
        output = tpl;

    /*while (match = reComponentStart.exec(output)) {
      console.log(match);
      var componentInfo = { 
            start: match.index,
            name:  match[1].trim().split(' ')[0]
          },
          reComponentEnd = new RegExp('<@ /' + componentInfo.name + ' @>', 'g'),
          matchEnd = reComponentEnd.exec(tpl);

      componentInfo.end = matchEnd.index + matchEnd[0].length;

      console.log(componentInfo);

      for (var i = 0; i < data.length; i++) {
        componentsHtml += this.buildHtml(tpl.slice(match.index + match[0].length, matchEnd.index), data[i]);
      }

      console.log(componentsHtml);

      output = tpl.slice(0, componentInfo.start) + componentsHtml + tpl.slice(componentInfo.end);
    }*/

    while (match = reComponentStart.exec(output)) {
      var componentInfo = { 
            start: match.index,
            name:  match[1].trim().split(' ')[0]
          },
          reComponentEnd = new RegExp('<@ /' + componentInfo.name + ' @>', 'g'),
          matchEnd = reComponentEnd.exec(output);

      componentInfo.end = matchEnd.index + matchEnd[0].length;
      componentInfo.content = output.slice(match.index + match[0].length, matchEnd.index);
      componentsHtml = '';

      var outputStart = output.slice(0, componentInfo.start),
          outputEnd = output.slice(componentInfo.end);

      console.log(componentInfo);

      for (var i = 0; i < data.length; i++) {
        //console.log(output);
        componentsHtml += this.buildHtml(componentInfo.content, data[i]);
        console.log(componentsHtml);
      }

      output = outputStart + componentsHtml + outputEnd;

      console.log(output);

    }

    //console.log(output);
    return this.fillData(output, data);
  },
  fillData: function (tpl, data) {
    var reIntructions = /<%(.+?)%>/g,
        reJS = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var result = [];\n',
        cursor = 0,
        match,
        filler,
        output;

    var add = function (line, isJS) {
      if (isJS)
        code += line.match(reJS) ? line + '\n' : 'result.push(' + line + ');\n';
      else
        code += 'result.push("' + line.replace(/"/g, '\\"') + '");\n';

      return add;
    }

    while (match = reIntructions.exec(tpl)) {
      add(tpl.slice(cursor, match.index))(match[1].trim(), true);
  		cursor = match.index + match[0].length;
    }

    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return result.join("");';
    output = new Function(code.replace(/[\r\t\n]/g, '')).apply(data);

    return output;
  }
};

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