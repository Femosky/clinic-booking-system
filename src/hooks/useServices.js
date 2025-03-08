import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useServices(clinicId) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const db = getDatabase();

    useEffect(() => {
        if (!clinicId) {
            setLoading(false);
            return;
        }

        const servicesRef = ref(db, `clinics/${clinicId}/services`);
        // Subscribe to changes using onValue
        const unsubscribe = onValue(
            servicesRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    // Convert the object to an array of service objects
                    const servicesArray = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setServices(servicesArray);
                } else {
                    setServices([]);
                }
                setLoading(false);
            },
            (error) => {
                setError(error);
                setLoading(false);
            }
        );

        console.log();
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [clinicId, db]);

    return { services, loading, error };
}
