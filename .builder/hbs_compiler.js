const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const klawSync = require('klaw-sync')

const readmeTemplatePath = './README.hbs';
const previewPath = './build/preview';
const outFilePath = './README.md';

const paths = klawSync(previewPath);


var context = { previews : paths.map( f => {
  const fileName = path.basename(f.path);
  return {
    path : path.join(previewPath, fileName),
    fileName
  };
}) };

var template = Handlebars.compile(fs.readFileSync(readmeTemplatePath, {
  encoding : 'UTF-8'
}));

var readme = template(context);

fs.writeFileSync(outFilePath, readme);