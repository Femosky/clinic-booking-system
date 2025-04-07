import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { convertKeysToCamelCase } from '../global/global_methods';

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
                        let servicesArray = Object.keys(servicesForClinic).map((serviceId) => {
                            const service = {
                                id: serviceId,
                                clinicId, // include the clinic id for reference
                                ...convertKeysToCamelCase(servicesForClinic[serviceId]),
                            };

                            // EXCLUDE INVALID SERVICES: services that all slots are now not available or equal to false
                            let invalidCount = 0;

                            let slots = Object.values(service.slots);

                            slots.forEach((slot) => {
                                if (slot.available === false) {
                                    invalidCount += 1;
                                }
                            });

                            if (invalidCount < slots.length) {
                                return service;
                            } else {
                                return null;
                            }
                        });

                        servicesArray = servicesArray.filter((service) => service !== null);
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
