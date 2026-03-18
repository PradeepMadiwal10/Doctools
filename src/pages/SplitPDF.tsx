import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Split } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const SplitPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pageRanges, setPageRanges] = useState<string>("");
  const [singleFile, setSingleFile] = useState<boolean>(false);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
    setSingleFile(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      setPageRanges(`1-${pdf.numPages}`);
    } catch (error) {
      console.error("Error reading PDF:", error);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
    setPageCount(0);
    setPageRanges("");
  }, []);

  const parsePageRanges = (input: string, maxPages: number): number[][] => {
    const ranges: number[][] = [];
    const parts = input.split(",").map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          const range: number[] = [];
          for (let i = start; i <= end; i++) {
            range.push(i - 1); // 0-indexed
          }
          ranges.push(range);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          ranges.push([page - 1]);
        }
      }
    }

    return ranges;
  };

  const splitPDF = async () => {
    if (files.length === 0) return;

    const ranges = parsePageRanges(pageRanges, pageCount);
    if (ranges.length === 0) {
      setStatus("error");
      setMessage("Please enter valid page ranges (e.g., 1-3, 5, 7-10)");
      return;
    }

    setStatus("processing");
    setMessage("Splitting PDF...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const pdfBlobs: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < ranges.length; i++) {
        setMessage(`Creating split ${i + 1} of ${ranges.length}...`);
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(originalPdf, ranges[i]);
        pages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        
        const rangeStr = ranges[i].length === 1 
          ? `page_${ranges[i][0] + 1}` 
          : `pages_${ranges[i][0] + 1}-${ranges[i][ranges[i].length - 1] + 1}`;
        
        pdfBlobs.push({
          name: `${rangeStr}.pdf`,
          blob,
        });
      }

      if (pdfBlobs.length === 1) {
        setSingleFile(true);
        setResultBlob(pdfBlobs[0].blob);
      } else {
        const zip = new JSZip();
        for (const pdf of pdfBlobs) {
          zip.file(pdf.name, pdf.blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
        setSingleFile(false);
      }

      setStatus("done");
      setMessage(`PDF split into ${ranges.length} part(s) successfully!`);
    } catch (error) {
      console.error("Split error:", error);
      setStatus("error");
      setMessage("Failed to split PDF. The file may be corrupted or protected.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      const ext = singleFile ? ".pdf" : ".zip";
      saveAs(resultBlob, `${filename}${ext}`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "split_pdf";
    return files[0].name.replace(/\.pdf$/i, "") + "_split";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Split PDF"
          description="Extract pages from PDF into separate files"
          icon={Split}
          iconColorClass="bg-tool-split"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".pdf"
            multiple={false}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            description="Drop your PDF here or click to browse"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">
                <p className="mb-4 text-sm text-muted-foreground">
                  This PDF has <span className="font-medium text-foreground">{pageCount} page(s)</span>.
                </p>

                <div className="mb-6 space-y-3">
                  <Label htmlFor="page-ranges" className="text-sm font-medium">
                    Page Ranges
                  </Label>
                  <Input
                    id="page-ranges"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="e.g., 1-3, 5, 7-10"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter page numbers or ranges separated by commas. Each range creates a separate PDF.
                    Example: "1-3, 5, 7-10" creates 3 PDFs.
                  </p>
                </div>

                <Button
                  onClick={splitPDF}
                  disabled={status === "processing" || !pageRanges.trim()}
                  className="w-full"
                  size="lg"
                >
                  Split PDF
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension={singleFile ? ".pdf" : ".zip"}
                  onDownload={handleDownload}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SplitPDF;
