const klawSync = require('klaw-sync');
const shell = require('shelljs');
const path = require('path');

let mwb;
if(process.platform ==='win32') {
  mwb = 'C:\Program Files (x86)\MySQL\MySQL Workbench 6.0 CE\MySQLWorkbench.exe -run-python'
} else if (process.platform === 'linux') {
  mwb = '/usr/bin/mysql-workbench --run-python'
}

const modelPath = process.argv[2] || './build/models';
const scriptPath = process.argv[3] || './build/script';
shell.mkdir('-p', scriptPath);

process.env.INPUT = modelPath;
process.env.OUTPUT = scriptPath;

mwb2sql();

function mwb2sql(){
  const paths = klawSync(modelPath);
  for(let i = 0; i < paths.length; i++) {
    process.env.FILENAME = path.basename(paths[i].path);
    shell.exec(mwb + " \"import os;import grt;from grt.modules import DbMySQLFE as fe;grt.modules.Workbench.openModel(os.environ['INPUT'] + '/' + os.environ['FILENAME']);c = grt.root.wb.doc.physicalModels[0].catalog;fe.generateSQLCreateStatements(c, c.version, {});fe.createScriptForCatalogObjects(os.environ['OUTPUT'] + '/' + os.environ['FILENAME'][:-3] + 'sql', c, {});grt.modules.Workbench.exit()\"");
  }
}