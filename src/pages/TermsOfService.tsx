import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="section-container py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-8">Terms of Service</h1>
        <div className="max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using DocTools, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. Description of Service</h2>
          <p>
            DocTools provides free, browser-based document processing tools including PDF compression, conversion, merging, and splitting. All processing occurs locally on your device.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Use of Service</h2>
          <p>
            You may use DocTools for personal and commercial purposes. You agree not to misuse the service or attempt to interfere with its operation.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Disclaimer of Warranties</h2>
          <p>
            DocTools is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or that the results will meet your specific requirements.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Limitation of Liability</h2>
          <p>
            In no event shall DocTools or its creator be liable for any damages arising from the use or inability to use the service.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">7. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:madiwalpradeep1@gmail.com" className="text-primary hover:underline">
              madiwalpradeep1@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
