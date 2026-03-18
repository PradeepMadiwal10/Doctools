import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="section-container py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-8">Privacy Policy</h1>
        <div className="max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">1. Overview</h2>
          <p>
            DocTools is committed to protecting your privacy. This Privacy Policy explains how we handle your data when you use our document processing tools.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">2. Data Processing</h2>
          <p>
            All file processing on DocTools happens <strong className="text-foreground">entirely in your browser</strong>. Your files are never uploaded to any server. We do not collect, store, or have access to any documents you process using our tools.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">3. Information We Collect</h2>
          <p>
            We do not require registration or sign-up. We may collect limited non-personal information such as browser type, device information, and basic usage data to improve our services. No personally identifiable information is collected.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">4. Cookies</h2>
          <p>
            DocTools may use cookies to enhance user experience and for basic site functionality. We may also use third-party services such as Google AdSense, which may use cookies to serve relevant advertisements based on your visit to this and other websites.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">5. Third-Party Services</h2>
          <p>
            We may use trusted third-party services such as Google Analytics and Google AdSense to analyze traffic and display advertisements. These services may use cookies and similar technologies to improve user experience. However, your files are never uploaded or shared, and remain fully private on your device.
          </p>

          <h2 className="text-xl font-semibold text-foreground pt-4">6. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:madiwalpradeep1@gmail.com" className="text-primary hover:underline">
              madiwalpradeep1@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;