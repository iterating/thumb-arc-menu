/**
 * Unified UUID generation utility to ensure consistent UUID creation across the app
 */
import { uuidv7 } from 'uuidv7';

export const generateUuid = () => uuidv7();

/**
 * Validates if a string is a valid UUID
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} - True if valid UUID
 */
export const isValidUuid = (uuid) => {
    if (!uuid) return false;
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};
