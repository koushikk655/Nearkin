import { Expo, type ExpoPushMessage } from 'expo-server-sdk';
import { logger } from '../../utils/logger.js';
import type { PushMessage, PushProvider, PushSendResult } from '../ports.js';

/**
 * Expo Push Service adapter (free). Filters invalid tokens, chunks the batch,
 * and maps Expo tickets to a provider-neutral result shape.
 */
export class ExpoPushAdapter implements PushProvider {
  readonly name = 'expo';
  private readonly expo = new Expo();

  async send(payloads: PushMessage[]): Promise<PushSendResult[]> {
    const messages: ExpoPushMessage[] = payloads
      .filter((p) => Expo.isExpoPushToken(p.to))
      .map((p) => ({
        to: p.to,
        sound: 'default',
        title: p.title,
        body: p.body,
        data: p.data ?? {},
        priority: 'high',
      }));

    if (messages.length === 0) return [];

    const chunks = this.expo.chunkPushNotifications(messages);
    const results: PushSendResult[] = [];

    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'ok') {
            results.push({ status: 'ok', id: ticket.id });
          } else {
            results.push({ status: 'error', error: ticket.message });
          }
        }
      } catch (err) {
        logger.error({ err }, 'Failed to send Expo push notification batch');
      }
    }

    return results;
  }
}
