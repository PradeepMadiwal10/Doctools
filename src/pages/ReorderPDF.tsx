import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import { ArrowUpDown, GripVertical } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PageInfo {
  originalIndex: number;
  pageNumber: number;
  thumbnail: string;
}

const ReorderPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const generateThumbnails = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageInfos: PageInfo[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      pageInfos.push({
        originalIndex: i - 1,
        pageNumber: i,
        thumbnail: canvas.toDataURL(),
      });
    }
    return pageInfos;
  };

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
    try {
      const infos = await generateThumbnails(file);
      setPages(infos);
    } catch {
      setMessage("Failed to read PDF pages.");
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setPages([]);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setPages((prev) => {
      const updated = [...prev];
      const [dragged] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, dragged);
      return updated;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const movePageUp = (index: number) => {
    if (index === 0) return;
    setPages((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const movePageDown = (index: number) => {
    if (index === pages.length - 1) return;
    setPages((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
  };

  const exportReorderedPDF = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setMessage("Reordering pages...");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const indices = pages.map((p) => p.originalIndex);
      const copiedPages = await newPdf.copyPages(originalPdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setStatus("done");
      setMessage("PDF reordered successfully!");
    } catch (error) {
      console.error("Reorder error:", error);
      setStatus("error");
      setMessage("Failed to reorder PDF.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) saveAs(resultBlob, `${filename}.pdf`);
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "reordered";
    return files[0].name.replace(/\.pdf$/i, "") + "_reordered";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Reorder PDF Pages"
          description="Drag and drop to rearrange PDF pages"
          icon={ArrowUpDown}
          iconColorClass="bg-tool-reorder"
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

          {pages.length > 0 && (
            <>
              <div className="processing-container">
                <p className="text-sm text-muted-foreground mb-4">
                  Drag pages to reorder or use the arrow buttons. {pages.length} page(s) total.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {pages.map((page, index) => (
                    <div
                      key={`${page.originalIndex}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
                        dragIndex === index
                          ? "border-primary bg-primary/5 scale-105"
                          : "border-border/50 bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground flex-1">
                          Page {page.pageNumber}
                        </span>
                        <span className="text-xs font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div className="relative w-full aspect-[3/4] overflow-hidden rounded bg-background flex items-center justify-center">
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-full max-h-full object-contain"
                          draggable={false}
                        />
                      </div>
                      <div className="flex gap-1 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          className="flex-1 text-xs h-7"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePageDown(index)}
                          disabled={index === pages.length - 1}
                          className="flex-1 text-xs h-7"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={exportReorderedPDF} disabled={status === "processing"} className="w-full" size="lg">
                  Export Reordered PDF
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension=".pdf"
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

export default ReorderPDF;
