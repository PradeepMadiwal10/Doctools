import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import "./home/home.styles.css";
import { 
  FileDown, 
  FileUp, 
  Image, 
  Images, 
  Merge, 
  Split, 
  FileText,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
  RotateCw,
  ArrowUpDown,
  Hash,
  Minimize2,
  RefreshCw,
  Maximize2,
} from "lucide-react";

const tools = [
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    icon: FileDown,
    colorClass: "bg-tool-compress",
    path: "/compress-pdf",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents to editable Word files",
    icon: FileText,
    colorClass: "bg-tool-pdf-word",
    path: "/pdf-to-word",
  },
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents to PDF format",
    icon: FileUp,
    colorClass: "bg-tool-word-pdf",
    path: "/word-to-pdf",
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Convert JPG, PNG images to PDF document",
    icon: Image,
    colorClass: "bg-tool-image-pdf",
    path: "/image-to-pdf",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert PDF pages to JPG or PNG images",
    icon: Images,
    colorClass: "bg-tool-pdf-image",
    path: "/pdf-to-image",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    icon: Merge,
    colorClass: "bg-tool-merge",
    path: "/merge-pdf",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract pages from PDF into separate files",
    icon: Split,
    colorClass: "bg-tool-split",
    path: "/split-pdf",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate PDF pages by 90°, 180°, or 270°",
    icon: RotateCw,
    colorClass: "bg-tool-rotate",
    path: "/rotate-pdf",
  },
  {
    id: "reorder-pdf",
    name: "Reorder PDF",
    description: "Drag and drop to rearrange PDF pages",
    icon: ArrowUpDown,
    colorClass: "bg-tool-reorder",
    path: "/reorder-pdf",
  },
  {
    id: "add-page-numbers",
    name: "Add Page Numbers",
    description: "Add page numbering to your PDF document",
    icon: Hash,
    colorClass: "bg-tool-pagenumber",
    path: "/add-page-numbers",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Reduce image file size with quality control",
    icon: Minimize2,
    colorClass: "bg-tool-imgcompress",
    path: "/image-compressor",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert between JPG, PNG, and WebP formats",
    icon: RefreshCw,
    colorClass: "bg-tool-imgconvert",
    path: "/image-converter",
  },
  {
    id: "resize-image",
    name: "Resize Image",
    description: "Resize images to exact dimensions",
    icon: Maximize2,
    colorClass: "bg-tool-imgresize",
    path: "/resize-image",
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Private & Secure",
    description: "Your files never leave your device. All processing happens locally in your browser.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No upload delays. Instant processing powered by modern browser technology.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Use on any device with a modern browser. No software installation required.",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="home-hero">
        {/* Background Pattern */}
        <div className="home-hero-pattern">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="section-container relative text-center">
          <div className="home-hero-badge">
            <CheckCircle2 className="h-4 w-4" />
            Free • No Sign-up • 100% Private
          </div>
          
          <h1 className="home-hero-title">
            Professional Document Tools
            <span className="home-hero-title-accent">Made Simple</span>
          </h1>
          
          <p className="home-hero-subtitle">
            Convert, compress, merge, and split your documents with ease. 
            All processing happens in your browser — your files never leave your device.
          </p>

          <div className="home-hero-ctas">
            <Link
              to="/compress-pdf"
              className="home-cta-primary"
            >
              <FileDown className="h-4 w-4" />
              Compress PDF
            </Link>
            <Link
              to="/merge-pdf"
              className="home-cta-secondary"
            >
              <Merge className="h-4 w-4" />
              Merge PDFs
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="home-tools">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="home-section-title">
              All Document Tools
            </h2>
            <p className="home-section-subtitle">
              Everything you need to work with PDFs and documents, right in your browser.
            </p>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="tool-card group"
                >
                  <div className={`tool-icon ${tool.colorClass} mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Use Tool →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="home-section-title">
              Why Choose DocTools?
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="home-feature-card"
                >
                  <div className="home-feature-icon">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="home-about">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="home-section-title">About DocTools</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">

  <p>
    <strong className="text-foreground">DocTools</strong> is a free, open-source collection of document utilities built entirely in the browser. We believe working with PDFs and documents should be simple, fast, and private.
  </p>

  <p>
    Unlike traditional online tools, DocTools processes everything locally on your device. Your files are <strong className="text-foreground">never uploaded to any server</strong> — all conversions, compressions, and merges happen right in your browser using modern web technologies.
  </p>

  <p>
    Whether you need to compress a large PDF, convert between formats, merge multiple files, or split pages — DocTools has you covered. No sign-ups, no subscriptions, no hidden limits.
  </p>

  {/* ✅ Subtle identity line */}
  <p className="text-sm text-muted-foreground pt-2">
    Built by <span className="font-medium text-foreground">Pradeep Madiwal</span>, an aspiring software engineer. 
    For inquiries, contact{" "}
    <a 
      href="mailto:madiwalpradeep10@gmail.com" 
      className="hover:text-foreground underline"
    >
      madiwalpradeep10@gmail.com
    </a>.
  </p>

</div>

          <div className="home-trust-row mt-12">
            <div className="home-trust-item">
              <CheckCircle2 className="h-5 w-5 text-success" />
              No file uploads to servers
            </div>
            <div className="home-trust-item">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Completely free to use
            </div>
            <div className="home-trust-item">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Works offline
            </div>
            <div className="home-trust-item">
              <CheckCircle2 className="h-5 w-5 text-success" />
              No registration required
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
