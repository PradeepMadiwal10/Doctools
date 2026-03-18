import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { saveAs } from "file-saver";
import { RotateCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PageInfo {
  pageNumber: number;
  rotation: number;
  thumbnail: string;
}

const RotatePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);

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
        pageNumber: i,
        rotation: 0,
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

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const rotateAll = (angle: number) => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + angle) % 360 })));
  };

  const applyRotation = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setMessage("Applying rotations...");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      pages.forEach((pageInfo, i) => {
        if (pageInfo.rotation !== 0) {
          const currentRotation = pdfPages[i].getRotation().angle;
          pdfPages[i].setRotation(degrees(currentRotation + pageInfo.rotation));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setStatus("done");
      setMessage("Pages rotated successfully!");
    } catch (error) {
      console.error("Rotation error:", error);
      setStatus("error");
      setMessage("Failed to rotate PDF.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) saveAs(resultBlob, `${filename}.pdf`);
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "rotated";
    return files[0].name.replace(/\.pdf$/i, "") + "_rotated";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Rotate PDF"
          description="Rotate PDF pages by 90°, 180°, or 270°"
          icon={RotateCw}
          iconColorClass="bg-tool-rotate"
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
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => rotateAll(90)}>
                    Rotate All 90°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rotateAll(180)}>
                    Rotate All 180°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rotateAll(270)}>
                    Rotate All 270°
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {pages.map((page, index) => (
                    <div
                      key={page.pageNumber}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="relative w-full aspect-[3/4] overflow-hidden rounded bg-background flex items-center justify-center">
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-full max-h-full object-contain transition-transform duration-300"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Page {page.pageNumber} ({page.rotation}°)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotatePage(index)}
                        className="w-full"
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        90°
                      </Button>
                    </div>
                  ))}
                </div>

                <Button onClick={applyRotation} disabled={status === "processing"} className="w-full" size="lg">
                  Apply Rotation
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

export default RotatePDF;
