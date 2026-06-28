/**
 * Provider ports (hexagonal / ports-and-adapters architecture).
 *
 * Business logic (services / use-cases) depends ONLY on these interfaces —
 * never on a concrete SDK. Swapping a provider (Cloudinary → S3, Expo → FCM,
 * Render → ECS) is a config + adapter change, never a change to a use-case.
 *
 * Concrete adapters live in ./adapters and are wired by ./index.ts based on
 * the *_PROVIDER environment variables.
 */

/* ------------------------------ Storage ------------------------------ */

export interface SignedUploadParams {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
}

export interface StorageProvider {
  readonly name: string;
  /** True when the underlying provider has all required credentials. */
  isConfigured(): boolean;
  /**
   * Issue short-lived credentials so the client uploads bytes directly to the
   * storage provider (the file never transits our API server).
   */
  generateSignedUpload(folder: string): SignedUploadParams;
}

/* ---------------------------- OTP / Auth ----------------------------- */

export interface VerifiedPhone {
  phoneNumber: string;
}

export interface OtpAuthProvider {
  readonly name: string;
  isConfigured(): boolean;
  /**
   * Verify a client-supplied OTP / identity token and return the verified
   * phone number. Throws UnauthorizedError when invalid or missing the claim.
   */
  verifyOtpToken(token: string): Promise<VerifiedPhone>;
}

/* ------------------------------- Push -------------------------------- */

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface PushSendResult {
  status: 'ok' | 'error';
  id?: string;
  error?: string;
}

export interface PushProvider {
  readonly name: string;
  send(messages: PushMessage[]): Promise<PushSendResult[]>;
}

/* ------------------------------ Payment ------------------------------ */

export interface CreatePaymentOrderInput {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentSignatureInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentProvider {
  readonly name: string;
  isConfigured(): boolean;
  /** Public client key id, safe to hand to the mobile app. */
  publicKeyId(): string;
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  /** Verify a provider webhook against the raw (byte-exact) request body. */
  verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean;
  /** Verify the client-side success-callback signature. */
  verifyPaymentSignature(input: PaymentSignatureInput): boolean;
}

/* -------------------------------- Geo -------------------------------- */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoProvider {
  readonly name: string;
  isConfigured(): boolean;
  /** Forward geocode a free-text address. Returns null when not found. */
  geocode(address: string): Promise<GeoPoint | null>;
  /** Reverse geocode a coordinate to a formatted address. Null when not found. */
  reverseGeocode(point: GeoPoint): Promise<string | null>;
}
