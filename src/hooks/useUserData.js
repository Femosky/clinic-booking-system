import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';

export function useUserData() {
    const [user] = useAuthState(auth);
    const [userType, setUserType] = useState(false);

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDataError, setUserDataError] = useState('');

    const db = getDatabase();

    function toggleUserType() {
        setUserType(!userType);
    }

    useEffect(() => {
        async function fetchUserData() {
            console.log('got here?');

            if (!user) {
                setLoading(false);
                return;
            }

            console.log('got here2?');
            try {
                const clinicRef = ref(db, `clinics/${user.uid}`);
                const clinicSnapshot = await get(clinicRef);
                if (clinicSnapshot.exists()) {
                    setUserData({ ...clinicSnapshot.val(), type: 'clinic' });
                    console.log('USERDATA:', userData);
                } else {
                    const patientRef = ref(db, `patients/${user.uid}`);
                    const patientSnapshot = await get(patientRef);
                    if (patientSnapshot.exists()) {
                        setUserData({ ...patientSnapshot.val(), type: 'patient' });
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

    return { userData, userDataError, loading, userType, toggleUserType };
}
