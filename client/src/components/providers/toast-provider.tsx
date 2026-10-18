import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function ToastProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.alert = (message?: string) => {
        const text = typeof message === "string" ? message : "Notification";
        const normalized = text.toLowerCase();
        if (normalized.includes("fail") || normalized.includes("error")) {
          toast.error(text);
        } else if (normalized.includes("success") || normalized.includes("completed")) {
          toast.success(text);
        } else if (normalized.includes("pending") || normalized.includes("processing")) {
          toast.info(text);
        } else {
          toast.message(text);
        }
      };
    }
  }, []);

  return <Toaster position="top-right" richColors closeButton/>;
}


