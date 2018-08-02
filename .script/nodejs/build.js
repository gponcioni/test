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
fs.removeSync(errorsPath);
shell.mkdir('-p', errorsPath);


const paths = klawSync(modelsPath).filter(f => f.path.endsWith('.mwb'));
let modelsLeft = paths.length;
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
    const actualXMLPath = path.join(xmlPath, fileName + mTime + '.xml')
    
    new Promise ((resolve, reject) => {
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
          
          checkScript(fileName, sqlPath)
          .then(errors =>{
            const oldSqlPath = path.join(oldScriptPath, fileName + '.sql');
            if (errors) {
              if (fs.existsSync(oldSqlPath)) {
                fs.copyFileSync(oldSqlPath, sqlPath);
              }
              shell.mkdir('-p', errorsPath);
              fs.appendFileSync(path.join(errorsPath, fileName + '-errors.txt'), errors);
              resolve();
            } else {
              if (fs.existsSync(oldSqlPath)) {
                generateAlterScript(fileName, oldSqlPath, sqlPath)
                .then(errors => {
                  if (errors) {
                    fs.copyFileSync(oldSqlPath, sqlPath);
                    fs.appendFileSync(path.join(errorsPath, fileName + '-errors-alter.txt'), errors);
                  } else {
                    fs.copyFileSync(tempXMLPath, actualXMLPath);
                  }
                  resolve();
                });
              } else {
                fs.copyFileSync(tempXMLPath, actualXMLPath);
                resolve();
              }
            }
          });
        });
      } else {
        resolve();
      }
    }).then(() =>{
      if (modelsLeft === 0) {
        endScript();
      } else {
        build(i + 1);
      }
    }).catch(error => {
      endScript(error);
    });
  });
}

/**
 *  execute the script sql to catch errors 
 *  see ./errors
 **/
function checkScript(fileName, sqlPath) {
  return new Promise(resolve =>{
    connection = mysql.createConnection(config);
    connection.connect();
    
    let sql = fs.readFileSync(sqlPath, 'utf8');
    sql = sql.replace(/\-\-(.)*/g, '').replace(/\/\*([^*]|\*[^/]\n)*\*\//g, '').replace(/\n/g,' ');
    const sqlSplit = sql.split(';');
    query(connection, sqlSplit, 0, '', resolve);
  });
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
 * then checked
 */
function generateAlterScript(fileName, oldSqlPath, sqlPath) {
  const alterSqlPath = path.join(alterPath, fileName + '-alter.sql');
  const oldTempSqlPath = path.join(tempPath, fileName + '-tempOld.sql');

  fs.copyFileSync(oldSqlPath, oldTempSqlPath)

  replace.sync( {
    files: oldTempSqlPath,
    from: /\/\*([^*]|\*[^/]\n)*\*\//g,
    to: '',
  });

  let listSchema = '[';
  const sql = fs.readFileSync(sqlPath, 'utf8').replace(/CREATE SCHEMA IF NOT EXISTS `/g, '|||').replace(/` DEFAULT CHARACTER SET/g, '|||');
  const sqlSplit = sql.split('|||');
  for (let i = 1; i < sqlSplit.length; i+=2) {
    listSchema += "'" + sqlSplit[i] + "',";
  }
  listSchema = listSchema.substring(0, listSchema.length -1) + ']';
  const pythonAlterScript = "\"import grt;import threading;"
  + "host = '127.0.0.1';user = 'root';port = 3306;password = 'Kimoce68';"
  + "file = open('" + oldTempSqlPath + "', 'r');oldScript = file.read();schemaNameList = " + listSchema + ";"
  + "connection = grt.modules.Workbench.create_connection(host, user,'',0,0, port, 'connectionTest');grt.modules.DbMySQLRE.connect(connection, password);queryConnection = grt.modules.DbMySQLQuery.openConnectionP(connection, password);"
  + "newCatalog = grt.modules.DbMySQLRE.reverseEngineer(connection, 'a', schemaNameList, {});grt.modules.DbMySQLQuery.executeQuery(queryConnection,oldScript);"
  + "endScript = lambda : (open('" + alterSqlPath + "', 'w+').write(grt.modules.DbMySQL.makeAlterScript(grt.modules.DbMySQLRE.reverseEngineer(connection, 'a', schemaNameList, {}), newCatalog, {})),"
  + "grt.modules.DbMySQLRE.disconnect(connection),grt.modules.DbMySQLQuery.closeConnection(queryConnection),grt.modules.Workbench.deleteConnection(connection),grt.modules.Workbench.exit());"
  + "threading.Timer(2, endScript).start()\""
  shell.exec(mwbExec + pythonAlterScript);

  if (fs.readFileSync(alterSqlPath, 'utf8')){
    return checkScript(fileName, oldSqlPath)
    .then(() =>{
      return checkScript(fileName, alterSqlPath);
    });
  } else {
    return new Promise(resolve => {
      fs.removeSync(alterSqlPath);
      resolve();
    });
  }
} 

function endScript(error) {
  fs.removeSync(tempPath);
  fs.removeSync(oldScriptPath);
  if (error) {
    throw error;
  }
}
