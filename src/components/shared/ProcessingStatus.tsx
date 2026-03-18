import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export type Status = "ready" | "processing" | "done" | "error";

interface ProcessingStatusProps {
  status: Status;
  message?: string;
}

const ProcessingStatus = ({ status, message }: ProcessingStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "ready":
        return {
          icon: Clock,
          label: "Ready",
          className: "status-ready",
        };
      case "processing":
        return {
          icon: Loader2,
          label: "Processing...",
          className: "status-processing",
          animate: true,
        };
      case "done":
        return {
          icon: CheckCircle,
          label: "Done",
          className: "status-done",
        };
      case "error":
        return {
          icon: XCircle,
          label: "Error",
          className: "status-error",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className={`status-badge ${config.className}`}>
        <Icon
          className={`h-4 w-4 ${config.animate ? "animate-spin" : ""}`}
        />
        <span>{config.label}</span>
      </div>
      {message && (
        <p className="text-center text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

export default ProcessingStatus;
