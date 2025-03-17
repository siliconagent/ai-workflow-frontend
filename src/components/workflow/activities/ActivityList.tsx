// src\components\workflow\activities\ActivityList.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaSearch, 
  FaSpinner, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { Activity, ActivityType } from '../../../types/activity.types';
import { useActivities } from '../../../hooks/useActivities';

interface ActivityListProps {
  onCreateActivity: () => void;
  onEditActivity: (activityId: string) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  onCreateActivity, 
  onEditActivity 
}) => {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const { activities, isLoading, error, deleteActivity, toggleActivityStatus } = useActivities();

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleActivityStatus(id, !currentStatus);
  };

const filteredActivities = activities.filter((activity: Activity) => {
    const matchesFilter = activity.name.toLowerCase().includes(filter.toLowerCase()) ||
        activity.description?.toLowerCase().includes(filter.toLowerCase());
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    return matchesFilter && matchesType;
});

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h2 className="text-xl font-bold">Activities</h2>
        <button
          onClick={onCreateActivity}
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
        >
          <FaPlus className="mr-2" />
          New Activity
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 p-2 w-full border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ActivityType | 'all')}
              className="p-2 border border-gray-300 rounded-md w-full md:w-auto"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="human">Human</option>
              <option value="ai">AI</option>
              <option value="notification">Notification</option>
              <option value="integration">Integration</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center items-center">
          <FaSpinner className="animate-spin text-primary mr-2" />
          <span>Loading activities...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">
          <FaExclamationTriangle className="mx-auto mb-2" size={24} />
          <p>Error loading activities. Please try again.</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No activities found.</p>
          <button
            onClick={onCreateActivity}
            className="mt-2 text-primary hover:underline"
          >
            Create your first activity
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity: Activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{activity.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getActivityTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(activity.id, activity.status==='ACTIVE')}
                      className={`inline-flex items-center ${
                        activity.status==='ACTIVE' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {activity.status==='ACTIVE' ? (
                        <>
                          <FaToggleOn className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <FaToggleOff className="mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {activity.description || 'No description provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditActivity(activity.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper function to get color class based on activity type
const getActivityTypeColor = (type: ActivityType): string => {
  switch (type) {
    case 'system':
      return 'bg-blue-100 text-blue-800';
    case 'human':
      return 'bg-green-100 text-green-800';
    case 'ai':
      return 'bg-purple-100 text-purple-800';
    case 'mail':
      return 'bg-yellow-100 text-yellow-800';
    case 'rest':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default ActivityList;
