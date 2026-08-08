export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  includedMinutes: number;
  price: number; // السعر بالدولار
  currency: number;
}

export interface PlansApiResponse {
  value: SubscriptionPlan[];
  isSuccess: boolean;
  isFailure: boolean;
  error?: {
    code: string;
    description: string;
    statusCode: number | null;
  };
}
