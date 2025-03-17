import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaEdit, FaTrash, FaPause, FaCheck, FaPlus, FaSearch, FaFilter, FaSort } from 'react-icons/fa';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';

interface Activity {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: Record<string, any>;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const ActivitiesIndex: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/activities');
        setActivities(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch activities');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchActivities();
    }
  }, [isAuthenticated]);

  const handleDeactivate = async (id: string) => {
    try {
      await api.patch(`/activities/${id}/deactivate`);
      // Update the local state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === id ? { ...activity, status: 'inactive' } : activity
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to deactivate activity ${id}`);
      console.error(`Error deactivating activity ${id}:`, err);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.patch(`/activities/${id}/activate`);
      // Update the local state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === id ? { ...activity, status: 'active' } : activity
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to activate activity ${id}`);
      console.error(`Error activating activity ${id}:`, err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await api.delete(`/activities/${id}`);
      // Update the local state
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity.id !== id)
      );
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to delete activity ${id}`);
      console.error(`Error deleting activity ${id}:`, err);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort activities
  const filteredActivities = activities
    .filter(activity => {
      // Apply search filter
      const searchFilter = searchTerm.toLowerCase();
      const matchesSearch = 
        activity.name.toLowerCase().includes(searchFilter) ||
        (activity.description?.toLowerCase().includes(searchFilter) || false);
      
      // Apply type filter
      const matchesType = filterType === 'all' || activity.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // Default to updatedAt
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get unique activity types for filter dropdown
  const activityTypes = ['all', ...new Set(activities.map(activity => activity.type))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Link 
          to="/activities/new" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center"
        >
          <FaPlus className="mr-2" />
          New Activity
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-border rounded-md"
          />
        </div>
        
        <div className="flex items-center">
          <FaFilter className="mr-2 text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background"
          >
            {activityTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-background border border-border rounded-md p-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">No activities found</p>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first activity'}
          </p>
          
          {!searchTerm && filterType === 'all' && (
            <Link
              to="/activities/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create Activity
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-background border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortField === 'type' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Last Updated
                    {sortField === 'updatedAt' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/activities/${activity.id}`} className="font-medium text-primary hover:text-primary/80">
                      {activity.name}
                    </Link>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {activity.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {activity.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs flex items-center w-fit">
                        <FaCheck className="mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full text-xs flex items-center w-fit">
                        <FaPause className="mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(activity.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/activities/${activity.id}`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="View"
                      >
                        <FaPlay />
                      </Link>
                      <Link
                        to={`/activities/${activity.id}/edit`}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      {activity.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivate(activity.id)}
                          className="text-amber-500 hover:text-amber-700 p-1"
                          title="Deactivate"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(activity.id)}
                          className="text-green-500 hover:text-green-700 p-1"
                          title="Activate"
                        >
                          <FaPlay />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
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

export default ActivitiesIndex;
