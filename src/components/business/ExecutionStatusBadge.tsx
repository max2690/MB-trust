"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Upload, Eye, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "gold" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: {
    label: "Ожидает выполнения",
    variant: "secondary",
    icon: Hourglass,
  },
  IN_PROGRESS: {
    label: "В процессе",
    variant: "default",
    icon: Clock,
  },
  UPLOADED: {
    label: "Скриншот загружен",
    variant: "secondary",
    icon: Upload,
  },
  PENDING_REVIEW: {
    label: "На проверке",
    variant: "gold",
    icon: Eye,
  },
  APPROVED: {
    label: "Одобрено",
    variant: "gold",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Отклонено",
    variant: "destructive",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Завершено",
    variant: "default",
    icon: CheckCircle,
  },
};

export function ExecutionStatusBadge({ status, className }: ExecutionStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: "secondary" as const,
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1", className)}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
