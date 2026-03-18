import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { Minimize2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const ImageCompressor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setOriginalSize(newFiles[0].size);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setOriginalSize(0);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const compressImage = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setMessage("Compressing image...");

    try {
      const file = files[0];
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
          mimeType,
          quality
        );
      });

      setResultBlob(blob);
      setCompressedSize(blob.size);
      setStatus("done");
      setMessage(
        `Compressed from ${formatFileSize(originalSize)} to ${formatFileSize(blob.size)} (${Math.round((1 - blob.size / originalSize) * 100)}% reduction)`
      );
    } catch (error) {
      console.error("Compression error:", error);
      setStatus("error");
      setMessage("Failed to compress image.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      const ext = files[0]?.type === "image/png" ? ".png" : ".jpg";
      saveAs(resultBlob, `${filename}${ext}`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "compressed";
    return files[0].name.replace(/\.[^.]+$/, "") + "_compressed";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Image Compressor"
          description="Reduce image file size using quality control"
          icon={Minimize2}
          iconColorClass="bg-tool-imgcompress"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".jpg,.jpeg,.png"
            multiple={false}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            description="Drop your JPG or PNG image here"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">
                <p className="text-sm text-muted-foreground mb-4">
                  Original size: <span className="font-medium text-foreground">{formatFileSize(originalSize)}</span>
                </p>

                <div className="space-y-3 mb-6">
                  <Label className="text-sm font-medium">
                    Quality: {Math.round(quality * 100)}%
                  </Label>
                  <Slider
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    min={0.1}
                    max={1}
                    step={0.05}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smallest file</span>
                    <span>Best quality</span>
                  </div>
                </div>

                <Button onClick={compressImage} disabled={status === "processing"} className="w-full" size="lg">
                  Compress Image
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension={files[0]?.type === "image/png" ? ".png" : ".jpg"}
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

export default ImageCompressor;
