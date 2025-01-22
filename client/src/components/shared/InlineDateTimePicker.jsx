import React, { useState, useCallback, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './InlineDateTimePicker.css';
import { FiCalendar } from 'react-icons/fi';

const useSystemDateFormat = () => {
  const [format, setFormat] = useState({
    date: undefined,
    time: undefined,
    is24Hour: false
  });

  useEffect(() => {
    // Get system date format
    const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
      dateStyle: 'short'
    });
    
    // Get system time format
    const timeFormatter = new Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
      minute: 'numeric'
    });

    // Detect 24-hour format by checking if "AM" appears in a noon formatting
    const noonDate = new Date(2024, 0, 1, 12, 0, 0);
    const is24Hour = !timeFormatter.format(noonDate).includes('M');

    setFormat({
      date: dateFormatter,
      time: timeFormatter,
      is24Hour
    });
  }, []);

  return format;
};

const InlineDateTimePicker = ({ 
  value, 
  onChange,
  showTime = true,
  className = '',
  allowClear = false,
  mode = 'expanded' 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(mode === 'expanded');
  const format = useSystemDateFormat();
  const calendarRef = useRef(null);
  const componentRef = useRef(null);
  
  // Initialize timeSet based on whether there's a time in the value
  const [timeSet, setTimeSet] = useState(() => {
    if (!value) return false;
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date) && (date.getHours() !== 0 || date.getMinutes() !== 0);
  });

  // Update timeSet when value changes externally
  useEffect(() => {
    if (!value) {
      setTimeSet(false);
    } else {
      const date = value instanceof Date ? value : new Date(value);
      if (!isNaN(date) && !timeSet && (date.getHours() !== 0 || date.getMinutes() !== 0)) {
        setTimeSet(true);
      }
    }
  }, [value]);

  // Update expanded state when mode changes
  useEffect(() => {
    setIsExpanded(mode === 'expanded');
  }, [mode]);

  // Handle clicking outside to collapse
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Default formatter for initial render
  const defaultFormatter = new Intl.DateTimeFormat('en-US', { 
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  });

  const formatDate = useCallback((date) => {
    if (!date) return '--/--/--';
    return format.date ? format.date.format(date) : defaultFormatter.format(date);
  }, [format.date]);

  const formatCollapsedDateTime = (date) => {
    if (!date) return 'No date set';

    const currentYear = new Date().getFullYear();
    const showYear = date.getFullYear() !== currentYear;

    const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
      month: 'short',
      day: 'numeric',
      ...(showYear && { year: 'numeric' })
    });

    if (!timeSet) {
      return dateFormatter.format(date);
    }

    // Format time based on whether minutes are present
    const hasMinutes = date.getMinutes() !== 0;
    const timeFormatter = new Intl.DateTimeFormat(navigator.language, {
      hour: 'numeric',
      ...(hasMinutes && { minute: '2-digit' }),
      hour12: true
    });

    // Format time and convert AM/PM to lowercase
    const timeStr = timeFormatter.format(date).toLowerCase();
    return `${dateFormatter.format(date)} ${timeStr}`;
  };

  // Generate hours options based on 12/24 hour format
  const hoursOptions = [
    { value: '--', label: '--' },
    ...(format.is24Hour
      ? Array.from({ length: 24 }, (_, i) => ({
          value: i,
          label: i.toString().padStart(2, '0')
        }))
      : Array.from({ length: 12 }, (_, i) => ({
          value: i === 0 ? 12 : i,
          label: (i === 0 ? 12 : i).toString()
        })))
  ];

  // Generate minutes options (00-59)
  const minutesOptions = [
    { value: '--', label: '--' },
    ...Array.from({ length: 60 }, (_, i) => ({
      value: i,
      label: i.toString().padStart(2, '0')
    }))
  ];

  const handleTimeChange = useCallback((type, newValue) => {
    if (newValue === '--') {
      // If hours are cleared, clear minutes too
      if (type === 'hours') {
        onChange(null);
        setTimeSet(false);
      }
      return;
    }

    setTimeSet(true);
    if (!value && newValue !== '--') {
      // If no date is set, use today
      const newDate = new Date();
      if (type === 'hours') {
        newDate.setHours(parseInt(newValue), 0);
      } else if (type === 'minutes') {
        newDate.setMinutes(parseInt(newValue));
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours();
        const isPM = newValue === 'pm';
        newDate.setHours(isPM ? currentHours + 12 : currentHours);
      }
      onChange(newDate);
    } else if (value) {
      const date = value instanceof Date ? value : new Date(value);
      const newDate = new Date(date);
      if (type === 'hours') {
        newDate.setHours(parseInt(newValue), 0); // Reset minutes when hours change
      } else if (type === 'minutes') {
        newDate.setMinutes(parseInt(newValue));
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours();
        const isPM = newValue === 'pm';
        newDate.setHours(isPM ? currentHours + 12 : currentHours);
      }
      onChange(newDate);
    }
  }, [value, onChange]);

  const handleCalendarSelect = useCallback((date) => {
    // Only preserve time if it was explicitly set
    if (value && timeSet) {
      date.setHours(value.getHours(), value.getMinutes());
    } else {
      date.setHours(0, 0, 0, 0);
      setTimeSet(false); // Reset time when date changes
    }
    onChange(date);
    setShowCalendar(false);
  }, [value, onChange, timeSet]);

  const handleClear = useCallback(() => {
    onChange(null);
    setTimeSet(false);
  }, [onChange]);

  // Get current hours/minutes for display
  const currentHours = !value || !timeSet ? '--' : (format.is24Hour ? 
    value.getHours() : 
    (value.getHours() % 12 || 12));
  const currentMinutes = !value || !timeSet || currentHours === '--' ? '--' : 
    value.getMinutes().toString().padStart(2, '0');

  return (
    <div 
      ref={componentRef}
      className={`inline-datetime ${isExpanded ? '' : 'inline-datetime--compact'} ${className}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {isExpanded ? (
        <div className="inline-datetime-inputs">
          <FiCalendar className="calendar-icon" />
          <input
            type="text"
            value={formatDate(value)}
            onClick={() => setShowCalendar(true)}
            readOnly
            placeholder="Select date"
          />
          {showTime && (
            <>
              <select
                value={currentHours}
                onChange={(e) => handleTimeChange('hours', e.target.value)}
              >
                {hoursOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="colon">:</span>
              <select
                value={currentMinutes}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
              >
                {minutesOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {!format.is24Hour && (
                <select
                  value={currentHours >= 12 ? 'pm' : 'am'}
                  onChange={(e) => handleTimeChange('ampm', e.target.value)}
                >
                  <option value="am">AM</option>
                  <option value="pm">PM</option>
                </select>
              )}
              {allowClear && (
                <button className="inline-datetime-clear" onClick={handleClear}>Clear</button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="inline-datetime-collapsed">
          <FiCalendar className="calendar-icon" />
          <span className="datetime-text">
            {formatCollapsedDateTime(value)}
          </span>
        </div>
      )}
      {showCalendar && isExpanded && (
        <div className="inline-datetime-calendar" ref={calendarRef}>
          <Calendar
            value={value instanceof Date ? value : new Date(value)}
            onChange={handleCalendarSelect}
            minDetail="month"
          />
        </div>
      )}
    </div>
  );
};

export default InlineDateTimePicker;
