// Maximum number of logs to keep in storage
const MAX_LOGS = 1000;
const STORAGE_KEY = 'cascade_logs';
let saveTimeout = null;

// Save logs to both localStorage and server with debouncing
const saveLogs = (logs) => {
    // Clear any pending save
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // Debounce the save operation
    saveTimeout = setTimeout(async () => {
        try {
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
            
            // Send to server
            const response = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logs)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (e) {
            // If localStorage is full, clear half of the old logs
            if (e.name === 'QuotaExceededError') {
                const currentLogs = getLogs();
                const halfLength = Math.floor(currentLogs.length / 2);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLogs.slice(halfLength)));
            }
            // Log server errors to original console
            if (e.name !== 'QuotaExceededError') {
                originalConsole.error('Error saving logs:', e);
            }
        }
    }, 1000); // Debounce for 1 second
};

// Get all stored logs
const getLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
        originalConsole.error('Error reading logs:', e);
        return [];
    }
};

// Add a new log entry
const addLog = (type, args) => {
    const logs = getLogs();
    const newLog = {
        timestamp: new Date().toISOString(),
        type,
        message: args.map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
                return '[Circular]';
            }
        }).join(' '),
    };

    logs.push(newLog);
    
    // Keep only the last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
        logs.splice(0, logs.length - MAX_LOGS);
    }
    
    saveLogs(logs);
};

// Store original console methods
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
};

// Override console methods
console.log = (...args) => {
    addLog('log', args);
    originalConsole.log.apply(console, args);
};

console.warn = (...args) => {
    addLog('warn', args);
    originalConsole.warn.apply(console, args);
};

console.error = (...args) => {
    addLog('error', args);
    originalConsole.error.apply(console, args);
};

console.info = (...args) => {
    addLog('info', args);
    originalConsole.info.apply(console, args);
};

// Utility functions for managing logs
export const clearLogs = async () => {
    localStorage.removeItem(STORAGE_KEY);
    try {
        const response = await fetch('/api/logs', { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (e) {
        originalConsole.error('Error clearing logs:', e);
    }
};

export const downloadLogs = () => {
    const logs = getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cascade-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
