import { Link } from "react-router-dom";
import { Shield, Zap, Lock, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="section-container py-12">
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">100% Private</h4>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                All files are processed locally in your browser. Nothing is uploaded to any server.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Fast Processing</h4>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Powered by modern browser technologies for quick and efficient file processing.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Secure & Free</h4>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                No registration required. Your documents never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 py-8 border-t border-border">
          <div>
            <h5 className="font-semibold text-foreground mb-3">PDF Tools</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/compress-pdf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link to="/merge-pdf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/split-pdf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Split PDF
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-3">Convert PDF</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/pdf-to-word" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link to="/pdf-to-image" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  PDF to Image
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-3">Convert to PDF</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/word-to-pdf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link to="/image-to-pdf" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Image to PDF
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">DocTools</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free online document tools. Process your files safely and privately.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 text-center space-y-3">

  <div className="flex items-center justify-center gap-4 text-sm">
    <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
      Privacy Policy
    </Link>
    <span className="text-muted-foreground">•</span>
    <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
      Terms of Service
    </Link>
    <span className="text-muted-foreground">•</span>
    <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
      Contact
    </Link>
  </div>

  <p className="text-sm text-muted-foreground">
    © {new Date().getFullYear()} DocTools. All document processing happens in your browser.
  </p>

</div>
      </div>
    </footer>
  );
};

export default Footer;
