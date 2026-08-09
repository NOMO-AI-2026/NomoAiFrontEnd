export interface PaymentMethod {
  id: string;
  name: string;
  paymentMethodType: number;
}

export interface PaymentMethodsApiResponse {
  value: PaymentMethod[];
  isSuccess: boolean;
  isFailure: boolean;
  error?: {
    code: string;
    description: string;
  };
}

export interface CreateQuickLinkPayload {
  paymentMethodId: string;
  planId: number;
  idempotency: string;
  priceInEGP: number;
}

export interface QuickLinkResult {
  paymentId: number;
  clientUrl: string;
  shortUrl: string;
  referenceId: string;
  expiresAt: string;
  isReplay: boolean;
}

export interface QuickLinkApiResponse {
  isSuccess: boolean;
  isFailure: boolean;
  value?: QuickLinkResult;
  error?: {
    code: string;
    description: string;
  };
}
