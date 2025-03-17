import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaPause, FaPlay, FaCode, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
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

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [configView, setConfigView] = useState<'formatted' | 'raw'>('formatted');
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to fetch activity ${id}`);
        console.error(`Error fetching activity ${id}:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchActivity();
    }
  }, [isAuthenticated, id]);

  const handleDeactivate = async () => {
    if (!activity) return;
    
    try {
      await api.patch(`/activities/${activity.id}/deactivate`);
      // Update the local state
      setActivity(prev => prev ? { ...prev, status: 'inactive' } : null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to deactivate activity ${activity.id}`);
      console.error(`Error deactivating activity ${activity.id}:`, err);
    }
  };

  const handleActivate = async () => {
    if (!activity) return;
    
    try {
      await api.patch(`/activities/${activity.id}/activate`);
      // Update the local state
      setActivity(prev => prev ? { ...prev, status: 'active' } : null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to activate activity ${activity.id}`);
      console.error(`Error activating activity ${activity.id}:`, err);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      await api.delete(`/activities/${activity.id}`);
      // Navigate back to the activities list
      navigate('/activities');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to delete activity ${activity.id}`);
      console.error(`Error deleting activity ${activity.id}:`, err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link to="/activities" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Activities
        </Link>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-100 text-amber-700 p-4 rounded-md mb-4">
          Activity not found
        </div>
        <Link to="/activities" className="flex items-center text-primary hover:underline">
          <FaArrowLeft className="mr-2" />
          Back to Activities
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/activities" className="flex items-center text-primary hover:underline mb-2">
            <FaArrowLeft className="mr-2" />
            Back to Activities
          </Link>
          <h1 className="text-2xl font-bold">{activity.name}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/activities/${activity.id}/edit`}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md flex items-center text-sm"
          >
            <FaEdit className="mr-1.5" />
            Edit
          </Link>
          
          {activity.status === 'active' ? (
            <button
              onClick={handleDeactivate}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPause className="mr-1.5" />
              Deactivate
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className="px-3 py-1.5 bg-green-500 text-white rounded-md flex items-center text-sm"
            >
              <FaPlay className="mr-1.5" />
              Activate
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md flex items-center text-sm"
          >
            <FaTrash className="mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Activity Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                      {activity.type}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="mt-1">
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
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <div className="mt-1 text-sm">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <div className="mt-1 text-sm">
                    {new Date(activity.updatedAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Created By:</span>
                  <div className="mt-1 text-sm">
                    {activity.createdBy}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <div className="bg-secondary/20 p-4 rounded-md min-h-[100px]">
                {activity.description ? (
                  <p>{activity.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuration</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setConfigView('formatted')}
                  className={`px-2 py-1 text-xs rounded-md ${
                    configView === 'formatted' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setConfigView('raw')}
                  className={`px-2 py-1 text-xs rounded-md flex items-center ${
                    configView === 'raw' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <FaCode className="mr-1" />
                  Raw JSON
                </button>
              </div>
            </div>
            
            {configView === 'formatted' ? (
              <div className="bg-secondary/20 p-4 rounded-md">
                <FormattedConfig config={activity.config} />
              </div>
            ) : (
              <pre className="bg-secondary/20 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(activity.config, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to display formatted config
interface FormattedConfigProps {
  config: Record<string, any>;
  level?: number;
}

const FormattedConfig: React.FC<FormattedConfigProps> = ({ config, level = 0 }) => {
  if (!config || Object.keys(config).length === 0) {
    return <div className="text-muted-foreground italic">No configuration</div>;
  }

  return (
    <div className="space-y-2" style={{ marginLeft: level * 16 }}>
      {Object.entries(config).map(([key, value]) => (
        <div key={key} className="text-sm">
          <div className="font-medium">{key}:</div>
          <div className="ml-4">
            {typeof value === 'object' && value !== null ? (
              <FormattedConfig config={value} level={level + 1} />
            ) : (
              <span>{value === null ? 'null' : String(value)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityDetail;
