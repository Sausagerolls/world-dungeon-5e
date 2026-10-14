// Prints the text of each page of a PDF as a JSON array. Used by build_pdf.py for contents page numbers.
import PDFKit
let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
var pages: [String] = []
for i in 0..<doc.pageCount { pages.append(doc.page(at: i)?.string ?? "") }
let data = try! JSONSerialization.data(withJSONObject: pages)
print(String(data: data, encoding: .utf8)!)
