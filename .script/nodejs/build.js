const zip = require('file-zip');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const shell = require('shelljs');
const path = require('path');
const replace = require('replace-in-file');

let mwbExec;
if (process.env.MYSQLWORKBENCH) {
  mwbExec = process.env.MYSQLWORKBENCH
}

// create the command line to open mysql Workbench and run the python script
const pythonScript = "\"import grt;import os;from grt.modules import DbMySQLFE as fe;grt.modules.Workbench.openModel(os.environ['MWBPATH']);c = grt.root.wb.doc.physicalModels[0].catalog;fe.generateSQLCreateStatements(c, c.version, {});fe.createScriptForCatalogObjects(os.environ['SQLPATH'], c, {});diagram = grt.root.wb.doc.physicalModels[0].diagrams[0];grt.modules.WbPrinting.printToPDFFile(diagram, os.environ['PNGPATH']);grt.modules.Workbench.exportPNG(os.environ['PNGPATH']);grt.modules.Workbench.exit()\""
if (process.platform === 'win32') {
  mwbExec = mwbExec || 'C:\\Program Files (x86)\\MySQL\\MySQL Workbench 6.3 CE\\MySQLWorkbench.exe';
  mwbExec += ' -run-python ' + pythonScript;
} else if (process.platform === 'linux') {
  mwbExec = mwbExec || '/usr/bin/mysql-workbench';
  mwbExec += ' --run-python ' + pythonScript;
}

const modelsPath = process.argv[2] || path.resolve('./models');
const tempPath = path.resolve('./build/temp');
const xmlPath = path.resolve('./build/xml');
const previewPath = path.resolve('./build/preview');
const scriptPath = path.resolve('./build/script');
const alterPath = path.resolve('./build/alter');

// create all directory in build
shell.mkdir('-p', tempPath);
shell.mkdir('-p', xmlPath);
shell.mkdir('-p', previewPath);
shell.mkdir('-p', scriptPath);
shell.mkdir('-p', alterPath);

const paths = klawSync(modelsPath);
let modelsLeft = paths.length;
new Promise((resolve, reject) => {
  build(0, resolve);
}).then(() =>{
  // we delete the temp directory at the end
  fs.removeSync(tempPath);
});


function build(i, resolve) {
  const mwbPath = paths[i].path;
  const fileName = path.basename(mwbPath).replace('.mwb', '');
  const tempMwbPath = path.join(tempPath, fileName) + '.mwb';
  const extractPath = path.join(tempPath, fileName)
  // copy the mwb file and extract it
  fs.copySync(mwbPath, tempMwbPath);
  zip.unzip(tempMwbPath, extractPath, () => {
    const tempXMLPath = path.join(extractPath, '/document.mwb.xml');
    const mTime = '-' + fs.statSync(tempXMLPath).mtime.toISOString().replace(/([T:-]+)/g, '').replace(/\..+/, '');
    const newXMLPath = path.join(xmlPath, fileName + mTime + '.xml')
    if (!fs.existsSync(newXMLPath)) {
      fs.copySync(tempXMLPath, newXMLPath);
      // we need to have diagram open when we open model in order to generate the png
      replace.sync({
        files: tempXMLPath,
        from: '<value type="int" key="closed">1</value>',
        to: '<value type="int" key="closed">0</value>',
      });

      // in order to zip to mwb we need to be in the directory
      shell.cd(extractPath);
      zip.zipFolder('./', tempMwbPath, () => {
        process.env.MWBPATH = tempMwbPath;
        process.env.SQLPATH = path.join(scriptPath, fileName) + mTime + '.sql';
        process.env.ALTERPATH = path.join(alterPath, fileName) + '.sql';
        process.env.PNGPATH = path.join(previewPath, fileName) + '.png';
        shell.exec(mwbExec);
        modelsLeft--;
        if (modelsLeft === 0) {
          resolve();
        } else {
          build(i + 1, resolve);
        }
      });
    }
  });
}