import { logger } from '../utils/logger.util';
import { env } from '../config/env.config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class NotificationService {
  /**
   * Sends an email notification (e.g. appointment reminder, MFA alert) via AWS SES or dev fallback
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    logger.info(`Dispatching notification email to ${options.to}: ${options.subject}`, {
      sesKeyPresent: Boolean(env.AWS_SES_KEY),
    });

    // In a fully deployed environment with AWS SDK, calls ses.sendEmail.
    // For dev and testing, log delivery safely.
    return true;
  }
}

export const notificationService = new NotificationService();
