import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactFormProps {
  /**
   * Callback when form is submitted
   */
  onSubmit?: (data: ContactFormData) => Promise<void>;
  /**
   * Show company field
   * @default true
   */
  showCompany?: boolean;
  /**
   * Show message field
   * @default true
   */
  showMessage?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message?: string;
}

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  onSubmit,
  showCompany = true,
  showMessage = true,
}: ContactFormProps) {
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setFormState("submitting");

    const formData = new FormData(e.currentTarget);
    const data: ContactFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    // Validation
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    if (data.email && !data.email.includes("@"))
      newErrors.email = "Invalid email address";
    if (!data.subject.trim()) newErrors.subject = "Subject is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormState("idle");
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setFormState("success");
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setFormState("error");
    }
  };

  return (
    <Card variant="glass" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium flex items-center gap-2"
          >
            Full Name
            <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={cn(
              "w-full px-4 py-2 rounded-lg border transition-colors",
              "bg-background/50 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
              errors.name
                ? "border-destructive"
                : "border-border hover:border-primary-500/50"
            )}
            placeholder="John Smith"
            disabled={formState === "submitting"}/>
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3"/>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium flex items-center gap-2"
          >
            Email Address
            <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={cn(
              "w-full px-4 py-2 rounded-lg border transition-colors",
              "bg-background/50 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
              errors.email
                ? "border-destructive"
                : "border-border hover:border-primary-500/50"
            )}
            placeholder="john@company.com"
            disabled={formState === "submitting"}/>
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3"/>
              {errors.email}
            </p>
          )}
        </div>

        {/* Company */}
        {showCompany && (
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className={cn(
                "w-full px-4 py-2 rounded-lg border transition-colors",
                "bg-background/50 backdrop-blur-sm",
                "border-border hover:border-primary-500/50",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              )}
              placeholder="Acme Inc."
              disabled={formState === "submitting"}/>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="text-sm font-medium flex items-center gap-2"
          >
            Subject
            <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className={cn(
              "w-full px-4 py-2 rounded-lg border transition-colors",
              "bg-background/50 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
              errors.subject
                ? "border-destructive"
                : "border-border hover:border-primary-500/50"
            )}
            placeholder="How can we help?"
            disabled={formState === "submitting"}/>
          {errors.subject && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3"/>
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message */}
        {showMessage && (
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={cn(
                "w-full px-4 py-2 rounded-lg border transition-colors resize-none",
                "bg-background/50 backdrop-blur-sm",
                "border-border hover:border-primary-500/50",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              )}
              placeholder="Tell us more about your needs..."
              disabled={formState === "submitting"}/>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full gap-2"
          disabled={formState === "submitting"}
        >
          {formState === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin"/>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send message</span>
              <Send className="h-4 w-4"/>
            </>
          )}
        </Button>

        {/* Success/Error Messages */}
        {formState === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-start gap-3"
          >
            <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="font-medium text-primary-600">Message sent!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll get back to you within 24 hours.
              </p>
            </div>
          </motion.div>
        )}

        {formState === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"/>
            <div>
              <p className="font-medium text-destructive">
                Something went wrong
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please try again or email us directly at support@boundingcurve.com
              </p>
            </div>
          </motion.div>
        )}

        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground text-center">
          By submitting this form, you agree to our privacy policy. We'll never
          share your information.
        </p>
      </form>
    </Card>
  );
}

