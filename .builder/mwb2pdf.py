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

def mwb2png():
    os.system("/usr/bin/mysql-workbench --run-python \"import grt;import os;grt.modules.Workbench.openModel(os.environ['INPUT'] + os.environ['FILENAME']);diagram = grt.root.wb.doc.physicalModels[0].diagrams[0];grt.modules.WbPrinting.printToPDFFile(diagram, os.environ['OUTPUT'] + os.environ['FILENAME'][:-3] + 'pdf');grt.modules.Workbench.exit()\"")


for element in os.listdir(directory):
    if element.endswith('.mwb'):
      os.environ['FILENAME']=element
      mwb2png()


