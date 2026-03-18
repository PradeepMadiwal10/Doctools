import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { FileDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type CompressionTarget = "100" | "200" | "500";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionTarget, setCompressionTarget] = useState<CompressionTarget>("200");

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setOriginalSize(file.size);
    setStatus("ready");
    setMessage("");
    setCompressedBlob(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setOriginalSize(0);
    setCompressedBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPDF = async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setMessage("Compressing your PDF...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Remove metadata to reduce size
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("");
      pdfDoc.setCreator("");
      
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const targetKB = parseInt(compressionTarget) * 1024;
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
      
      if (blob.size > targetKB && originalSize > targetKB) {
        setStatus("error");
        setMessage(`This document cannot be reduced to under ${compressionTarget} KB without losing readability. Current size: ${formatFileSize(blob.size)}`);
        setCompressedBlob(blob);
        setCompressedSize(blob.size);
        return;
      }

      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setStatus("done");
      setMessage(`Compressed from ${formatFileSize(originalSize)} to ${formatFileSize(blob.size)}`);
    } catch (error) {
      console.error("Compression error:", error);
      setStatus("error");
      setMessage("Failed to compress PDF. Please try a different file.");
    }
  };

  const handleDownload = (filename: string) => {
    if (compressedBlob) {
      saveAs(compressedBlob, `${filename}.pdf`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "compressed";
    return files[0].name.replace(/\.pdf$/i, "") + "_compressed";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Compress PDF"
          description="Reduce PDF file size while maintaining quality"
          icon={FileDown}
          iconColorClass="bg-tool-compress"
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
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Original size: <span className="font-medium text-foreground">{formatFileSize(originalSize)}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Target Size</Label>
                  <RadioGroup
                    value={compressionTarget}
                    onValueChange={(value) => setCompressionTarget(value as CompressionTarget)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="100" id="size-100" />
                      <Label htmlFor="size-100" className="cursor-pointer">Under 100 KB</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="200" id="size-200" />
                      <Label htmlFor="size-200" className="cursor-pointer">Under 200 KB</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="500" id="size-500" />
                      <Label htmlFor="size-500" className="cursor-pointer">Under 500 KB</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={compressPDF}
                  disabled={status === "processing"}
                  className="mt-6 w-full"
                  size="lg"
                >
                  Compress PDF
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {(status === "done" || (status === "error" && compressedBlob)) && compressedBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension=".pdf"
                  onDownload={handleDownload}
                  fileSize={formatFileSize(compressedSize)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompressPDF;
