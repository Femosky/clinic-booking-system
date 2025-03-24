import { get, getDatabase, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { createContext } from 'react';
import { convertKeysToCamelCase } from '../global/global_methods';
import { auth } from '../firebase/firebase';
import PropTypes from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';

const UserDataContext = createContext();

export function UserDataProvider({ children }) {
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
                console.log('RAN');
                const userId = user.uid;
                const clinicRef = ref(db, `clinics/${userId}`);
                const clinicSnapshot = await get(clinicRef);
                if (clinicSnapshot.exists()) {
                    const clinicData = convertKeysToCamelCase(clinicSnapshot.val());
                    const tempUserData = {
                        userId,
                        ...clinicData,
                    };
                    setUserData(tempUserData);
                } else {
                    const patientRef = ref(db, `patients/${user.uid}`);
                    const patientSnapshot = await get(patientRef);
                    if (patientSnapshot.exists()) {
                        const patientData = convertKeysToCamelCase(patientSnapshot.val());
                        const tempUserData = {
                            userId,
                            ...patientData,
                        };
                        setUserData(tempUserData);
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

    return (
        <UserDataContext.Provider value={{ userData, setUserData, userDataError, loading }}>
            {children}
        </UserDataContext.Provider>
    );
}

UserDataProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { UserDataContext };
