import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { convertKeysToCamelCase } from '../global/global_methods';

export function useUserData() {
    const [user] = useAuthState(auth);

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDataError, setUserDataError] = useState('');

    const db = getDatabase();

    useEffect(() => {
        async function fetchUserData() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const clinicRef = ref(db, `clinics/${user.uid}`);
                const clinicSnapshot = await get(clinicRef);
                if (clinicSnapshot.exists()) {
                    const clinicData = convertKeysToCamelCase(clinicSnapshot.val());
                    setUserData({ ...clinicData });
                } else {
                    const patientRef = ref(db, `patients/${user.uid}`);
                    const patientSnapshot = await get(patientRef);
                    if (patientSnapshot.exists()) {
                        const patientData = convertKeysToCamelCase(patientSnapshot.val());
                        setUserData({ ...patientData });
                    } else {
                        setUserData(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUserDataError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [user, db]);

    return { userData, userDataError, loading };
}
