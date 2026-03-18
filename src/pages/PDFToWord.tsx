import { FileText } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ToolHeader from "@/components/shared/ToolHeader";
import FileUpload from "@/components/shared/FileUpload";
import ProcessingStatus from "@/components/shared/ProcessingStatus";
import DownloadSection from "@/components/shared/DownloadSection";
import { Button } from "@/components/ui/button";
import { usePdfToWord } from "./pdf-to-word/usePdfToWord";

const PDFToWord = () => {
  const {
    files,
    status,
    message,
    resultBlob,
    handleFilesSelected,
    handleRemoveFile,
    convertToWord,
    getDefaultFilename,
  } = usePdfToWord();

  const handleDownload = (filename: string) => {
    if (resultBlob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(resultBlob);
      link.download = `${filename}.doc`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <ToolHeader
          title="PDF to Word"
          description="Convert PDF documents to editable Word files"
          icon={FileText}
          iconColorClass="bg-tool-pdf-word"
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
                <p className="mb-4 text-sm text-muted-foreground">
                  This tool extracts text from PDFs with proper spacing and formatting. 
                  Complex layouts with images or tables may need manual adjustment.
                </p>
                
                <Button
                  onClick={convertToWord}
                  disabled={status === "processing"}
                  className="w-full"
                  size="lg"
                >
                  Convert to Word
                </Button>

                <ProcessingStatus status={status} message={message} />
              </div>

              {status === "done" && resultBlob && (
                <DownloadSection
                  defaultFilename={getDefaultFilename()}
                  extension=".doc"
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

export default PDFToWord;
