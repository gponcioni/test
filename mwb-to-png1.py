#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from wand.image import Image, Color
import os
import shutil

directory = sys.argv[1]
if len(sys.argv) == 3:
    buildDirectory = sys.argv[2]
    os.makedirs(buildDirectory)
else :
    buildDirectory = directory

for element in os.listdir(directory):
    if element.endswith('.mwb'):
      shutil.copyfile(directory + element, 'temp.mwb')
      os.system('/usr/bin/mysql-workbench --run-script mwb-to-png2.py')
      pngPath = buildDirectory + element[0:-4] + '.png'
      with Image(filename = 'temp.pdf[0]', resolution = 300) as img:
          img.save(filename = pngPath)
      os.system('git add ' + pngPath)
      os.remove('temp.mwb')
      os.remove('temp.pdf')
