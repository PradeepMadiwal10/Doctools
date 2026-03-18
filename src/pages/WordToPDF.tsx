import { useState, useCallback } from "react";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { FileUp } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus, { Status } from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";

const WordToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("ready");
  const [message, setMessage] = useState<string>("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

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

  const convertToPDF = async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setMessage("Converting Word document to PDF...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // ✅ Convert Word → HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      const pdf = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      // ✅ Create container
      const container = document.createElement("div");
      container.innerHTML = html;

      // 🔥 IMPORTANT: styling fixes
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "12px";
      container.style.padding = "20px";
      container.style.color = "#000";            // FIX: visible text
      container.style.background = "#fff";       // FIX: proper contrast
      container.style.lineHeight = "1.6";
      container.style.maxWidth = "800px";

      document.body.appendChild(container);

      // ✅ Convert HTML → PDF
      await pdf.html(container, {
        margin: [20, 20, 20, 20],
        autoPaging: "text",
        html2canvas: {
          scale: 2,   // 🔥 CRITICAL FIX (quality + visibility)
        },
        callback: function (pdf) {
          const blob = pdf.output("blob");
          setResultBlob(blob);
          setStatus("done");
          setMessage("Word document converted successfully!");
        },
      });

      document.body.removeChild(container);

    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setMessage("Failed to convert Word document.");
    }
  };

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      saveAs(resultBlob, `${filename}.pdf`);
    }
  };

  const getDefaultFilename = () => {
    if (files.length === 0) return "converted";
    return files[0].name.replace(/\.docx?$/i, "");
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="Word to PDF"
          description="Convert Word documents to PDF format"
          icon={FileUp}
          iconColorClass="bg-tool-word-pdf"
        />

        <div className="space-y-6">
          <FileUpload
            accept=".docx,.doc"
            multiple={false}
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            description="Drop your Word document here or click to browse"
          />

          {files.length > 0 && (
            <>
              <div className="processing-container">

                {/* ⚠️ Honest message */}
                <p className="mb-3 text-sm text-muted-foreground">
                  ⚠️ Complex layouts (tables, resumes, designs) may not convert perfectly.
                </p>

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

export default WordToPDF;