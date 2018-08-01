const zip = require('file-zip');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const shell = require('shelljs');
const path = require('path');
const replace = require('replace-in-file');
const mysql = require('mysql');


let mwbExec;
if (process.env.MYSQLWORKBENCH) {
  mwbExec = process.env.MYSQLWORKBENCH
}
if (process.platform === 'win32') {
  mwbExec = mwbExec || '\"C:\\Program Files (x86)\\MySQL\\MySQL Workbench 6.3 CE\\MySQLWorkbench.exe\"';
  mwbExec += ' -run-python ';
} else if (process.platform === 'linux') {
  mwbExec = mwbExec || '/usr/bin/mysql-workbench';
  mwbExec += ' --run-python ';
}

const config = {
  host : '127.0.0.1',
  user : 'root',
  port : 3306,
  password : 'Kimoce68'
}

const modelsPath = process.argv[2] || path.resolve('./models');
const tempPath = path.resolve('./build/temp');
const xmlPath = path.resolve('./build/xml');
const previewPath = path.resolve('./build/preview');
const scriptPath = path.resolve('./build/script');
const alterPath = path.resolve('./build/alter');
const errorsPath = path.resolve('./errors')
const oldScriptPath = path.resolve('./build/old-script');


if (fs.existsSync(scriptPath)) {
  shell.mkdir('-p', oldScriptPath);
  shell.cp('-R', path.join(scriptPath, '*'), oldScriptPath);
}
// create all directory in build
shell.mkdir('-p', tempPath);
shell.mkdir('-p', xmlPath);
shell.mkdir('-p', previewPath);
shell.mkdir('-p', scriptPath);
shell.mkdir('-p', alterPath);

fs.removeSync('./errors');

const paths = klawSync(modelsPath).filter(f => f.path.endsWith('.mwb'));
let modelsLeft = paths.length;
let actualXMLPath = '';
try {
  build(0);
}catch(error) {
  endScript(error);
}


function build(i) {
  modelsLeft--;
  const mwbPath = paths[i].path;
  const fileName = path.basename(mwbPath).replace('.mwb', '');
  const tempMwbPath = path.join(tempPath, fileName) + '.mwb';
  const extractPath = path.join(tempPath, fileName)

  // copy the mwb file and extract it
  fs.copySync(mwbPath, tempMwbPath);
  zip.unzip(tempMwbPath, extractPath, () => {
    const extractXMLPath = path.join(extractPath, '/document.mwb.xml');
    const tempXMLPath = path.join(tempPath, fileName + '.xml');
    const mTime = '-' + fs.statSync(extractXMLPath).mtime.toISOString().replace(/([T:-]+)/g, '').replace(/\..+/, '');
    actualXMLPath = path.join(xmlPath, fileName + mTime + '.xml')
    
    if (!fs.existsSync(actualXMLPath)) {
      fs.copySync(extractXMLPath, tempXMLPath);
      // we need to have diagram open when we open model in order to generate the png
      replaceOptions = {
        files: extractXMLPath,
        from: '<value type="int" key="closed">1</value>',
        to: '<value type="int" key="closed">0</value>',
      };
      replace.sync(replaceOptions);
      

      // in order to zip to mwb we need to be in the directory
      shell.cd(extractPath);
      zip.zipFolder('./', tempMwbPath, () => {
        const sqlPath = path.join(scriptPath, fileName) + '.sql';
        const pngPath = path.join(previewPath, fileName) + '.png';
        
        const pythonScript = "\"import threading;import grt;from grt.modules import DbMySQLFE as fe;"
        + "exportPNG = lambda : (grt.modules.Workbench.exportPNG('" + pngPath + "'), grt.modules.Workbench.exit());"
        + "grt.modules.Workbench.openModel('" + tempMwbPath + "');threading.Timer(2, exportPNG).start();"
        + "c = grt.root.wb.doc.physicalModels[0].catalog;fe.generateSQLCreateStatements(c, c.version, {});fe.createScriptForCatalogObjects('" + sqlPath + "', c, {})\""
        shell.exec(mwbExec + pythonScript);
        fs.copySync(sqlPath, sqlPath.replace('.sql', mTime + '.sql'));
        
        new Promise((resolve, reject) => {
          verifNewScript(fileName, sqlPath, resolve);
        }).then(errors =>{
          if (errors !== '') {
            shell.mkdir('-p', errorsPath);
            fs.appendFileSync(path.join(errorsPath, fileName + '_errors.txt'), errors);
          } else {
            generateAlterScript(fileName, sqlPath);
            fs.copyFileSync(tempXMLPath, actualXMLPath);
          }
          
          if (modelsLeft === 0) {
            endScript();
          } else {
            build(i + 1);
          }
        }).catch(error => endScript(error));
        
      });
    } else {
      if (modelsLeft === 0) {
        endScript();
      } else {
        build(i + 1);
      }
    }
  });
}

/**
 *  execute the new script sql to catch errors 
 *  see ./errors
 **/
function verifNewScript(fileName, sqlPath, resolve) {
  connection = mysql.createConnection(config);
  connection.connect();
  
  let sql = fs.readFileSync(sqlPath, 'utf8');
  sql = sql.replace(/\-\-(.)*/g, '').replace(/\/\*([^*]|\*[^/]\n)*\*\//g, '').replace(/\n/g,' ');
  const sqlSplit = sql.split(';');
  query(connection, sqlSplit, 0, '', resolve);
}

/**
 * execute a query line of the sql script
 */
function query(connection, sqlSplit, i, errors, resolve) {
  connection.query(sqlSplit[i], function (error, results, fields) {
    if (error) {
      errors += error.code + ':' + error.sqlMessage + '\n SQL : ' + error.sql + '\n\n';
    }
    if (i < sqlSplit.length - 2) {
      query(connection, sqlSplit, i+1, errors, resolve);
    } else {
      connection.end();
      resolve(errors);
    }
  });
}

/**
 * if there is an old version of the script, generate alter script with the differencies between the old and the new script
 */
function generateAlterScript(fileName, sqlPath) {
  const oldSqlPath = path.join(oldScriptPath, fileName + '.sql');  
  if (fs.existsSync(oldSqlPath)) {
    const alterSqlPath = path.join(alterPath, fileName + '-alter.sql');
    
    const pythonAlterScript = "\"import grt;"
    + "oldCatalog = grt.classes.db_mysql_Catalog(); grt.modules.MysqlSqlFacade.parseSqlScriptFile(oldCatalog, '" + oldSqlPath + "');"
    + "newCatalog = grt.classes.db_mysql_Catalog(); grt.modules.MysqlSqlFacade.parseSqlScriptFile(newCatalog, '" + sqlPath + "');"
    + "alterScript = grt.modules.DbMySQL.makeAlterScript(oldCatalog, newCatalog, {});"
    + "open('" + alterSqlPath + "', 'w+').write(alterScript);"
    + "grt.modules.Workbench.exit()\""
    shell.exec(mwbExec + pythonAlterScript);
  }
} 

function endScript(error) {
  fs.removeSync(tempPath);
  fs.removeSync(oldScriptPath);
  if (error) {
    throw error;
  }
}
