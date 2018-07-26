var pdf2image = require('pdf2image');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const Jimp = require('jimp');
const shell = require('shelljs');
const path = require('path');

let mwb;
if(process.platform ==='win32') {
  mwb = 'C:\Program Files (x86)\MySQL\MySQL Workbench 6.0 CE\MySQLWorkbench.exe -run-python'
} else if (process.platform === 'linux') {
  mwb = '/usr/bin/mysql-workbench --run-python'
}

const modelPath = process.argv[2] || './build/models';
const previewPath = process.argv[3] || './build/preview';
shell.mkdir('-p', previewPath);

process.env.INPUT = modelPath;
process.env.OUTPUT = previewPath;

mwb2pdf();
pdf2png();

function mwb2pdf(){
  const paths = klawSync(modelPath);
  for(let i = 0; i < paths.length; i++) {
    process.env.FILENAME = path.basename(paths[i].path);
    shell.exec(mwb + " \"import grt;import os;grt.modules.Workbench.openModel(os.environ['INPUT'] + '/' + os.environ['FILENAME']);diagram = grt.root.wb.doc.physicalModels[0].diagrams[0];grt.modules.WbPrinting.printToPDFFile(diagram, os.environ['OUTPUT'] + '/' + os.environ['FILENAME'][:-3] + 'pdf');grt.modules.Workbench.exit()\"");
  }
}

function pdf2png() {
  const paths = klawSync(previewPath);
  for(let i = 0; i < paths.length; i++) {
    const pdfPath = paths[i].path;
    pdf2image.convertPDF(pdfPath,{
      density : 200,
      quality : 100,
      outputFormat : pdfPath.replace('.pdf', ''),
      outputType : 'png',
      pages : '1'
    }).then(pageList => {
      const pngPath = pageList[0].path;
      fs.unlinkSync(pngPath.replace('.png', '.pdf'));
      Jimp.read(pngPath, function (err, image) {
          return crop(image)
            .write(pngPath);
      });
    });
  }
}

function crop(image) {
  let xmin = 0;
  let xmax = image.bitmap.width;
  let ymin = 0;
  let ymax = image.bitmap.height;

  let ok = true;
  for (let x = xmin; x < xmax && ok; x++) {
    for (let y = ymin; y < ymax && ok; y++) {
      if(image.getPixelColor(x, y) !== 4294967040) {
        ok = false;
        xmin = x;
      }
    }
  }

  ok = true;
  for (let x = xmax; x > xmin && ok; x--) {
    for (let y = ymin; y < ymax && ok; y++) {
      if(image.getPixelColor(x, y) !== 4294967040) {
        ok = false;
        xmax = x;
      }
    }
  }

  ok = true;
  for (let y = ymin; y < ymax && ok; y++) {
    for (let x = xmin; x < xmax && ok; x++) {
      if(image.getPixelColor(x, y) !== 4294967040) {
        ok = false;
        ymin = y;
      }
    }
  }

  ok = true;
  for (let y = ymax; y > ymin && ok; y--) {
    for (let x = xmin; x < xmax && ok; x++) {
      if(image.getPixelColor(x, y) !== 4294967040) {
        ok = false;
        ymax = y;
      }
    }
  }
  return image.crop(xmin, ymin, xmax - xmin, ymax - ymin);
}