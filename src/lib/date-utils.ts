/**
 * Safely format a date string to locale date string
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid (default: 'Not scheduled')
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(dateString: string | Date | null | undefined, fallback: string = 'Not scheduled'): string {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Safely format a date string to locale date-time string
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid (default: 'Not scheduled')
 * @returns Formatted date-time string or fallback
 */
export function safeFormatDateTime(dateString: string | Date | null | undefined, fallback: string = 'Not scheduled'): string {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return fallback;
  }
}

/**
 * Check if a date is valid
 * @param dateString - The date string to check
 * @returns boolean indicating if date is valid
 */
export function isValidDate(dateString: string | Date | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Format date to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
 * @param dateString - The date to format
 * @returns MySQL DATETIME string or null
 */
export function toMySQLDateTime(dateString: string | Date | null | undefined): string | null {
  if (!dateString || !isValidDate(dateString)) return null;
  
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    return null;
  }
}

/**
 * Format date to MySQL DATE format (YYYY-MM-DD)
 * @param dateString - The date to format
 * @returns MySQL DATE string or null
 */
export function toMySQLDate(dateString: string | Date | null | undefined): string | null {
  if (!dateString || !isValidDate(dateString)) return null;
  
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
  } catch (error) {
    return null;
  }
}

/**
 * Get relative time from now (e.g., "2 days ago", "in 3 hours")
 * @param dateString - The date to compare
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString || !isValidDate(dateString)) return 'Invalid date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (Math.abs(diffInDays) > 0) {
    return diffInDays > 0 ? `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}` : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`;
  } else if (Math.abs(diffInHours) > 0) {
    return diffInHours > 0 ? `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}` : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) > 1 ? 's' : ''} ago`;
  } else {
    return diffInMinutes > 0 ? `in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}` : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) > 1 ? 's' : ''} ago`;
  }
}