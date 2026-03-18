import Layout from "@/components/layout/Layout";
import { Mail, Phone, User } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="section-container py-16 sm:py-20">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">Contact</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Have questions, feedback, or suggestions? Feel free to reach out.
        </p>

        <div className="max-w-md space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pradeep Madiwal</h3>
              <p className="text-sm text-muted-foreground">Aspiring Software Engineer</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email</h3>
              <a href="mailto:madiwalpradeep1@gmail.com" className="text-sm text-primary hover:underline">
                madiwalpradeep1@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Phone</h3>
              <a href="tel:+917975683394" className="text-sm text-primary hover:underline">
                +91 7975683394
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
