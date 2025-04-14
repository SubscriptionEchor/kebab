import moment from 'moment-timezone';

/**
 * Normalize timestamp to milliseconds
 * Handles both second and millisecond timestamps
 */
function normalizeTimestamp(timestamp: number): number {
  // If timestamp is in seconds (less than 10 digits), convert to milliseconds
  return timestamp < 10000000000 ? timestamp * 1000 : timestamp;
}

/**
 * Get the most recent timestamp from status history or return createdAt
 */
export function getMostRecentStatusTimestamp(statusHistory: any[], createdAt: string): string {
  if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
    return createdAt;
  }

  const sortedHistory = [...statusHistory].sort((a, b) => {
    const timestampA = parseInt(a.timestamp);
    const timestampB = parseInt(b.timestamp);
    return timestampB - timestampA;
  });

  return sortedHistory[0]?.timestamp || createdAt;
}

/**
 * Format timestamp to user's local time with format "MMM D, h:mm A"
 * e.g. "Feb 18, 4:09 PM"
 */
export function formatDate(timestamp: string, dateOnly = false): string {
  try {
    if (!timestamp) return 'N/A';
    const timeMs = Number(timestamp);
    const date = new Date(timeMs);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (dateOnly) {
      return `${day}/${month}/${year}`;
    }
    return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
  } catch (error) {
    console.warn('Error formatting date:', timestamp);
    return 'N/A';
  }
}

/**
 * Format date with timezone (e.g. "Feb 18, 2:54 PM GMT+05:30")
 */
export function formatWithTimezone(dateString: string): string {
  try {
    const timestamp = parseInt(dateString);
    if (isNaN(timestamp)) return 'N/A';

    const normalizedTimestamp = normalizeTimestamp(timestamp);
    const userTz = moment.tz.guess();
    return moment(normalizedTimestamp)
      .tz(userTz)
      .format('MMM D, h:mm A [GMT]Z');
  } catch (error) {
    console.warn('Error formatting date with timezone:', dateString);
    return 'N/A';
  }
}

/**
 * Format relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const timestamp = parseInt(dateString);
    if (isNaN(timestamp)) return 'N/A';

    const normalizedTimestamp = normalizeTimestamp(timestamp);
    return moment(normalizedTimestamp).fromNow();
  } catch (error) {
    console.warn('Error formatting relative time:', dateString);
    return 'N/A';
  }
}

/**
 * Format duration in a human readable way
 */
export function formatDuration(milliseconds: number): string {
  return moment.duration(milliseconds).humanize();
}

/**
 * Format date with a custom format
 */
export function formatCustom(dateString: string, format: string): string {
  try {
    const timestamp = parseInt(dateString);
    if (isNaN(timestamp)) return 'N/A';

    const normalizedTimestamp = normalizeTimestamp(timestamp);
    const userTz = moment.tz.guess();
    return moment(normalizedTimestamp).tz(userTz).format(format);
  } catch (error) {
    console.warn('Error formatting date with custom format:', dateString);
    return 'N/A';
  }
}

/**
 * Get timezone offset for display
 */
export function getTimezoneOffset(): string {
  return moment().format('Z');
}