#!/usr/bin/env python
#-*- coding: utf-8 -*-

import os
import time
nfc = './models/test.mwb'
nbs = os.path.getmtime(nfc) + 7200
print time.strftime("%d/%m/%Y-%H:%M:%S",time.gmtime(nbs))
# affiche: 14/04/2009-20:42:50