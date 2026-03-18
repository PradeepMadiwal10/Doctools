import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { Maximize2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ResizeImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
    setWidth(0);
    setHeight(0);
  }, []);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (keepAspectRatio && originalWidth > 0) {
      setHeight(Math.round((newWidth / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (keepAspectRatio && originalHeight > 0) {
      setWidth(Math.round((newHeight / originalHeight) * originalWidth));
    }
  };

  const resizeImage = async () => {
    if (files.length === 0 || width <= 0 || height <= 0) return;
    setStatus("processing");
    setMessage("Resizing image...");

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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Resize failed"))),
          mimeType,
          0.92
        );
      });

      setResultBlob(blob);
      setStatus("done");
      setMessage(`Resized to ${width} × ${height} pixels!`);
    } catch (error) {
      console.error("Resize error:", error);
      setStatus("error");
      setMessage("Failed to resize image.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      const ext = files[0]?.type === "image/png" ? ".png" : ".jpg";
      saveAs(resultBlob, `${filename}${ext}`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "resized";
    return files[0].name.replace(/\.[^.]+$/, "") + `_${width}x${height}`;
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Resize Image"
          description="Resize images to exact dimensions"
          icon={Maximize2}
          iconColorClass="bg-tool-imgresize"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            description="Drop your image here"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">
                <p className="text-sm text-muted-foreground mb-4">
                  Original: {originalWidth} × {originalHeight} pixels
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <Switch
                    id="aspect-ratio"
                    checked={keepAspectRatio}
                    onCheckedChange={setKeepAspectRatio}
                  />
                  <Label htmlFor="aspect-ratio" className="cursor-pointer">
                    Maintain aspect ratio
                  </Label>
                </div>

                <Button
                  onClick={resizeImage}
                  disabled={status === "processing" || width <= 0 || height <= 0}
                  className="w-full"
                  size="lg"
                >
                  Resize Image
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension={files[0]?.type === "image/png" ? ".png" : ".jpg"}
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

export default ResizeImage;
