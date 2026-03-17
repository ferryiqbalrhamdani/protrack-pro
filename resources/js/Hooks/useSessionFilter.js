import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function useSessionFilter(key, initialValue) {
    const { auth } = usePage().props;
    const userId = auth?.user?.id || 'guest';
    const storageKey = `protrack_filter_${userId}_${key}`;

    // Read from session storage or use initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.sessionStorage.getItem(storageKey);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading sessionStorage', error);
            return initialValue;
        }
    });

    // Write to session storage whenever it changes
    useEffect(() => {
        try {
            if (storedValue === undefined || storedValue === null) {
                window.sessionStorage.removeItem(storageKey);
            } else {
                window.sessionStorage.setItem(storageKey, JSON.stringify(storedValue));
            }
        } catch (error) {
            console.error('Error writing to sessionStorage', error);
        }
    }, [storageKey, storedValue]);

    return [storedValue, setStoredValue];
}
