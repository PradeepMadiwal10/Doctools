import { useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { Hash } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";

const AddPageNumbers = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");

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

  const addPageNumbers = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setMessage("Adding page numbers...");

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const fontSize = 12;
      const margin = 40;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const text = `${index + 1}`;
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        let x: number, y: number;

        switch (position) {
          case "top-left":
            x = margin;
            y = height - margin;
            break;
          case "top-right":
            x = width - margin - textWidth;
            y = height - margin;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "bottom-right":
            x = width - margin - textWidth;
            y = margin;
            break;
          case "bottom-center":
          default:
            x = (width - textWidth) / 2;
            y = margin;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setStatus("done");
      setMessage(`Page numbers added to ${pages.length} page(s)!`);
    } catch (error) {
      console.error("Page number error:", error);
      setStatus("error");
      setMessage("Failed to add page numbers.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) saveAs(resultBlob, `${filename}.pdf`);
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "numbered";
    return files[0].name.replace(/\.pdf$/i, "") + "_numbered";
  };

  const positions: { value: Position; label: string }[] = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "bottom-center", label: "Bottom Center" },
  ];

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Add Page Numbers"
          description="Add page numbering to all pages of your PDF"
          icon={Hash}
          iconColorClass="bg-tool-pagenumber"
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
                <div className="space-y-3 mb-6">
                  <Label className="text-sm font-medium">Number Position</Label>
                  <RadioGroup
                    value={position}
                    onValueChange={(v) => setPosition(v as Position)}
                    className="flex flex-wrap gap-4"
                  >
                    {positions.map((pos) => (
                      <div key={pos.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={pos.value} id={`pos-${pos.value}`} />
                        <Label htmlFor={`pos-${pos.value}`} className="cursor-pointer">
                          {pos.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Visual position preview */}
                <div className="mx-auto mb-6 w-32 h-40 border-2 border-dashed border-border rounded-lg relative bg-muted/30">
                  <div
                    className={`absolute w-4 h-4 rounded-full bg-primary transition-all ${
                      position === "top-left" ? "top-2 left-2" :
                      position === "top-right" ? "top-2 right-2" :
                      position === "bottom-left" ? "bottom-2 left-2" :
                      position === "bottom-right" ? "bottom-2 right-2" :
                      "bottom-2 left-1/2 -translate-x-1/2"
                    }`}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    Preview
                  </span>
                </div>

                <Button onClick={addPageNumbers} disabled={status === "processing"} className="w-full" size="lg">
                  Add Page Numbers
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

export default AddPageNumbers;
