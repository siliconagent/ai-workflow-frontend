import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Activity, ActivityFilterParams, ActivityInput } from '../types/activity.types';
import { activityService } from '../services/activityService';

interface ActivityState {
  activities: Activity[];
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActivities: (params?: ActivityFilterParams) => Promise<void>;
  fetchActivity: (id: string) => Promise<void>;
  createActivity: (activity: ActivityInput) => Promise<Activity>;
  updateActivity: (id: string, activity: ActivityInput) => Promise<Activity>;
  deactivateActivity: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  setCurrentActivity: (activity: Activity | null) => void;
  toggleActivityStatus: (id: string, active: boolean) => Promise<void>;
  clearError: () => void;
}

export const useActivityStore = create<ActivityState>()(
  devtools(
    (set, get) => ({
      activities: [],
      currentActivity: null,
      isLoading: false,
      error: null,

      fetchActivities: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const activities = await activityService.getActivities(params);
          set({ activities, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch activities', 
            isLoading: false 
          });
        }
      },

      fetchActivity: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const activity = await activityService.getActivity(id);
          set({ currentActivity: activity, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch activity', 
            isLoading: false 
          });
        }
      },

      createActivity: async (activity) => {
        set({ isLoading: true, error: null });
        try {
          const newActivity = await activityService.createActivity(activity);
          set((state) => ({ 
            activities: [...state.activities, newActivity], 
            isLoading: false 
          }));
          return newActivity;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create activity', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateActivity: async (id, activity) => {
        set({ isLoading: true, error: null });
        try {
          const updatedActivity = await activityService.updateActivity(id, activity);
          set((state) => ({ 
            activities: state.activities.map(a => a.id === id ? updatedActivity : a),
            currentActivity: state.currentActivity?.id === id ? updatedActivity : state.currentActivity,
            isLoading: false 
          }));
          return updatedActivity;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update activity', 
            isLoading: false 
          });
          throw error;
        }
      },

      deactivateActivity: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedActivity = await activityService.deactivateActivity(id);
          set((state) => ({ 
            activities: state.activities.map(a => a.id === id ? updatedActivity : a),
            currentActivity: state.currentActivity?.id === id ? updatedActivity : state.currentActivity,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate activity', 
            isLoading: false 
          });
        }
      },

      toggleActivityStatus: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const updatedActivity = await activityService.toggleActivityStatus(id);
          set((state) => ({ 
            activities: state.activities.map(a => a.id === id ? updatedActivity : a),
            currentActivity: state.currentActivity?.id === id ? updatedActivity : state.currentActivity,
            isLoading: false 
          }));
        } catch (error) {
      }},


      deleteActivity: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await activityService.deleteActivity(id);
          set((state) => ({ 
            activities: state.activities.filter(a => a.id !== id),
            currentActivity: state.currentActivity?.id === id ? null : state.currentActivity,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete activity', 
            isLoading: false 
          });
        }
      },

      setCurrentActivity: (activity) => {
        set({ currentActivity: activity });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    { name: 'activity-store' }
  )
);
