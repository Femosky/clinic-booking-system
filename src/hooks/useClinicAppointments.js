import { get, getDatabase, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { convertKeysToCamelCase } from '../global/global_methods';
import { useUserData } from './useUserData';

export function useClinicAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userData } = useUserData();
    const db = getDatabase();

    async function getAppointments() {
        if (userData === null) {
            return;
        }

        try {
            const clinicId = userData.userId;

            if (clinicId === null) {
                return;
            }

            const appointmentRef = ref(db, `appointments/${clinicId}`);
            const snapshot = await get(appointmentRef);

            if (snapshot.exists()) {
                const data = snapshot.val();

                let tempAppointments = [];

                Object.keys(data).forEach((appointmentId) => {
                    const appointmentData = convertKeysToCamelCase(data[appointmentId]);
                    const appointment = {
                        appointmentId,
                        ...appointmentData,
                    };

                    tempAppointments.push(appointment);

                    console.log('DATA', snapshot.val());
                });

                setAppointments(tempAppointments);
                console.log('APPOINTMENTS', tempAppointments);
            } else {
                console.log('No appointments available for this user.');
                setError('No appointments available for this user.');
            }
        } catch (err) {
            console.log('Error getting all appointments: ', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function getPastAppointments() {
        if (userData === null) {
            return;
        }

        try {
            const clinicId = userData.userId;

            if (clinicId === null) {
                return;
            }

            const pastAppointmentRef = ref(db, `completed_appointments/${clinicId}`);
            const snapshot = await get(pastAppointmentRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(data);

                let tempAppointments = [];

                Object.keys(data).forEach((appointmentId) => {
                    const appointmentData = convertKeysToCamelCase(data[appointmentId]);
                    const appointment = {
                        appointmentId,
                        ...appointmentData,
                    };

                    tempAppointments.push(appointment);

                    console.log('DATA', snapshot.val());
                });

                setPastAppointments(tempAppointments);
                console.log('PAST APPOINTMENTS', tempAppointments);
            } else {
                console.log('No past appointments available for this user.');
                setError('No past appointments available for this user.');
            }
        } catch (err) {
            console.log('Error getting all past appointments: ', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAppointments();
    }, [db, userData]);

    useEffect(() => {
        getPastAppointments();
    }, [db, userData]);

    return { appointments, pastAppointments, getAppointments, getPastAppointments, loading, error };
}
