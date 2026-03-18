import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CompressPDF from "./pages/CompressPDF";
import PDFToWord from "./pages/PDFToWord";
import WordToPDF from "./pages/WordToPDF";
import ImageToPDF from "./pages/ImageToPDF";
import PDFToImage from "./pages/PDFToImage";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import ScrollToTop from "./ScrollToTop";
import RotatePDF from "./pages/RotatePDF";
import ReorderPDF from "./pages/ReorderPDF";
import AddPageNumbers from "./pages/AddPageNumbers";
import ImageCompressor from "./pages/ImageCompressor";
import ImageConverter from "./pages/ImageConverter";
import ResizeImage from "./pages/ResizeImage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
  <ScrollToTop />

  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/compress-pdf" element={<CompressPDF />} />
    <Route path="/pdf-to-word" element={<PDFToWord />} />
    <Route path="/word-to-pdf" element={<WordToPDF />} />
    <Route path="/image-to-pdf" element={<ImageToPDF />} />
    <Route path="/pdf-to-image" element={<PDFToImage />} />
    <Route path="/merge-pdf" element={<MergePDF />} />
    <Route path="/split-pdf" element={<SplitPDF />} />
    <Route path="/rotate-pdf" element={<RotatePDF />} />
    <Route path="/reorder-pdf" element={<ReorderPDF />} />
    <Route path="/add-page-numbers" element={<AddPageNumbers />} />
    <Route path="/image-compressor" element={<ImageCompressor />} />
    <Route path="/image-converter" element={<ImageConverter />} />
    <Route path="/resize-image" element={<ResizeImage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
