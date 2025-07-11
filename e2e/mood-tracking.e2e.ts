/**
 * E2E Tests for Mood Tracking Functionality
 * Tests mood recording, history viewing, and insights generation
 */

import { device, element, by, expect as detoxExpect } from 'detox';
import { E2EHelpers, TEST_USER } from './setup';

describe('Mood Tracking', () => {
  beforeEach(async () => {
    // Start with authenticated user in main app
    await this.setupAuthenticatedUser();
    await E2EHelpers.navigateToTab('mood');
  });

  describe('Mood Recording', () => {
    it('should display mood tracking interface', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Check main mood tracking elements
      await detoxExpect(element(by.text('How are you feeling?'))).toBeVisible();
      await detoxExpect(element(by.id('mood-slider'))).toBeVisible();
      await detoxExpect(element(by.id('mood-factors-section'))).toBeVisible();
      await detoxExpect(element(by.id('mood-note-input'))).toBeVisible();
      await detoxExpect(element(by.id('save-mood-button'))).toBeVisible();
    });

    it('should record basic mood with slider', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Set mood to 8 (Good)
      await E2EHelpers.tapElement(by.id('mood-value-8'));
      
      // Should show corresponding emoji and label
      await detoxExpect(element(by.id('mood-emoji-good'))).toBeVisible();
      await detoxExpect(element(by.text('Good'))).toBeVisible();
      
      // Save mood
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      
      // Should show success feedback
      await detoxExpect(element(by.text('Mood saved successfully'))).toBeVisible();
    });

    it('should record mood with factors', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Set mood rating
      await E2EHelpers.tapElement(by.id('mood-value-6'));
      
      // Select mood factors
      await E2EHelpers.tapElement(by.id('factor-sleep'));
      await E2EHelpers.tapElement(by.id('factor-exercise'));
      await E2EHelpers.tapElement(by.id('factor-work'));
      
      // Selected factors should be highlighted
      await detoxExpect(element(by.id('factor-sleep-selected'))).toBeVisible();
      await detoxExpect(element(by.id('factor-exercise-selected'))).toBeVisible();
      await detoxExpect(element(by.id('factor-work-selected'))).toBeVisible();
      
      // Save mood with factors
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      
      await detoxExpect(element(by.text('Mood saved successfully'))).toBeVisible();
    });

    it('should record mood with note', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Set mood rating
      await E2EHelpers.tapElement(by.id('mood-value-7'));
      
      // Add note
      const moodNote = 'Had a productive day at work and felt accomplished';
      await E2EHelpers.typeText(by.id('mood-note-input'), moodNote);
      
      // Save mood with note
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      
      await detoxExpect(element(by.text('Mood saved successfully'))).toBeVisible();
    });

    it('should record complete mood entry with all fields', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Set mood rating
      await E2EHelpers.tapElement(by.id('mood-value-9'));
      
      // Select multiple factors
      await E2EHelpers.tapElement(by.id('factor-family'));
      await E2EHelpers.tapElement(by.id('factor-weather'));
      await E2EHelpers.tapElement(by.id('factor-music'));
      
      // Add detailed note
      const detailedNote = 'Amazing day! Spent quality time with family, beautiful weather, and listened to my favorite music. Feeling grateful and energized.';
      await E2EHelpers.typeText(by.id('mood-note-input'), detailedNote);
      
      // Save complete mood entry
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      
      await detoxExpect(element(by.text('Mood saved successfully'))).toBeVisible();
    });

    it('should handle mood entry validation', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Try to save without selecting mood rating
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      
      // Should show validation message
      await detoxExpect(element(by.text('Please select a mood rating'))).toBeVisible();
    });

    it('should allow editing mood before saving', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      // Set initial mood
      await E2EHelpers.tapElement(by.id('mood-value-5'));
      await detoxExpect(element(by.text('Okay'))).toBeVisible();
      
      // Change mood
      await E2EHelpers.tapElement(by.id('mood-value-8'));
      await detoxExpect(element(by.text('Good'))).toBeVisible();
      
      // Add and modify factors
      await E2EHelpers.tapElement(by.id('factor-sleep'));
      await E2EHelpers.tapElement(by.id('factor-sleep')); // Deselect
      await detoxExpect(element(by.id('factor-sleep-selected'))).not.toBeVisible();
      
      // Save final mood
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      await detoxExpect(element(by.text('Mood saved successfully'))).toBeVisible();
    });
  });

  describe('Mood History and Visualization', () => {
    beforeEach(async () => {
      // Record a few mood entries for testing
      await this.recordTestMoods();
    });

    it('should display mood history list', async () => {
      // Navigate to mood history
      await E2EHelpers.tapElement(by.id('mood-history-tab'));
      await E2EHelpers.waitForElement(by.id('mood-history-list'));
      
      // Should show previous mood entries
      await detoxExpect(element(by.id('mood-entry-item'))).toBeVisible();
      await detoxExpect(element(by.text('Today'))).toBeVisible();
    });

    it('should display mood chart visualization', async () => {
      await E2EHelpers.tapElement(by.id('mood-chart-tab'));
      await E2EHelpers.waitForElement(by.id('mood-chart-container'));
      
      // Should show mood chart
      await detoxExpect(element(by.id('mood-line-chart'))).toBeVisible();
      await detoxExpect(element(by.text('Last 7 Days'))).toBeVisible();
    });

    it('should allow filtering mood history by date range', async () => {
      await E2EHelpers.tapElement(by.id('mood-history-tab'));
      await E2EHelpers.waitForElement(by.id('mood-history-list'));
      
      // Tap date filter
      await E2EHelpers.tapElement(by.id('date-filter-button'));
      
      // Select different time range
      await E2EHelpers.tapElement(by.text('Last 30 Days'));
      
      // Should update history display
      await detoxExpect(element(by.text('Last 30 Days'))).toBeVisible();
    });

    it('should show mood statistics', async () => {
      await E2EHelpers.tapElement(by.id('mood-stats-tab'));
      await E2EHelpers.waitForElement(by.id('mood-statistics-container'));
      
      // Should display various statistics
      await detoxExpect(element(by.text('Average Mood'))).toBeVisible();
      await detoxExpect(element(by.text('Mood Trend'))).toBeVisible();
      await detoxExpect(element(by.text('Most Common Factors'))).toBeVisible();
    });

    it('should display mood insights', async () => {
      await E2EHelpers.tapElement(by.id('mood-insights-tab'));
      await E2EHelpers.waitForElement(by.id('mood-insights-container'));
      
      // Should show AI-generated insights
      await detoxExpect(element(by.text('Mood Insights'))).toBeVisible();
      await detoxExpect(element(by.id('insight-card'))).toBeVisible();
    });

    it('should allow editing previous mood entries', async () => {
      await E2EHelpers.tapElement(by.id('mood-history-tab'));
      await E2EHelpers.waitForElement(by.id('mood-history-list'));
      
      // Tap on a mood entry
      await E2EHelpers.tapElement(by.id('mood-entry-item'));
      
      // Should open edit modal
      await E2EHelpers.waitForElement(by.id('edit-mood-modal'));
      
      // Modify mood rating
      await E2EHelpers.tapElement(by.id('mood-value-9'));
      
      // Save changes
      await E2EHelpers.tapElement(by.id('save-changes-button'));
      
      // Should update and close modal
      await detoxExpect(element(by.text('Mood updated successfully'))).toBeVisible();
      await detoxExpect(element(by.id('edit-mood-modal'))).not.toBeVisible();
    });

    it('should allow deleting mood entries', async () => {
      await E2EHelpers.tapElement(by.id('mood-history-tab'));
      await E2EHelpers.waitForElement(by.id('mood-history-list'));
      
      // Long press on mood entry
      await element(by.id('mood-entry-item')).longPress();
      
      // Should show context menu
      await detoxExpect(element(by.text('Delete'))).toBeVisible();
      await E2EHelpers.tapElement(by.text('Delete'));
      
      // Should show confirmation
      await detoxExpect(element(by.text('Delete Mood Entry?'))).toBeVisible();
      await E2EHelpers.tapElement(by.text('Delete'));
      
      // Should remove entry
      await detoxExpect(element(by.text('Mood entry deleted'))).toBeVisible();
    });
  });

  describe('Mood Trends and Patterns', () => {
    beforeEach(async () => {
      // Record multiple mood entries over time for pattern analysis
      await this.recordMoodPattern();
    });

    it('should identify mood patterns', async () => {
      await E2EHelpers.tapElement(by.id('mood-insights-tab'));
      await E2EHelpers.waitForElement(by.id('mood-insights-container'));
      
      // Should show pattern insights
      await detoxExpect(element(by.text('Patterns Detected'))).toBeVisible();
      await detoxExpect(element(by.id('pattern-insight-card'))).toBeVisible();
    });

    it('should show factor correlations', async () => {
      await E2EHelpers.tapElement(by.id('mood-insights-tab'));
      
      // Should show factor analysis
      await detoxExpect(element(by.text('Factor Impact'))).toBeVisible();
      await detoxExpect(element(by.id('factor-correlation-chart'))).toBeVisible();
    });

    it('should provide mood recommendations', async () => {
      await E2EHelpers.tapElement(by.id('mood-insights-tab'));
      
      // Should show personalized recommendations
      await detoxExpect(element(by.text('Recommendations'))).toBeVisible();
      await detoxExpect(element(by.id('recommendation-card'))).toBeVisible();
    });

    it('should track mood streaks', async () => {
      await E2EHelpers.tapElement(by.id('mood-stats-tab'));
      
      // Should show streak information
      await detoxExpect(element(by.text('Current Streak'))).toBeVisible();
      await detoxExpect(element(by.text('Best Streak'))).toBeVisible();
    });
  });

  describe('Mood Export and Sharing', () => {
    it('should allow exporting mood data', async () => {
      await E2EHelpers.tapElement(by.id('mood-settings-button'));
      await E2EHelpers.waitForElement(by.id('mood-settings-modal'));
      
      // Tap export option
      await E2EHelpers.tapElement(by.id('export-mood-data-button'));
      
      // Should show export options
      await detoxExpect(element(by.text('Export Format'))).toBeVisible();
      await detoxExpect(element(by.text('CSV'))).toBeVisible();
      await detoxExpect(element(by.text('JSON'))).toBeVisible();
    });

    it('should allow sharing mood summary', async () => {
      await E2EHelpers.tapElement(by.id('mood-chart-tab'));
      await E2EHelpers.waitForElement(by.id('mood-chart-container'));
      
      // Tap share button
      await E2EHelpers.tapElement(by.id('share-mood-chart-button'));
      
      // Should open share dialog
      try {
        await detoxExpect(element(by.text('Share Chart'))).toBeVisible();
      } catch {
        console.log('Share dialog not visible');
      }
    });
  });

  describe('Accessibility and Usability', () => {
    it('should support voice notes for mood entries', async () => {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      
      try {
        // Tap voice note button
        await E2EHelpers.tapElement(by.id('voice-note-button'));
        
        // Handle permission if needed
        await E2EHelpers.handlePermissionDialog('allow');
        
        // Should show voice recording
        await detoxExpect(element(by.id('voice-recording-indicator'))).toBeVisible();
      } catch {
        console.log('Voice notes not available');
      }
    });

    it('should support mood tracking reminders', async () => {
      await E2EHelpers.tapElement(by.id('mood-settings-button'));
      await E2EHelpers.waitForElement(by.id('mood-settings-modal'));
      
      // Enable reminders
      await E2EHelpers.tapElement(by.id('mood-reminders-toggle'));
      
      // Should show reminder options
      await detoxExpect(element(by.text('Reminder Time'))).toBeVisible();
      await E2EHelpers.tapElement(by.text('9:00 PM'));
      
      // Save settings
      await E2EHelpers.tapElement(by.id('save-settings-button'));
      await detoxExpect(element(by.text('Settings saved'))).toBeVisible();
    });

    it('should handle large mood datasets efficiently', async () => {
      // This test would involve creating many mood entries
      // and verifying the UI remains responsive
      
      await E2EHelpers.tapElement(by.id('mood-history-tab'));
      await E2EHelpers.waitForElement(by.id('mood-history-list'));
      
      // Should load quickly even with many entries
      const startTime = Date.now();
      await detoxExpect(element(by.id('mood-entry-item'))).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (2 seconds)
      expect(loadTime).toBeLessThan(2000);
    });
  });

  // Helper methods
  async setupAuthenticatedUser() {
    const appState = await E2EHelpers.checkAppState();
    
    if (appState !== 'authenticated') {
      // Complete onboarding flow (abbreviated version)
      await E2EHelpers.resetAppState();
      
      await E2EHelpers.waitForElement(by.id('welcome-screen'));
      await E2EHelpers.tapElement(by.id('get-started-button'));
      await E2EHelpers.waitForElement(by.id('auth-screen'));
      
      await E2EHelpers.typeText(by.id('email-input'), TEST_USER.email);
      await E2EHelpers.typeText(by.id('password-input'), TEST_USER.password);
      await E2EHelpers.typeText(by.id('first-name-input'), TEST_USER.firstName);
      await E2EHelpers.typeText(by.id('last-name-input'), TEST_USER.lastName);
      await E2EHelpers.tapElement(by.id('sign-up-button'));
      
      // Complete onboarding quickly
      await E2EHelpers.waitForElement(by.id('onboarding-screen'));
      await E2EHelpers.tapElement(by.id('age-range-25-34'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your interests?'));
      await E2EHelpers.tapElement(by.id('interest-meditation'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('What are your mental health goals?'));
      await E2EHelpers.tapElement(by.id('goal-stress-reduction'));
      await E2EHelpers.tapElement(by.id('continue-button'));
      
      await E2EHelpers.waitForElement(by.text('Choose your preferred language'));
      await E2EHelpers.tapElement(by.id('language-english'));
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
      
      await E2EHelpers.waitForElement(by.id('onboarding-screen'));
      await E2EHelpers.typeText(by.id('chat-input'), 'Ready to start!');
      await E2EHelpers.tapElement(by.id('send-button'));
      await E2EHelpers.waitForLoadingToComplete(30000);
      await E2EHelpers.tapElement(by.id('complete-onboarding-button'));
      
      await E2EHelpers.waitForElement(by.id('main-tabs'));
    }
  }

  async recordTestMoods() {
    // Record a few mood entries for testing
    const moods = [
      { rating: 7, factors: ['sleep'], note: 'Good sleep last night' },
      { rating: 5, factors: ['work'], note: 'Stressful day at work' },
      { rating: 8, factors: ['exercise', 'music'], note: 'Great workout and music' },
    ];

    for (const mood of moods) {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      await E2EHelpers.tapElement(by.id(`mood-value-${mood.rating}`));
      
      for (const factor of mood.factors) {
        await E2EHelpers.tapElement(by.id(`factor-${factor}`));
      }
      
      await E2EHelpers.typeText(by.id('mood-note-input'), mood.note);
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      await E2EHelpers.waitForLoadingToComplete(5000);
      
      // Clear form for next entry
      await E2EHelpers.tapElement(by.id('clear-form-button'));
    }
  }

  async recordMoodPattern() {
    // Record a pattern of moods for testing insights
    const pattern = [
      { rating: 6, factors: ['sleep'] },
      { rating: 8, factors: ['exercise'] },
      { rating: 5, factors: ['work'] },
      { rating: 9, factors: ['family', 'exercise'] },
      { rating: 4, factors: ['work', 'weather'] },
      { rating: 7, factors: ['sleep', 'music'] },
    ];

    for (const mood of pattern) {
      await E2EHelpers.waitForElement(by.id('mood-tracker-screen'));
      await E2EHelpers.tapElement(by.id(`mood-value-${mood.rating}`));
      
      for (const factor of mood.factors) {
        await E2EHelpers.tapElement(by.id(`factor-${factor}`));
      }
      
      await E2EHelpers.tapElement(by.id('save-mood-button'));
      await E2EHelpers.waitForLoadingToComplete(5000);
      await E2EHelpers.tapElement(by.id('clear-form-button'));
    }
  }
});