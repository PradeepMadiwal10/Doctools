import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { Merge, GripVertical } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setFiles((prev) => {
      const newFiles = [...prev];
      const draggedItem = newFiles[draggedIndex];
      newFiles.splice(draggedIndex, 1);
      newFiles.splice(index, 0, draggedItem);
      return newFiles;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setStatus("error");
      setMessage("Please select at least 2 PDF files to merge.");
      return;
    }

    setStatus("processing");
    setMessage("Merging PDF files...");

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setMessage(`Processing file ${i + 1} of ${files.length}...`);
        
        const arrayBuffer = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      
      setResultBlob(blob);
      setStatus("done");
      setMessage(`${files.length} PDF files merged successfully!`);
    } catch (error) {
      console.error("Merge error:", error);
      setStatus("error");
      setMessage("Failed to merge PDFs. One or more files may be corrupted or protected.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      saveAs(resultBlob, `${filename}.pdf`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Merge PDF"
          description="Combine multiple PDFs into one document"
          icon={Merge}
          iconColorClass="bg-tool-merge"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".pdf"
            multiple={true}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            maxFiles={20}
            description="Drop PDF files here or click to browse"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">
                <p className="mb-4 text-sm text-muted-foreground">
                  Drag to reorder files. PDFs will be merged in the order shown.
                </p>

                <div className="mb-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex cursor-move items-center gap-3 rounded-lg border-2 bg-muted/50 p-3 transition-all ${
                        draggedIndex === index
                          ? "border-primary opacity-50"
                          : "border-transparent"
                      }`}
                    >
                      <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={mergePDFs}
                  disabled={status === "processing" || files.length < 2}
                  className="w-full"
                  size="lg"
                >
                  Merge {files.length} PDFs
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename="merged"
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

export default MergePDF;
