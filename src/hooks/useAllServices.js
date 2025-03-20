import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useAllServices() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const db = getDatabase();

    useEffect(() => {
        const clinicsRef = ref(db, 'services');
        const unsubscribe = onValue(
            clinicsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    let clinicsArray = [];

                    // Loop through each clinic
                    Object.keys(data).forEach((clinicId) => {
                        // Grab the clinic id
                        const servicesForClinic = data[clinicId];

                        // Convert the services object into an array
                        const servicesArray = Object.keys(servicesForClinic).map((serviceId) => ({
                            id: serviceId,
                            clinicId, // include the clinic id for reference
                            ...servicesForClinic[serviceId],
                        }));

                        clinicsArray.push(servicesArray);
                    });

                    setClinics(clinicsArray);
                } else {
                    setClinics([]);
                }
                setLoading(false);
            },
            (error) => {
                setError(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db]);

    return { clinics, loading, error };
}
