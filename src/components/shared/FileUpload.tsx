import { useCallback, useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  description?: string;
}

const FileUpload = ({
  accept,
  multiple = false,
  onFilesSelected,
  files,
  onRemoveFile,
  maxFiles = 20,
  description = "Drop files here or click to browse",
}: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.slice(0, maxFiles - files.length);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [files.length, maxFiles, onFilesSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.slice(0, maxFiles - files.length);
        if (validFiles.length > 0) {
          onFilesSelected(validFiles);
        }
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [files.length, maxFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone ${isDragOver ? "dragover" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">{description}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {accept.split(",").join(", ")}
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3 animate-fade-in"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
