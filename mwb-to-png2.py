import grt

grt.modules.Workbench.openModel('temp.mwb')
diagram = grt.root.wb.doc.physicalModels[0].diagrams[0]
grt.modules.WbPrinting.printToPDFFile(diagram, 'temp.pdf')
grt.modules.Workbench.exit()
