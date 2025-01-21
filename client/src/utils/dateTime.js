// Format date and time based on system preferences
export const formatDateTime = (date, time) => {
    if (!date) return null;

    const dateObj = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    let timeStr = '';
    if (time) {
        // Check if time is in 24hr format (e.g. "1700")
        if (time.length === 4 && !time.includes(':')) {
            const hours = parseInt(time.substring(0, 2));
            const minutes = time.substring(2);
            timeStr = ` ${hours}:${minutes}`;
        } else {
            // Assume it's already in desired format
            timeStr = ` ${time}`;
        }
    }

    return `${dayName} ${monthName} ${day}, ${year}${timeStr}`;
};
