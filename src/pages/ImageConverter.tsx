import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const formatOptions: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: ".png" },
  { value: "image/jpeg", label: "JPG", ext: ".jpg" },
  { value: "image/webp", label: "WebP", ext: ".webp" },
];

const ImageConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const convertImage = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setMessage("Converting image...");

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

      if (outputFormat === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
          outputFormat,
          0.92
        );
      });

      setResultBlob(blob);
      setStatus("done");
      const formatLabel = formatOptions.find((f) => f.value === outputFormat)?.label;
      setMessage(`Converted to ${formatLabel} successfully!`);
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setMessage("Failed to convert image.");
    }
  };

  const getExt = () => formatOptions.find((f) => f.value === outputFormat)?.ext || ".png";

  const handleDownload = (filename: string) => {
    if (resultBlob) saveAs(resultBlob, `${filename}${getExt()}`);
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "converted";
    return files[0].name.replace(/\.[^.]+$/, "") + "_converted";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Image Converter"
          description="Convert images between JPG, PNG, and WebP formats"
          icon={RefreshCw}
          iconColorClass="bg-tool-imgconvert"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            description="Drop your image here (JPG, PNG, WebP)"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">
                <div className="space-y-3 mb-6">
                  <Label className="text-sm font-medium">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={convertImage} disabled={status === "processing"} className="w-full" size="lg">
                  Convert Image
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension={getExt()}
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

export default ImageConverter;
