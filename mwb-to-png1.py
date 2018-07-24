#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from wand.image import Image, Color
import os
import shutil

directory = sys.argv[1]
needCommit = False

for element in os.listdir(directory):
    if (element.endswith('.mwb') and os.path.isfile(directory + element[0:-4] + '.png') == False):
      needCommit = True
      shutil.copyfile(directory + element, 'temp.mwb')
      os.system('/usr/bin/mysql-workbench --run-script mwb-to-png2.py')
      with Image(filename = 'temp.pdf[0]', resolution = 300) as img:
          img.save(filename = directory + element[0:-4] + '.png')
      os.remove('temp.mwb')
      os.remove('temp.pdf')
      os.system('git add ' + directory + element[0:-4] + '.png')

if (needCommit):
    os.system('git commit --amend')