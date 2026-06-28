import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';
import { env, hasFirebaseConfig } from '../../config/env.js';
import { ConfigError, UnauthorizedError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import type { OtpAuthProvider, VerifiedPhone } from '../ports.js';

/**
 * Firebase Phone-OTP adapter. The client completes the OTP flow with the
 * Firebase SDK and sends us the resulting ID token; we verify it server-side
 * and extract the verified phone number. The Admin SDK is initialised lazily
 * so the server still boots without Firebase credentials.
 */
export class FirebaseOtpAuthAdapter implements OtpAuthProvider {
  readonly name = 'firebase';
  private app: App | null = null;
  private auth: Auth | null = null;

  isConfigured(): boolean {
    return hasFirebaseConfig;
  }

  private init(): void {
    if (this.auth) return;
    if (!hasFirebaseConfig) {
      throw new ConfigError(
        'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env. See SETUP_THIRD_PARTY.md.',
      );
    }
    const existing = getApps()[0];
    this.app =
      existing ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID!,
          clientEmail: env.FIREBASE_CLIENT_EMAIL!,
          // Replace escaped newlines that come from .env files.
          privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    this.auth = getAuth(this.app);
    logger.info('Firebase Admin SDK initialized');
  }

  async verifyOtpToken(token: string): Promise<VerifiedPhone> {
    this.init();
    if (!this.auth) throw new ConfigError('Firebase Auth not initialized');
    try {
      const decoded = await this.auth.verifyIdToken(token, true);
      if (!decoded.phone_number) {
        throw new UnauthorizedError('Token has no phone_number claim');
      }
      return { phoneNumber: decoded.phone_number };
    } catch (err) {
      if (err instanceof UnauthorizedError || err instanceof ConfigError) throw err;
      logger.warn({ err }, 'Firebase ID token verification failed');
      throw new UnauthorizedError('Invalid Firebase ID token');
    }
  }
}
