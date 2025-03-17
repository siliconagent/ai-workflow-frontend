// Format date/time
const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format duration between two dates
  const formatDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s`;
    }
    
    // Less than an hour
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
    }
    
    // Hours and minutes
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  };
  
  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Export as a named object
  export const formatUtils = {
    formatDateTime,
    formatDuration,
    formatFileSize,
    formatNumber
  };
