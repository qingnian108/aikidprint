import cron from 'node-cron';
import pdfGenerator from './pdfGenerator.js';
import emailService from './emailService.js';

interface UserSubscription {
  userId: string;
  email: string;
  childName: string;
  age: string;
  theme: string;
  deliveryTime: string;
  timezone: string;
  isActive: boolean;
}

class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize weekly delivery cron job
   * Runs every Sunday at 8:00 AM (configurable per user)
   */
  initializeWeeklyDelivery() {
    // Run every Sunday at 8:00 AM
    const job = cron.schedule('0 8 * * 0', async () => {
      console.log('Running weekly delivery job...');
      await this.processWeeklyDeliveries();
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    this.jobs.set('weekly-delivery', job);
    console.log('✅ Weekly delivery cron job initialized');
  }

  /**
   * Process all active weekly deliveries
   */
  private async processWeeklyDeliveries() {
    try {
      // In production, fetch from database
      const activeSubscriptions = await this.getActiveSubscriptions();

      console.log(`Processing ${activeSubscriptions.length} weekly deliveries...`);

      for (const subscription of activeSubscriptions) {
        try {
          await this.deliverWeeklyPack(subscription);
          console.log(`✅ Delivered pack to ${subscription.email}`);
        } catch (error) {
          console.error(`❌ Failed to deliver to ${subscription.email}:`, error);
        }
      }

      console.log('Weekly delivery job completed');
    } catch (error) {
      console.error('Error in weekly delivery process:', error);
    }
  }

  /**
   * Deliver weekly pack to a single user
   */
  private async deliverWeeklyPack(subscription: UserSubscription) {
    const currentWeek = this.getCurrentWeekNumber();

    // Generate PDF
    await pdfGenerator.initialize();
    const pdfBuffer = await pdfGenerator.generateWeeklyPack({
      childName: subscription.childName,
      age: subscription.age,
      theme: subscription.theme,
      weekNumber: currentWeek,
      includePages: ['all']
    });
    await pdfGenerator.close();

    // Send email with PDF attachment
    await emailService.sendWeeklyPack({
      to: subscription.email,
      childName: subscription.childName,
      weekNumber: currentWeek,
      theme: subscription.theme,
      pdfBuffer
    });
  }

  /**
   * Get current week number of the year
   */
  private getCurrentWeekNumber(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

  /**
   * Fetch active subscriptions from database
   * In production, this would query Firestore/PostgreSQL
   */
  private async getActiveSubscriptions(): Promise<UserSubscription[]> {
    // Mock data - replace with actual database query
    return [
      {
        userId: 'user1',
        email: 'parent@example.com',
        childName: 'Emma',
        age: '4-5',
        theme: 'unicorn',
        deliveryTime: '08:00',
        timezone: 'America/New_York',
        isActive: true
      }
    ];
  }

  /**
   * Schedule a custom delivery for a specific user
   */
  scheduleCustomDelivery(userId: string, cronExpression: string, subscription: UserSubscription) {
    const jobId = `custom-${userId}`;

    // Remove existing job if any
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId)?.stop();
      this.jobs.delete(jobId);
    }

    // Create new job
    const job = cron.schedule(cronExpression, async () => {
      await this.deliverWeeklyPack(subscription);
    }, {
      scheduled: true,
      timezone: subscription.timezone
    });

    this.jobs.set(jobId, job);
    console.log(`✅ Custom delivery scheduled for user ${userId}`);
  }

  /**
   * Cancel a scheduled delivery
   */
  cancelDelivery(userId: string) {
    const jobId = `custom-${userId}`;
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId)?.stop();
      this.jobs.delete(jobId);
      console.log(`✅ Delivery cancelled for user ${userId}`);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAll() {
    this.jobs.forEach((job, id) => {
      job.stop();
      console.log(`Stopped job: ${id}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    return Array.from(this.jobs.keys()).map(id => ({
      id,
      running: true
    }));
  }
}

export default new CronService();
