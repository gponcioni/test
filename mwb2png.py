#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from wand.image import Image, Color
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
    outputPath = os.environ['OUTPUT'] + os.environ['FILENAME'][0:-3]
    with Image(filename = outputPath + 'pdf[0]', resolution = 300) as img:
      img.save(filename = outputPath + 'png')
    os.system('git add ' + outputPath + 'png')
    os.remove(outputPath + 'pdf')

def rewriteREADME():
  pngLinks = '--- Start model preview ---\n'
  for element in os.listdir(os.environ['OUTPUT']):
    if element.endswith('.png'):
      pngLinks += '!['+element[:-4]+']('+os.environ['OUTPUT']+element+')\n'
  pngLinks += '--- End model preview ---'
  print pngLinks

for element in os.listdir(directory):
    if element.endswith('.mwb'):
      os.environ['FILENAME']=element
      mwb2png()

rewriteREADME()





