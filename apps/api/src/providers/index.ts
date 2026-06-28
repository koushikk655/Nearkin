/**
 * Provider composition root.
 *
 * Reads the *_PROVIDER env vars and wires exactly one concrete adapter per
 * port. This is the ONLY module that knows which concrete provider is active;
 * business logic imports `providers` and depends only on the port interfaces.
 *
 * To migrate (e.g. Cloudinary → AWS S3): implement `S3StorageAdapter`, add
 * 's3' handling in `selectStorage()`, and set `STORAGE_PROVIDER=s3`. No
 * service / use-case changes are required.
 */
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { CloudinaryStorageAdapter } from './adapters/cloudinary.storage.adapter.js';
import { ExpoPushAdapter } from './adapters/expo.push.adapter.js';
import { FirebaseOtpAuthAdapter } from './adapters/firebase.otp-auth.adapter.js';
import { GoogleMapsGeoAdapter } from './adapters/google-maps.geo.adapter.js';
import { RazorpayPaymentAdapter } from './adapters/razorpay.payment.adapter.js';
import type {
  GeoProvider,
  OtpAuthProvider,
  PaymentProvider,
  PushProvider,
  StorageProvider,
} from './ports.js';

function notImplemented(varName: string, value: string): never {
  throw new Error(
    `${varName}=${value} is not yet implemented. Add the adapter under src/providers/adapters and wire it in src/providers/index.ts.`,
  );
}

function selectStorage(): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case 'cloudinary':
      return new CloudinaryStorageAdapter();
    case 's3':
      return notImplemented('STORAGE_PROVIDER', env.STORAGE_PROVIDER);
    default:
      return notImplemented('STORAGE_PROVIDER', env.STORAGE_PROVIDER);
  }
}

function selectOtpAuth(): OtpAuthProvider {
  switch (env.OTP_PROVIDER) {
    case 'firebase':
      return new FirebaseOtpAuthAdapter();
    default:
      return notImplemented('OTP_PROVIDER', env.OTP_PROVIDER);
  }
}

function selectPush(): PushProvider {
  switch (env.PUSH_PROVIDER) {
    case 'expo':
      return new ExpoPushAdapter();
    case 'fcm':
      return notImplemented('PUSH_PROVIDER', env.PUSH_PROVIDER);
    default:
      return notImplemented('PUSH_PROVIDER', env.PUSH_PROVIDER);
  }
}

function selectPayment(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case 'razorpay':
      return new RazorpayPaymentAdapter();
    default:
      return notImplemented('PAYMENT_PROVIDER', env.PAYMENT_PROVIDER);
  }
}

function selectGeo(): GeoProvider {
  switch (env.GEO_PROVIDER) {
    case 'google':
      return new GoogleMapsGeoAdapter();
    default:
      return notImplemented('GEO_PROVIDER', env.GEO_PROVIDER);
  }
}

export interface Providers {
  readonly storage: StorageProvider;
  readonly otpAuth: OtpAuthProvider;
  readonly push: PushProvider;
  readonly payment: PaymentProvider;
  readonly geo: GeoProvider;
}

/** Singleton registry of active provider adapters. */
export const providers: Providers = {
  storage: selectStorage(),
  otpAuth: selectOtpAuth(),
  push: selectPush(),
  payment: selectPayment(),
  geo: selectGeo(),
};

/** One-line boot log of which adapters are active and configured. */
export function logActiveProviders(): void {
  logger.info(
    {
      storage: providers.storage.name,
      otpAuth: providers.otpAuth.name,
      push: providers.push.name,
      payment: providers.payment.name,
      geo: providers.geo.name,
      configured: {
        storage: providers.storage.isConfigured(),
        otpAuth: providers.otpAuth.isConfigured(),
        payment: providers.payment.isConfigured(),
        geo: providers.geo.isConfigured(),
      },
    },
    'Provider adapters wired',
  );
}
