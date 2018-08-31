const zip = require('file-zip');
const klawSync = require('klaw-sync');
const fs = require('fs-extra');
const shell = require('shelljs');
const path = require('path');
const replace = require('replace-in-file');
const mysql = require('mysql');
const typeorm = require('typeorm');
const argv = require('minimist')(process.argv.slice(2));

// Create the command line for call mysql workbench
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


/**
 * change sequelize model created to use ts-sequelize 
 */
const useTsSequelize = argv.u || true;

/**
 * Time to wait to open model before export PNG
 * Use too to wait the execution of the sript before generate alter script
 * can be pass at first or second (so the first should be the modelsPath) parameter 
 * default 2s
 */
const timeOut = argv.t || 2 ;

const directoryPath = path.resolve('./');
const modelsPath = argv.m || path.resolve('./models');
const lastBuild = path.resolve('./lastBuild')
const tempPath = path.resolve('./lastBuild/temp');
const configPath = path.resolve('config.json');
const errorsPath = path.resolve('./lastBuild/errors')

// paths in Build
const xmlPath = path.resolve('./build/xml');
const previewPath = path.resolve('./build/preview');
const scriptPath = path.resolve('./build/script');
const alterPath = path.resolve('./build/alter');
const tsSequelizeModelsPath = path.resolve('./build/modelsSeq');
const typeormEntitiesPath = path.resolve('./build/entitiesTypeorm');
const migrationPath = path.resolve('./build/migration');

// config to connect at a mysql database
const config = JSON.parse(fs.readFileSync(configPath, 'utf8')).mysql;
config.user = config.username;

const dbTypes = Object.keys(JSON.parse(fs.readFileSync(configPath, 'utf8')));
for (let i = 0; i < dbTypes.length; i++) {
  shell.mkdir('-p', path.join(migrationPath, dbTypes[i]));
}

// dynamic paths in last build
let fileName;
let mainPath;
let tempMwbPath;
let extractPath;
let sqlPath;
let tempXMLPath;
let pngPath;
let extractXMLPath;
let updateTime;
let alterSqlPath;
let tsSeqPath;
let migrationTypeormPath;
let migrationUpPath;
let migrationDownPath;

let actualXMLPath;
let entityPath
let oldSqlPath;
let oldEntitiesPath;

// create all directory
fs.removeSync(lastBuild);
shell.mkdir('-p', lastBuild);
shell.mkdir('-p', tempPath);
shell.mkdir('-p', xmlPath);
shell.mkdir('-p', previewPath);
shell.mkdir('-p', scriptPath);
shell.mkdir('-p', alterPath);
shell.mkdir('-p', tsSequelizeModelsPath);
shell.mkdir('-p', typeormEntitiesPath);
fs.removeSync(errorsPath);
shell.mkdir('-p', errorsPath);


const dbName = 'testBuilder';
let lastDbName;
const paths = klawSync(modelsPath).filter(f => f.path.endsWith('.mwb'));
let modelsLeft = paths.length;
build(0);


/**
 * Create png, sql, alter, migration script, sequelize models, typeorm entities and xml for all of the mwb with his path in the paths list
 * @param {number} i the indice of the actual mwb file in the paths list
 */
function  build(i) {

  const mwbPath = paths[i].path;
  fileName = path.basename(mwbPath).replace('.mwb', '');
  mainPath = path.join(lastBuild, fileName);
  tempMwbPath = path.join(mainPath, fileName) + '.mwb';
  extractPath = path.join(mainPath, fileName + '-extract');
  tempXMLPath = path.join(mainPath, fileName + '.xml');
  sqlPath = path.join(mainPath, fileName) + '.sql';
  pngPath = path.join(mainPath, fileName) + '.png';
  extractXMLPath = path.join(extractPath, '/document.mwb.xml');
  oldSqlPath = path.join(scriptPath, fileName + '.sql');
  
  shell.mkdir('-p', mainPath);
  // copy the mwb file and extract it
  fs.copySync(mwbPath, tempMwbPath);
  zip.unzip(tempMwbPath, extractPath, () => {
    new Promise ((resolve, reject) => {

      updateTime = '-' + fs.statSync(extractXMLPath).mtime.toISOString().replace(/([T:-]+)/g, '').replace(/\..+/, '');
      actualXMLPath = path.join(xmlPath, fileName + updateTime + '.xml');
      alterSqlPath = path.join(mainPath, fileName + '-alter' + updateTime + '.sql');

      if (!fs.existsSync(actualXMLPath)) {
        fs.copySync(extractXMLPath, tempXMLPath);
        // we need to have diagram open when we open model in order to generate the png
        const replaceOptions = {
          files: extractXMLPath,
          from: '<value type="int" key="closed">1</value>',
          to: '<value type="int" key="closed">0</value>',
        };
        replace.sync(replaceOptions);
        

        // in order to zip to mwb we need to be in the directory
        shell.cd(extractPath);
        zip.zipFolder('./', tempMwbPath, () => {
          
          // script to export mwb as png and sql
          const pythonScript = "\"import threading;import grt;from grt.modules import DbMySQLFE as fe;"
          + "exportPNG = lambda : (grt.modules.Workbench.exportPNG('" + pngPath + "'), grt.modules.Workbench.exit());"
          + "grt.modules.Workbench.openModel('" + tempMwbPath + "');threading.Timer(" + timeOut + ", exportPNG).start();"
          + "c = grt.root.wb.doc.physicalModels[0].catalog;fe.generateSQLCreateStatements(c, c.version, {});fe.createScriptForCatalogObjects('" + sqlPath + "', c, {})\""
          shell.exec(mwbExec + pythonScript);
          replaceDBName(sqlPath);

          
          // check if the new sql script is correct
          checkScript(fileName, sqlPath)
          .then(errors =>{
            if (errors) {
              // if the script is not correct, add errors to the errors directory, if there is older sql script keep it
              if (fs.existsSync(oldSqlPath)) {
                fs.copyFileSync(oldSqlPath, sqlPath);
              }
              shell.mkdir('-p', errorsPath);
              fs.appendFileSync(path.join(errorsPath, fileName + '-errors.txt'), errors);
              resolve();

            } else {
              generateSequelizeModel(fileName, updateTime, mainPath);
              // generate entities then generate migration with typeorm
              generateTypeormEntities(fileName, oldSqlPath, mainPath).then(() => {
                if (fs.existsSync(oldSqlPath)) {
                  generateAlterScript(fileName, oldSqlPath, sqlPath, alterSqlPath)
                  .then(errors => {
                    if (errors) {
                      fs.copyFileSync(oldSqlPath, sqlPath);
                      fs.appendFileSync(path.join(errorsPath, fileName + '-errors-alter.txt'), errors);
                    } else {
                      lastBuildToBuild();
                    }
                    resolve();
                  });
                } else {
                  lastBuildToBuild();
                  resolve();
                }
              }).catch(errors => {
                fs.writeFileSync(path.join(errorsPath, fileName + '-errors-generate-migration.txt'), errors);
                resolve();
              });
            }
          });
        });
      } else {
        fs.removeSync(mainPath);
        resolve();
      }
    }).then(() =>{
      modelsLeft--
      if (modelsLeft === 0) {
        endScript();
      } else {
        build(i + 1, paths, modelsLeft);
      }
    }).catch(error => {
      endScript(error);
    });
  });
}

/**
 * copy migration files on lastBuild to build
 */
function copyMigrationLastBuildToBuild() {
  const migrationTypes = ['typeorm', 'script'];
  for (let i = 0; i < dbTypes.length; i++) {
    const dbType = dbTypes[i];
    const migrationDbPath = path.join(migrationPath, dbType);
    shell.mkdir('-p', migrationDbPath);
    for (let j = 0; j < migrationTypes.length; j++) {
      const migrationType = migrationTypes[j];
      const endName = migrationType === 'typeorm' ? '.ts' : '.js';
      const lastBuildMigrationPath = path.join(mainPath, 'migration-' + migrationType + '-' + dbType + endName);
      const buildMigrationPath = path.join(migrationDbPath, updateTime.substring(1, updateTime.length) + '-' + fileName + '-' + migrationType + endName);
      if (fs.existsSync(lastBuildMigrationPath)) {
        fs.copyFileSync(lastBuildMigrationPath, buildMigrationPath);
        fs.copyFileSync(lastBuildMigrationPath, path.join(migrationDbPath, fileName + '-' + migrationType + endName));
      }
    }
  }
}

/**
 * copy files on lastBuild to Build
 */
function lastBuildToBuild() {
  reloadDBName();
  if (fs.existsSync(alterSqlPath)) {
    fs.copyFileSync(alterSqlPath, path.join(alterPath, fileName + updateTime + '.sql'));
  }
  copyMigrationLastBuildToBuild()
  fs.copySync(entityPath, path.join(typeormEntitiesPath, fileName + updateTime));
  if (fs.existsSync(path.join(typeormEntitiesPath, fileName))) {
    fs.removeSync(path.join(typeormEntitiesPath, fileName));
  }
  fs.copySync(entityPath, path.join(typeormEntitiesPath, fileName));
  fs.copySync(tsSeqPath, path.join(tsSequelizeModelsPath, fileName + updateTime));
  fs.copyFileSync(sqlPath, oldSqlPath);
  fs.copyFileSync(sqlPath, oldSqlPath.replace('.sql', updateTime + '.sql'));
  fs.copyFileSync(pngPath, path.join(previewPath, fileName + '.png'));
  fs.copyFileSync(tempXMLPath, actualXMLPath);
  fs.remove(mainPath);
}

/**
 * take the name of the data base of the script and replace it with the test dbName (testBuilder) 
 */
function replaceDBName() {
  lastDbName = fs.readFileSync(sqlPath, 'utf8').replace(/CREATE SCHEMA IF NOT EXISTS `/g, '|||').replace(/` DEFAULT CHARACTER SET/g, '|||').split('|||')[1];
  const sql = fs.readFileSync(sqlPath, 'utf8').replace(new RegExp(lastDbName, 'g'), dbName);
  fs.writeFileSync(sqlPath, sql);
}

/**
 * replace all dbName 
 */
function reloadDBName() {
  shell.cd(mainPath);
  shell.exec('find . -name "*" -type f -exec sed -i "s/testBuilder/' + lastDbName + '/g" {} \\;');
}

/**
 *  execute the script sql to catch errors 
 *  see ./errors
 **/
function checkScript() {
  return new Promise(resolve =>{
    const connection = mysql.createConnection(config);
    connection.connect();
    
    let sql = fs.readFileSync(sqlPath, 'utf8');
    sql = sql.replace(/\-\-(.)*/g, '').replace(/\/\*([^*]|\*[^/]\n)*\*\//g, '').replace(/\n/g,' ');
    const sqlSplit = sql.split(';');
    query(connection, sqlSplit, 0, '', resolve);
  });
}

/**
 * execute a query line of the sql script
 * @param connection A connection to the mysql Database
 * @param {string[]} sqlSplit A list with all the querys
 * @param {number} i The index of the current query to execute in sqlSplit 
 * @param {string[]} errors A list with all the errors 
 * @param resolve Use to end checkScript
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
function generateAlterScript() {
  const oldTempSqlPath = path.join(tempPath, fileName + '-tempOld.sql');

  // we replace /* and */ because this is not accept in mysql workbench executeQuery
  fs.copyFileSync(oldSqlPath, oldTempSqlPath)
  replace.sync( {
    files: oldTempSqlPath,
    from: /\/\*([^*]|\*[^/]\n)*\*\//g,
    to: '',
  });

  // we need to have the name of all schema in the script
  let listSchema = '[';
  const sql = fs.readFileSync(sqlPath, 'utf8').replace(/CREATE SCHEMA IF NOT EXISTS `/g, '|||').replace(/` DEFAULT CHARACTER SET/g, '|||');
  const sqlSplit = sql.split('|||');
  for (let i = 1; i < sqlSplit.length; i+=2) {
    listSchema += "'" + sqlSplit[i] + "',";
  }
  listSchema = listSchema.substring(0, listSchema.length -1) + ']';

  // script for generate alter script, we create the new catalog with the data we add before to check the script then we execute old script and create the old catalog, then we compare the 2 catalogs
  const pythonAlterScript = "\"import grt;import threading;"
  + "host = '127.0.0.1';user = 'root';port = 3306;password = 'Kimoce68';"
  + "file = open('" + oldTempSqlPath + "', 'r');oldScript = file.read();schemaNameList = " + listSchema + ";"
  + "connection = grt.modules.Workbench.create_connection(host, user,'',0,0, port, 'connectionTest');grt.modules.DbMySQLRE.connect(connection, password);queryConnection = grt.modules.DbMySQLQuery.openConnectionP(connection, password);"
  + "newCatalog = grt.modules.DbMySQLRE.reverseEngineer(connection, 'a', schemaNameList, {});grt.modules.DbMySQLQuery.executeQuery(queryConnection,oldScript);"
  + "endScript = lambda : (open('" + alterSqlPath + "', 'w+').write(grt.modules.DbMySQL.makeAlterScript(grt.modules.DbMySQLRE.reverseEngineer(connection, 'a', schemaNameList, {}), newCatalog, {})),"
  + "grt.modules.DbMySQLRE.disconnect(connection),grt.modules.DbMySQLQuery.closeConnection(queryConnection),grt.modules.Workbench.deleteConnection(connection),grt.modules.Workbench.exit());"
  + "threading.Timer(" + timeOut + ", endScript).start()\""
  shell.exec(mwbExec + pythonAlterScript);

  // we execute old script then alter script to see if alter script is fine
  if (fs.readFileSync(alterSqlPath, 'utf8')){
    return checkScript(fileName, oldSqlPath)
    .then(() =>{
      return checkScript(fileName, alterSqlPath)
      .then(errors =>{
        fs.renameSync(alterSqlPath, alterSqlPath + '-err.txt')
        return errors;
      });
    });
  } else {
    fs.removeSync(alterSqlPath);
    return Promise.resolve();
  }
}

/**
 * generate sequelize model, use -u for generate ts-sequelize model instead of sequelize
 */
function generateSequelizeModel() {
  shell.cd(directoryPath);
  tsSeqPath = path.join(mainPath, fileName + updateTime + '-seq'); 
  shell.exec("sequelize-auto -o " + tsSeqPath + " -d " + dbName + " -h " + config.host + " -u " + config.user + " -p " + config.port + " -x " + config.password + " -e mysql -z");
  
  if (useTsSequelize) {
    const paths = klawSync(tsSeqPath);
    for (let i = 0; i < paths.length; i++) {
      const tsPath = paths[i].path;
      const tsFileName = path.basename(tsPath);
      
      const tableName = tsFileName.replace('.ts', '');
      const file = fs.readFileSync(tsPath, 'utf8')
      .replace(/: DataTypes\.([A-Z]*)\(/g, ": new DataTypes.$1(")
      .replace(/: DataTypes\.([A-Z]*)/g, ": new DataTypes.$1()")
      .replace(/from 'sequelize'/g, "from 'ts-sequelize'")
      .replace("sequelize.Sequelize", "Sequelize")
      .replace("import * as sequelize", "import {Sequelize}");
      fs.writeFileSync(tsPath, file);
    }
  }
}

/**
 * generate typeorm entities then call the generation of the migrations script
 */
function generateTypeormEntities() {
  entityPath = path.join(mainPath, fileName + '-typeorm');
  shell.exec("typeorm-model-generator -h " + config.host + " -d "+ dbName + " -p " + config.port + " -u " + config.user + " -x " + config.password + " -o " + entityPath + " -e mysql");
  shell.cd(entityPath);
  const paths = klawSync(path.join(entityPath, 'entities'));
  for (let i = 0; i < paths.length; i++) {
    const tsPath = paths[i].path;
    const file = fs.readFileSync(tsPath, 'utf8')
    .replace(/,onUpdate: 'NO ACTION'/g, "");
    fs.writeFileSync(tsPath, file);
  }
  return generateMigrationScript();
}

/**
 * generate the typeorm migration file foreach data base type in config.json
 */
async function generateMigrationScript() {
  const configs = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  for (let i = 0; i < dbTypes.length; i++) {
    const dbType = dbTypes[i];
    const config = configs[dbType];
    config.database = config.database || dbName;
    await clearDatabase(dbType, config);
    const connection = await typeorm.createConnection(config);
    oldMigration = path.join(migrationPath, dbType, fileName + '-typeorm.ts');

    //// Ne foncionne pas encore bien (pas eu le temps de finir) 
    //// il faut enlever le false pour tenter de débug la gé nération de script de migration au lieu de seulement générer les scripts de création
    //// Problème liée au chargement du dernier script de création
    //// Erreur : "la relation « excde_UNIQUE » existe déjà"

    if (fs.existsSync(oldMigration) && false) {
      shell.exec('tsc ' + oldMigration + ' --outDir ' + path.join(mainPath, dbType));
      const createPath = path.join(mainPath, dbType, fileName + '-typeorm.js');
      const file = fs.readFileSync(createPath, 'utf8')
      .replace(new RegExp(lastDbName, 'g'), dbName);
      fs.writeFileSync(createPath, file);
      const req = require(createPath);
      await req[Object.keys(req)[1]].prototype.up(connection.createQueryRunner())
      .catch(err => {
        console.log(err);
      });
    }
    updateDataTypes(dbType);
    const ormconfig = '[' + JSON.stringify(config).replace('}', ',"synchronize":false,"entities":["entities/*.ts"]}]');
    fs.writeFileSync('ormconfig.json', ormconfig);
    const errors = shell.exec("ts-node " + path.join(directoryPath, "node_modules/typeorm/cli.js") + " migration:generate -n migration-" + dbType).stderr;
    await typeorm.getConnection().close();
    await clearDatabase(dbType, config);
    typeormMigrationToScript(dbType);
    if (errors) {
      return Promise.reject(errors);
    }
  }
  return Promise.resolve();
}

/**
 * create sql migration script from typeorm migration
 */
function typeormMigrationToScript(dbType) {
  migrationTypeormPath = path.join(mainPath, 'migration-typeorm-' + dbType + '.ts');
  migrationUpPath = path.join(mainPath, 'migration-up-' + dbType + '.sql');
  migrationDownPath = path.join(mainPath, 'migration-down-' + dbType + '.sql');
  let oldMigration;
  if (dbType === 'postgres') {
    oldMigration = klawSync(path.join(mainPath, 'postgres-entities')).filter(f => f.path.endsWith('migration-' + dbType + '.ts'))[0];
  } else {
    oldMigration = klawSync(entityPath).filter(f => f.path.endsWith('migration-' + dbType + '.ts'))[0];
  }

  if (oldMigration) {
    const oldMigrationPath = oldMigration.path;
    fs.moveSync(oldMigrationPath, migrationTypeormPath);
    const migration = fs.readFileSync(migrationTypeormPath, 'utf8').replace(/double\(..\)/g, 'double')
    .replace(/double precision\(..\)/g, 'double precision')
    .replace(/'CURRENT_TIMESTAMP'/g, 'CURRENT_TIMESTAMP');
    fs.writeFileSync(migrationTypeormPath, migration);

    // formatage du fichier de migration typeorm en script sql
    let scriptUp = migration.substring(migration.indexOf('up'), migration.indexOf('down'));
    scriptUp = scriptUp.substring(scriptUp.indexOf('await queryRunner'), scriptUp.indexOf('\n    }'));
    let scriptDown = migration.substring(migration.indexOf('down'), migration.length);
    scriptDown = scriptDown.substring(scriptDown.indexOf('await queryRunner'), scriptDown.indexOf('\n    }'));
    let quote;
    let jsFile;
    if (dbType === 'mysql') {
      quote = '"';
      const reg = new RegExp('.*\\(' + quote + '(.*)' + quote + '\\);', 'g')
      scriptUp = scriptUp.replace(reg, quote + '$1;' + quote + ' +');
      scriptUp = scriptUp.substring(0, scriptUp.length - 2);
      scriptDown = scriptDown.replace(reg, quote + '$1;' + quote + ' +');
      scriptDown = scriptDown.substring(0, scriptDown.length - 2);
      jsFile = "exports.up = " + scriptUp + ";\n\nexports.down = " + scriptDown + ";\n"
    } else if (dbType === 'postgres' || dbType === 'sqlite') {
      quote = '`';
      const reg = new RegExp('.*\\(' + quote + '(.*)' + quote + '\\);', 'g')
      scriptUp = scriptUp.replace(reg, '$1;');
      scriptDown = scriptDown.replace(reg, '$1;');
      jsFile = "exports.up = " + quote + scriptUp + quote + ";\n\nexports.down = " + quote + scriptDown + quote + ";\n"
    }

    fs.writeFileSync(path.join(mainPath, 'migration-script-' + dbType + '.js'), jsFile);
  }
}

/**
 * remove all on the testBuilder database
 */
async function clearDatabase(dbType, config) {
  const connection = await typeorm.createConnection(config);
  if (dbType === 'mssql') {
    await typeorm.getManager().query('USE master;');
  }
  if (dbType !== 'sqlite') {
    await typeorm.getManager().query('DROP DATABASE IF EXISTS '+ dbName +';');
    await typeorm.getManager().query('CREATE DATABASE '+ dbName +';');
  } else if (dbType === 'sqlite') {
    fs.removeSync(dbName);
  } 
  await typeorm.getConnection().close();
}

/**
 * call datatypes updates dependant of the db type
 */
function updateDataTypes(dbType) {
  if (dbType === 'postgres') {
    updateDataTypesForPostgres();
  } else if (dbType === 'mssql') {
    updateDataTypesForMssql();
  } else {
    shell.cd(entityPath);
  }
}

/**
 * replace the mysql datatypes which is not accept by postgres
 */
function updateDataTypesForPostgres() {
  const postgresEntitiesPath = path.join(mainPath, 'postgres-entities');
  fs.copySync(entityPath, postgresEntitiesPath);
  shell.cd(postgresEntitiesPath);
  const paths = klawSync(path.join(postgresEntitiesPath, 'entities'));
  for (let i = 0; i < paths.length; i++) {
    const tsPath = paths[i].path;
    const file = fs.readFileSync(tsPath, 'utf8')
    .replace(/tinyint/g, "int")
    .replace(/double/g, "double precision")
    .replace(/datetime/g, 'timestamp');
    fs.writeFileSync(tsPath, file);
  }
}


function updateDataTypesForMssql() {
  const mssqlEntitiesPath = path.join(mainPath, 'mssql-entities');
  fs.copySync(entityPath, mssqlEntitiesPath);
  shell.cd(mssqlEntitiesPath);
  const paths = klawSync(path.join(mssqlEntitiesPath, 'entities'));
  for (let i = 0; i < paths.length; i++) {
    const tsPath = paths[i].path;
    const file = fs.readFileSync(tsPath, 'utf8')
    .replace(/double/g, "float");
    fs.writeFileSync(tsPath, file);
  }
}

function endScript(error) {
  if (klawSync(errorsPath).length !== 0) {
    console.error('\nErrors build : check "' + errorsPath + '" for details')
  }
  if (error) {
    throw error;
  }
}
