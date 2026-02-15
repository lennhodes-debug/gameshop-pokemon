interface QueuedEmail {
  id: string;
  type: 'order-confirmation' | 'welcome' | 'abandoned-cart' | 'tracking' | 'generic';
  recipient: string;
  data: unknown;
  createdAt: string;
  attempts: number;
  nextRetryAt: string | null;
  lastError: string | null;
  status: 'pending' | 'sent' | 'failed';
}

class EmailQueue {
  private queue: Map<string, QueuedEmail> = new Map();
  private processing = false;
  private maxQueueSize = 1000;

  addToQueue(
    type: QueuedEmail['type'],
    recipient: string,
    data: unknown,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): string {
    if (this.queue.size >= this.maxQueueSize) {
      throw new Error('Email queue is full');
    }

    const id = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const email: QueuedEmail = {
      id,
      type,
      recipient,
      data,
      createdAt: new Date().toISOString(),
      attempts: 0,
      nextRetryAt: null,
      lastError: null,
      status: 'pending',
    };

    this.queue.set(id, email);
    return id;
  }

  getQueuedEmail(id: string): QueuedEmail | null {
    return this.queue.get(id) || null;
  }

  updateEmailStatus(
    id: string,
    status: QueuedEmail['status'],
    error?: string
  ): boolean {
    const email = this.queue.get(id);
    if (!email) return false;

    email.status = status;
    if (error) {
      email.lastError = error;
      email.attempts += 1;

      // Calculate next retry time: exponential backoff (1min, 5min, 15min)
      const delays = [60000, 300000, 900000];
      const delayIndex = Math.min(email.attempts - 1, delays.length - 1);
      const nextRetryTime = Date.now() + delays[delayIndex];
      email.nextRetryAt = new Date(nextRetryTime).toISOString();
    }

    this.queue.set(id, email);
    return true;
  }

  getPendingEmails(limit: number = 10): QueuedEmail[] {
    const now = Date.now();
    return Array.from(this.queue.values())
      .filter(
        (email) =>
          email.status === 'pending' &&
          (!email.nextRetryAt || new Date(email.nextRetryAt).getTime() <= now) &&
          email.attempts < 3
      )
      .slice(0, limit);
  }

  getQueueStats(): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    processing: boolean;
  } {
    const stats = {
      total: this.queue.size,
      pending: 0,
      sent: 0,
      failed: 0,
      processing: this.processing,
    };

    this.queue.forEach((email) => {
      if (email.status === 'pending') stats.pending++;
      else if (email.status === 'sent') stats.sent++;
      else if (email.status === 'failed') stats.failed++;
    });

    return stats;
  }

  removeFromQueue(id: string): boolean {
    return this.queue.delete(id);
  }

  clearQueue(): number {
    const size = this.queue.size;
    this.queue.clear();
    return size;
  }

  // Auto-cleanup: remove sent/failed emails older than 7 days
  cleanupOldEmails(olderThanDays: number = 7): number {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    this.queue.forEach((email, key) => {
      if ((email.status === 'sent' || email.status === 'failed') &&
          new Date(email.createdAt).getTime() < cutoffTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.queue.delete(key));
    return keysToDelete.length;
  }

  setProcessing(value: boolean): void {
    this.processing = value;
  }

  isProcessing(): boolean {
    return this.processing;
  }
}

// Export singleton instance
export const emailQueue = new EmailQueue();
