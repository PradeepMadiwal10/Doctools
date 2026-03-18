import { useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { Status } from "@/components/shared/ProcessingStatus";

// Configure PDF.js worker (module side-effect)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
  fontName: string;
}

const extractTextWithSpacing = (textContent: any): string => {
  const items = textContent.items as TextItem[];
  if (items.length === 0) return "";

  // Group items by lines based on Y position
  const lineHeight = 12; // Approximate line height threshold
  const lines: Map<number, TextItem[]> = new Map();

  for (const item of items) {
    if (!item.str || item.str.trim() === "") continue;

    const y = Math.round(item.transform[5] / lineHeight) * lineHeight;

    if (!lines.has(y)) {
      lines.set(y, []);
    }
    lines.get(y)!.push(item);
  }

  // Sort lines by Y (descending - PDF coordinates go bottom to top)
  const sortedLineKeys = Array.from(lines.keys()).sort((a, b) => b - a);

  const resultLines: string[] = [];
  let prevLineY: number | null = null;

  for (const lineY of sortedLineKeys) {
    const lineItems = lines.get(lineY)!;

    // Sort items within line by X position (left to right)
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);

    // Check if there's a large gap from previous line (paragraph break)
    if (prevLineY !== null) {
      const gap = prevLineY - lineY;
      if (gap > lineHeight * 1.8) {
        // Large gap indicates paragraph break
        resultLines.push("");
      }
    }

    // Build line text with proper word spacing
    let lineText = "";
    let lastEndX = 0;

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const startX = item.transform[4];
      const itemWidth = item.width || 0;

      if (i > 0) {
        const gap = startX - lastEndX;
        // Calculate average character width for this item
        const avgCharWidth = item.str.length > 0 ? itemWidth / item.str.length : 5;

        // If gap is larger than ~0.3 of average char width, add space
        if (gap > avgCharWidth * 0.3) {
          lineText += " ";
        }
      }

      lineText += item.str;
      lastEndX = startX + itemWidth;
    }

    resultLines.push(lineText.trim());
    prevLineY = lineY;
  }

  // Join lines - consecutive non-empty lines likely belong to same paragraph
  let result = "";
  let inParagraph = false;

  for (let i = 0; i < resultLines.length; i++) {
    const line = resultLines[i];

    if (line === "") {
      // Empty line = paragraph break
      if (inParagraph) {
        result += "\n\n";
        inParagraph = false;
      }
    } else {
      if (inParagraph) {
        // Continue paragraph - add space between lines
        result += " ";
      }
      result += line;
      inParagraph = true;
    }
  }

  return result.trim();
};

export const usePdfToWord = () => {
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

  const convertToWord = useCallback(async () => {
    if (files.length === 0) return;

    setStatus("processing");
    setMessage("Extracting text from PDF...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = extractTextWithSpacing(textContent);
        fullText += pageText + "\n\n--- Page " + i + " ---\n\n";
      }

      // Clean up the text - remove page markers at the end
      fullText = fullText.replace(/\n\n--- Page \d+ ---\n\n$/, "");

      // Normalize spacing
      fullText = fullText.replace(/\n{4,}/g, "\n\n");
      fullText = fullText.replace(/  +/g, " ");

      const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Converted Document</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 2.54cm 2.54cm 2.54cm 2.54cm;
    }
    body { 
      font-family: 'Calibri', 'Arial', sans-serif; 
      font-size: 11pt; 
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    p { 
      margin: 0 0 12pt 0; 
      text-align: left;
      word-spacing: normal;
      letter-spacing: normal;
    }
    .page-break {
      page-break-after: always;
      margin: 20pt 0;
      padding: 10pt 0;
      border-bottom: 1px solid #ccc;
      text-align: center;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${fullText
    .split(/\n\n--- Page \d+ ---\n\n/)
    .map((pageContent, index, arr) => {
      const paragraphs = pageContent
        .split("\n\n")
        .filter((p) => p.trim())
        .map((para) => {
          const escaped = para
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
          return `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
        })
        .join("\n");

      if (index < arr.length - 1 && arr.length > 1) {
        return paragraphs + "\n<div class=\"page-break\">Page Break</div>";
      }
      return paragraphs;
    })
    .join("\n")}
</body>
</html>
      `.trim();

      const blob = new Blob([htmlContent], {
        type: "application/vnd.ms-word",
      });

      setResultBlob(blob);
      setStatus("done");
      setMessage(
        "PDF converted successfully! The document preserves text formatting and spacing.",
      );
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus("error");
      setMessage("Failed to convert PDF. The file may be corrupted or protected.");
    }
  }, [files]);

  const getDefaultFilename = useCallback(() => {
    if (files.length === 0) return "converted";
    return files[0].name.replace(/\.pdf$/i, "");
  }, [files]);

  return {
    files,
    status,
    message,
    resultBlob,
    handleFilesSelected,
    handleRemoveFile,
    convertToWord,
    getDefaultFilename,
  };
};
