import api from '../lib/api';
import { Activity, ActivityFilterParams, ActivityInput } from '../types/activity.types';

export const activityService = {
  /**
   * Get all activities with optional filtering
   */
  async getActivities(params?: ActivityFilterParams): Promise<Activity[]> {
    const response = await api.get('/api/activities', { params });
    return response.data;
  },

  /**
   * Get activity by ID
   */
  async getActivity(id: string): Promise<Activity> {
    const response = await api.get(`/api/activities/${id}`);
    return response.data;
  },

  /**
   * Create a new activity
   */
  async createActivity(activity: ActivityInput): Promise<Activity> {
    const response = await api.post('/api/activities', activity);
    return response.data;
  },

  /**
   * Update an existing activity
   */
  async updateActivity(id: string, activity: ActivityInput): Promise<Activity> {
    const response = await api.put(`/api/activities/${id}`, activity);
    return response.data;
  },

  /**
   * Deactivate an activity
   */
  async deactivateActivity(id: string): Promise<Activity> {
    const response = await api.patch(`/api/activities/${id}/deactivate`);
    return response.data;
  },

  async toggleActivityStatus(id: string): Promise<Activity> {
    const response = await api.patch(`/api/activities/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Delete an activity
   */
  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/api/activities/${id}`);
  },

  /**
   * Clone an existing activity
   */
  async cloneActivity(id: string, newName: string): Promise<Activity> {
    // First get the original activity
    const original = await this.getActivity(id);
    
    // Create a new activity based on the original
    const cloneInput: ActivityInput = {
      name: newName,
      description: `Clone of ${original.name}`,
      type: original.type,
      configuration: JSON.parse(JSON.stringify(original.configuration)), // Deep copy
      category: original.category,
      tags: original.tags ? [...original.tags] : []
    };
    
    // Save the cloned activity
    return this.createActivity(cloneInput);
  }
};
