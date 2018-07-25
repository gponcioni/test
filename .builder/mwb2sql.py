#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
import os

directory = sys.argv[1]
if len(sys.argv) == 3:
    buildDirectory = sys.argv[2]
    if os.path.exists(buildDirectory) == False:
        os.makedirs(buildDirectory)
else :
    buildDirectory = directory
os.environ['INPUT']=directory
os.environ['OUTPUT']=buildDirectory

def mwb2sql():
    os.system("/usr/bin/mysql-workbench --run-python \"import os;import grt;from grt.modules import DbMySQLFE as fe;grt.modules.Workbench.openModel(os.environ['INPUT'] + os.environ['FILENAME']);c = grt.root.wb.doc.physicalModels[0].catalog;fe.generateSQLCreateStatements(c, c.version, {});fe.createScriptForCatalogObjects(os.environ['OUTPUT'] + os.environ['FILENAME'][:-3] + 'sql', c, {});grt.modules.Workbench.exit()\"")
    sqlPath = os.environ['OUTPUT'] + os.environ['FILENAME'][0:-3] + 'sql'
    os.system('git add ' + sqlPath)

for element in os.listdir(directory):
    if element.endswith('.mwb'):
      os.environ['FILENAME']=element
      mwb2sql()
