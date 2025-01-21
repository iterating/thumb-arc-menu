/**
 * Date management utilities for timeline operations
 */

/**
 * Create a date object from the current time
 * @returns {Date} Current date object
 */
export const createCurrentDate = () => {
    // Parse the ISO string parts
    const [datePart, timePart] = "2024-12-09T17:28:14-08:00".split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [time] = timePart.split('-');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    
    // Create date using local components
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // JavaScript months are 0-based
    date.setDate(day);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return date;
};

/**
 * Create a date object from an ISO string or existing date
 * @param {string|Date} date - Date to parse
 * @returns {Date} Parsed date object
 */
export const createDate = (date) => {
    if (date instanceof Date) return date;
    
    // If it's an ISO string with timezone
    if (typeof date === 'string' && date.includes('T')) {
        const [datePart] = date.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const d = new Date();
        d.setFullYear(year);
        d.setMonth(month - 1); // JavaScript months are 0-based
        d.setDate(day);
        d.setHours(0, 0, 0, 0); // Start of day in local time
        return d;
    }
    
    // If it's just a date string (YYYY-MM-DD)
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number);
        const d = new Date();
        d.setFullYear(year);
        d.setMonth(month - 1); // JavaScript months are 0-based
        d.setDate(day);
        d.setHours(0, 0, 0, 0); // Start of day in local time
        return d;
    }
    
    return new Date(date);
};

/**
 * Format a date for display with optional time component
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time component
 * @returns {string|{date: string, time: string}} Formatted date
 */
export const formatDateForDisplay = (date, includeTime = false) => {
  const d = createDate(date);
  
  // Format date manually to ensure YYYY-MM-DD format
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  if (!includeTime) return dateStr;
  
  // Get hours and minutes in 12-hour format with AM/PM
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert to 12-hour format
  const timeStr = `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  
  return { date: dateStr, time: timeStr };
};

/**
 * Format a date for input fields (24-hour format for time)
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time component
 * @returns {string|{date: string, time: string}} Formatted date
 */
export const formatDateForInput = (date, includeTime = false) => {
  const d = createDate(date);
  
  // Format date manually to ensure YYYY-MM-DD format
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  if (!includeTime) return dateStr;
  
  // Get hours and minutes in 24-hour format
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  return { date: dateStr, time: timeStr };
};

/**
 * Compare two dates for sorting
 * @param {Date|string} a - First date
 * @param {Date|string} b - Second date
 * @returns {number} Comparison result (-1, 0, 1)
 */
export const compareDates = (a, b) => {
  const dateA = createDate(a);
  const dateB = createDate(b);
  return dateA.getTime() - dateB.getTime();
};

/**
 * Check if a date is between two other dates
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {boolean} Whether date is between start and end
 */
export const isDateBetween = (date, start, end) => {
  const d = createDate(date).getTime();
  const s = createDate(start).getTime();
  const e = createDate(end).getTime();
  return d >= s && d <= e;
};

/**
 * Get current timestamp in ISO format
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => createCurrentDate().toISOString();

/**
 * Format a date with optional time component
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time component
 * @returns {string} Formatted date
 */
export const formatDateWithOptionalTime = (date, includeTime = false) => {
  const d = createDate(date);
  
  // Format date manually to ensure YYYY-MM-DD format
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  if (!includeTime) return dateStr;
  
  // Get hours and minutes in 24-hour format
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  return `${dateStr} ${timeStr}`;
};

/**
 * Format a date and time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  const d = createDate(date);
  
  // Format date manually to ensure YYYY-MM-DD format
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  // Get hours and minutes in 24-hour format
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  
  return `${dateStr} ${timeStr}`;
};
