#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from wand.image import Image, Color
import os
from PIL import Image as image

directory = sys.argv[1]
if len(sys.argv) == 3:
    buildDirectory = sys.argv[2]
    if os.path.exists(buildDirectory) == False:
        os.makedirs(buildDirectory)
else :
    buildDirectory = directory
os.environ['INPUT']=directory
os.environ['OUTPUT']=buildDirectory

def resize():
    outputPath = os.environ['OUTPUT'] + os.environ['FILENAME'][0:-3] + 'png'
    im = image.open(outputPath)
    pix = im.load()
    width, height = im.size
    for left in xrange(width):
        if any( pix[left,y][:3] != (255,255,255) for y in xrange(height)):  break
    for right in xrange(width-1,left,-1):
        if any( pix[right,y][:3] != (255,255,255) for y in xrange(height)):  break
    for top in xrange(height):
        if any( pix[x,top][:3] != (255,255,255) for x in xrange(width)):  break
    for bottom in xrange(height-1,top,-1):
        if any( pix[x,bottom][:3] != (255,255,255) for x in xrange(width)):  break
    box = (left-50, top-50, right+50, bottom+50)
    area = im.crop(box)
    area.save(outputPath, "PNG")

def mwb2png():
    os.system("/usr/bin/mysql-workbench --run-python \"import grt;import os;grt.modules.Workbench.openModel(os.environ['INPUT'] + os.environ['FILENAME']);diagram = grt.root.wb.doc.physicalModels[0].diagrams[0];grt.modules.WbPrinting.printToPDFFile(diagram, os.environ['OUTPUT'] + os.environ['FILENAME'][:-3] + 'pdf');grt.modules.Workbench.exit()\"")
    outputPath = os.environ['OUTPUT'] + os.environ['FILENAME'][0:-3]
    with Image(filename = outputPath + 'pdf[0]', resolution = 500) as img:
      img.save(filename = outputPath + 'png')
    resize()
    os.system('git add ' + outputPath + 'png')
    os.remove(outputPath + 'pdf')



for element in os.listdir(directory):
    if element.endswith('.mwb'):
      os.environ['FILENAME']=element
      mwb2png()


