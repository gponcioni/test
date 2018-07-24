#!/usr/bin/env python
#-*- coding: utf-8 -*-

import sys
from wand.image import Image, Color
import os
import shutil

directory = sys.argv[1]


for element in os.listdir(directory):
    if element.endswith('.mwb'):
    	shutil.copyfile(directory + element, 'temp.mwb')
        os.system('/usr/bin/mysql-workbench --run-script mwb-to-png2.py')
        with Image(filename = 'temp.pdf[0]', resolution = 300) as img:
            img.save(filename = directory + element[0:-4] + '.png')
        os.remove('temp.mwb')
        os.remove('temp.pdf')