import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env, hasRazorpayConfig } from '../../config/env.js';
import { ConfigError, PaymentError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import type {
  CreatePaymentOrderInput,
  PaymentOrder,
  PaymentProvider,
  PaymentSignatureInput,
} from '../ports.js';

/**
 * Razorpay adapter (free test mode available). UPI/cards. The client is
 * initialised lazily so the server still boots without Razorpay credentials.
 */
export class RazorpayPaymentAdapter implements PaymentProvider {
  readonly name = 'razorpay';
  private client: Razorpay | null = null;

  isConfigured(): boolean {
    return hasRazorpayConfig;
  }

  private getClient(): Razorpay {
    if (!hasRazorpayConfig) {
      throw new ConfigError(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET. See SETUP_THIRD_PARTY.md.',
      );
    }
    if (!this.client) {
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID!,
        key_secret: env.RAZORPAY_KEY_SECRET!,
      });
      logger.info('Razorpay client initialized');
    }
    return this.client;
  }

  publicKeyId(): string {
    return env.RAZORPAY_KEY_ID ?? '';
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const rzp = this.getClient();
    try {
      const order = await rzp.orders.create({
        amount: input.amountPaise,
        currency: 'INR',
        receipt: input.receipt,
        payment_capture: true,
        notes: input.notes ?? {},
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt ?? '',
      };
    } catch (err) {
      logger.error({ err }, 'Failed to create Razorpay order');
      throw new PaymentError('Failed to create Razorpay order');
    }
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      throw new ConfigError('RAZORPAY_WEBHOOK_SECRET not configured');
    }
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signatureHeader, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  verifyPaymentSignature(input: PaymentSignatureInput): boolean {
    if (!env.RAZORPAY_KEY_SECRET) {
      throw new ConfigError('RAZORPAY_KEY_SECRET not configured');
    }
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(input.signature, 'utf8'),
      );
    } catch {
      return false;
    }
  }
}
