/**
 * Date utility functions
 */

/**
 * Get the number of days in a specific month
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Number of days in the month
 */
export const getDaysInMonth = (dateString: string): number => {
  const date = new Date(dateString + 'T00:00:00'); // Use local time
  const year = date.getFullYear();
  const month = date.getMonth();
  // Day 0 of next month gives the last day of the current month
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Format date for display
 * @param dateString - Date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};
