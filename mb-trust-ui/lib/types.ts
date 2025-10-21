export interface Order {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  budget: number;
  reward: number;
  processedImageUrl: string;
  qrCodeUrl: string;
  deadline: string;
  status: string;
  customer?: {
    name: string;
    level: string;
  };
}

export interface Execution {
  id: string;
  orderId: string;
  executorId: string;
  status: string;
  reward: number;
  screenshotUrl?: string;
  notes?: string;
  createdAt: string;
  order?: {
    title: string;
    description: string;
    reward: number;
    status: string;
  };
  executor?: {
    name: string;
    level: string;
    rating: number;
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'CUSTOMER' | 'EXECUTOR' | 'ADMIN';
  level: 'NOVICE' | 'VERIFIED' | 'REFERRAL' | 'TOP';
  balance: number;
  isVerified: boolean;
  isBlocked: boolean;
}

