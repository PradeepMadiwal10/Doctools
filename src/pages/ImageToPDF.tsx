import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Image as ImageIcon, GripVertical } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";

interface ImageFile {
  file: File;
  preview: string;
}

const ImageToPDF = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...imageFiles]);
    setStatus("ready");
    setMessage("");
    setResultBlob(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setResultBlob(null);
    setStatus("ready");
    setMessage("");
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setImages((prev) => {
      const newImages = [...prev];
      const draggedItem = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedItem);
      return newImages;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const convertToPDF = async () => {
    if (images.length === 0) return;

    setStatus("processing");
    setMessage("Converting images to PDF...");

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = await loadImage(images[i].file);
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Scale down if image is taller than page
        let finalWidth = imgWidth;
        let finalHeight = imgHeight;
        
        if (imgHeight > pageHeight - margin * 2) {
          finalHeight = pageHeight - margin * 2;
          finalWidth = (img.width * finalHeight) / img.height;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

        pdf.addImage(dataUrl, "JPEG", x, y, finalWidth, finalHeight);
        URL.revokeObjectURL(img.src);
      }

      const blob = pdf.output("blob");
      setResultBlob(blob);
      setStatus("done");
      setMessage(`${images.length} image(s) converted to PDF successfully!`);
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setMessage("Failed to convert images. Please try different image files.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      saveAs(resultBlob, `${filename}.pdf`);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Image to PDF"
          description="Convert JPG, PNG images to PDF document"
          icon={ImageIcon}
          iconColorClass="bg-tool-image-pdf"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".jpg,.jpeg,.png"
            multiple={true}
            files={images.map((i) => i.file)}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            maxFiles={20}
            description="Drop images here or click to browse"
          />

          {images.length > 0 && (
            <>
              <div className="processing-container">
                <p className="mb-4 text-sm text-muted-foreground">
                  Drag images to reorder them in the PDF
                </p>

                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={image.preview}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative cursor-move overflow-hidden rounded-lg border-2 transition-all ${
                        draggedIndex === index
                          ? "border-primary opacity-50"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.preview}
                        alt={`Image ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="absolute left-1 top-1 rounded bg-foreground/80 px-1.5 py-0.5 text-xs text-background">
                        {index + 1}
                      </div>
                      <div className="absolute right-1 top-1">
                        <GripVertical className="h-4 w-4 text-background drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={convertToPDF}
                  disabled={status === "processing"}
                  className="w-full"
                  size="lg"
                >
                  Convert to PDF
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename="images"
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

export default ImageToPDF;
