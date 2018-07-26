const PDFImage = require("pdf-image").PDFImage;
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const Jimp = require('jimp');

const previewPath = './build/preview';
const paths = klawSync(previewPath);

for(let i = 0; i < paths.length; i++) {
  const path = paths[i].path;
  const img = new PDFImage(path, {
    convertOptions: {
      "-quality": "300"
    }
  });
  img.convertPage(0).then(function (imagePath) {
    fs.unlinkSync(path);
    Jimp.read(imagePath, function (err, image) {
        return crop(image)
          .write(imagePath);
    });
  });
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