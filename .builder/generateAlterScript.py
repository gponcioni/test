
host = '127.0.0.1'
user = 'root'
port = 3306
connectionName = 'test'
password = 'Kimoce68'
connection = grt.modules.Workbench.create_connection(host, user,'',0,0, port, connectionName)
grt.modules.DbMySQLRE.connect(connection, password)
catalogName = 'test'
schemaNameList = ['mydb', 'mydb2']
oldCatalog = grt.modules.DbMySQLRE.reverseEngineer(connection, catalogName, schemaNameList, {})
grt.modules.DbMySQLRE.disconnect(connection)
newCatalog = grt.root.wb.doc.physicalModels[0].catalog
alterScript = grt.modules.DbMySQL.makeAlterScript(newCatalog, oldCatalog, {})
queryConnection = grt.modules.DbMySQLQuery.openConnectionP(connection, password)
grt.modules.DbMySQLQuery.executeQuery(queryConnection,alterScript)
grt.modules.DbMySQLQuery.closeConnection(queryConnection)