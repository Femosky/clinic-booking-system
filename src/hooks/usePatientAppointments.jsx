import { get, getDatabase, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { convertKeysToCamelCase } from '../global/global_methods';
import { useUserData } from './useUserData';

export function usePatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userData } = useUserData();
    const db = getDatabase();

    useEffect(() => {
        async function getAppointments() {
            if (userData === null) {
                return;
            }

            try {
                const patientId = userData.userId;

                if (patientId === null) {
                    return;
                }

                const appointmentPointerRef = ref(db, `patients/${patientId}/appointments`);
                const snapshot = await get(appointmentPointerRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();

                    let tempAppointmentPointers = [];
                    Object.keys(data).forEach((appointmentId) => {
                        const appointmentData = convertKeysToCamelCase(data[appointmentId]);
                        const appointment = {
                            appointmentId,
                            ...appointmentData,
                        };
                        tempAppointmentPointers.push(appointment);
                    });

                    // Fetch all appointment details concurrently
                    const tempAppointments = await Promise.all(
                        tempAppointmentPointers.map(async (appointmentPointer) => {
                            const clinicId = appointmentPointer.clinicId;
                            const appointmentId = appointmentPointer.appointmentId;
                            const appointmentRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
                            const appointmentSnapshot = await get(appointmentRef);

                            if (appointmentSnapshot.exists()) {
                                return {
                                    appointmentId,
                                    ...convertKeysToCamelCase(appointmentSnapshot.val()),
                                };
                            } else {
                                console.log('User appointment not found.');
                                return null;
                            }
                        })
                    );

                    // Remove null values in case some appointments weren't found
                    setAppointments(tempAppointments.filter((appointment) => appointment !== null));
                } else {
                    console.log('No appointments records available for this user.');
                    setError('No appointments records available for this user.');
                }
            } catch (err) {
                console.log('Error getting all appointments: ', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        getAppointments();
    }, [db, userData]);

    return { appointments, loading, error };
}
