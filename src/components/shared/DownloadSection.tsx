import { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DownloadSectionProps {
  defaultFilename: string;
  extension: string;
  onDownload: (filename: string) => void;
  fileSize?: string;
  disabled?: boolean;
}

const DownloadSection = ({
  defaultFilename,
  extension,
  onDownload,
  fileSize,
  disabled = false,
}: DownloadSectionProps) => {
  const [filename, setFilename] = useState(defaultFilename);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    onDownload(filename);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-xl bg-success/5 p-6 border border-success/20 animate-fade-in">
      <div className="flex items-center gap-2 text-success">
        <Check className="h-5 w-5" />
        <span className="font-medium">Ready to download</span>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="filename" className="text-sm text-muted-foreground">
          Filename
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="pr-16"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {extension}
            </span>
          </div>
        </div>
      </div>

      {fileSize && (
        <p className="text-sm text-muted-foreground">
          File size: <span className="font-medium text-foreground">{fileSize}</span>
        </p>
      )}

      <Button
        onClick={handleDownload}
        disabled={disabled || !filename.trim()}
        className="w-full gap-2"
        size="lg"
      >
        {downloaded ? (
          <>
            <Check className="h-5 w-5" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download
          </>
        )}
      </Button>
    </div>
  );
};

export default DownloadSection;
