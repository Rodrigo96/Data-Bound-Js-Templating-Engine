var jet = {
  buildHtml: function (tpl, data) {
    var reComponentStart = /<@ ([^\/].+?) @>/g,
        match,
        componentsHtml = '';
        output = tpl;

    while (match = reComponentStart.exec(output)) {
      var componentInfo = { 
            start: match.index,
            name:  match[1].trim().split(' ')[0]
          },
          reComponentEnd = new RegExp('<@ /' + componentInfo.name + ' @>', 'g'),
          matchEnd = reComponentEnd.exec(output),
          componentProp = /prop="(.+?)"/g.exec(match[1]),
          dataLoop = data;
          
      componentInfo.end = matchEnd.index + matchEnd[0].length;
      componentInfo.content = output.slice(match.index + match[0].length, matchEnd.index);
      componentInfo.prop = componentProp ? componentProp[1] : '';
      componentsHtml = '';

      if (componentInfo.prop)
        dataLoop = data[componentInfo.prop];

      var outputStart = output.slice(0, componentInfo.start),
          outputEnd = output.slice(componentInfo.end);

      for (var i = 0; i < dataLoop.length; i++)
        componentsHtml += this.buildHtml(componentInfo.content, dataLoop[i]);

      output = outputStart + componentsHtml + outputEnd;
    }

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