import grt
import os
from grt.modules import DbMySQLFE as fe

grt.modules.Workbench.openModel(os.environ['MWBPATH'])
c = grt.root.wb.doc.physicalModels[0].catalog
fe.generateSQLCreateStatements(c, c.version, {})
fe.createScriptForCatalogObjects(os.environ['SQLPATH'], c, {})
grt.modules.Workbench.exportPNG(os.environ['PNGPATH'])
grt.modules.Workbench.exit()


