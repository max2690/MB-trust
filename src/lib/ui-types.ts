export interface UserMini {
  id?: string;
  name?: string;
  level?: string;
}

export interface ExecutionUI {
  id: string;
  status: string;
  reward?: number;
  executor?: UserMini;
  createdAt?: string;
  screenshotUrl?: string;
}

export interface OrderUI {
  id: string;
  title: string;
  description?: string;
  targetAudience?: string | null;
  reward?: number; // per-execution
  totalReward?: number | null; // total paid
  processedImageUrl?: string | null;
  qrCodeUrl?: string | null;
  deadline?: string | null;
  status?: string;
  createdAt?: string;
  executions?: ExecutionUI[];
  customer?: UserMini;
  region?: string;
  socialNetwork?: string;
  quantity?: number;
}
