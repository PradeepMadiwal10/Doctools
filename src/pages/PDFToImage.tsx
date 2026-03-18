import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Images } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

type ImageFormat = "jpg" | "png";

const PDFToImage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [imageFormat, setImageFormat] = useState<ImageFormat>("jpg");
  const [pageCount, setPageCount] = useState<number>(0);
  const [singleImage, setSingleImage] = useState<boolean>(false);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
    setSingleImage(false);
    
    // Get page count
    const file = newFiles[0];
    file.arrayBuffer().then((buffer) => {
      pdfjsLib.getDocument({ data: buffer }).promise.then((pdf) => {
        setPageCount(pdf.numPages);
      });
    });
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
    setPageCount(0);
  }, []);

  const convertToImages = async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setMessage("Converting PDF pages to images...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const imageBlobs: { name: string; blob: Blob }[] = [];
      const scale = 2; // Higher quality

      for (let i = 1; i <= totalPages; i++) {
        setMessage(`Converting page ${i} of ${totalPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error("Canvas context not available");

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const mimeType = imageFormat === "jpg" ? "image/jpeg" : "image/png";
        const quality = imageFormat === "jpg" ? 0.92 : undefined;
        
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            mimeType,
            quality
          );
        });

        imageBlobs.push({
          name: `page_${i}.${imageFormat}`,
          blob,
        });
      }

      if (imageBlobs.length === 1) {
        setSingleImage(true);
        setResultBlob(imageBlobs[0].blob);
      } else {
        // Create ZIP file
        const zip = new JSZip();
        for (const img of imageBlobs) {
          zip.file(img.name, img.blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
        setSingleImage(false);
      }

      setStatus("done");
      setMessage(`${totalPages} page(s) converted to ${imageFormat.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setMessage("Failed to convert PDF. The file may be corrupted or protected.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      const ext = singleImage ? `.${imageFormat}` : ".zip";
      saveAs(resultBlob, `${filename}${ext}`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "pdf_images";
    return files[0].name.replace(/\.pdf$/i, "") + "_images";
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="PDF to Image"
          description="Convert PDF pages to JPG or PNG images"
          icon={Images}
          iconColorClass="bg-tool-pdf-image"
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
                {pageCount > 0 && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    This PDF has <span className="font-medium text-foreground">{pageCount} page(s)</span>.
                    {pageCount > 1 && " Images will be downloaded as a ZIP file."}
                  </p>
                )}

                <div className="mb-6 space-y-3">
                  <Label className="text-sm font-medium">Image Format</Label>
                  <RadioGroup
                    value={imageFormat}
                    onValueChange={(value) => setImageFormat(value as ImageFormat)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jpg" id="format-jpg" />
                      <Label htmlFor="format-jpg" className="cursor-pointer">JPG (smaller size)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="png" id="format-png" />
                      <Label htmlFor="format-png" className="cursor-pointer">PNG (better quality)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={convertToImages}
                  disabled={status === "processing"}
                  className="w-full"
                  size="lg"
                >
                  Convert to Images
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension={singleImage ? `.${imageFormat}` : ".zip"}
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

export default PDFToImage;
