import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { get, getDatabase, ref } from 'firebase/database';
import heart from '../assets/image 5.png';
import pen from '../assets/pencil-5824 5.png';
// import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { ErrorMessageView } from './ErrorMessageView';
import { appointmentDetailsPath, bookingPath } from '../global/global_variables';

export function AppointmentItem({ appointmentItem, index }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function goToAppointmentDetails() {
        navigate(appointmentDetailsPath, { state: { selectedAppointment: appointmentItem } });
    }

    async function cancelAppointment() {
        // CANCEL APPOINTMENT
    }

    async function approveAppointment() {
        // CANCEL APPOINTMENT
    }

    // async function handleGetService(index) {
    //     const clinicId = appointmentItem.bookingDetails.clinic_id;
    //     const serviceId = appointmentItem.bookingDetails.service_id;

    //     if (!clinicId || !serviceId) {
    //         setError('Clinic or service ID missing');
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         const db = getDatabase();
    //         const serviceRef = ref(db, `services/${clinicId}/${serviceId}`);
    //         const snapshot = await get(serviceRef);

    //         if (snapshot.exists()) {
    //             return {
    //                 id: serviceId,
    //                 clinicId,
    //                 index,
    //                 ...snapshot.val(),
    //             };
    //         } else {
    //             console.log('Unable to get service');
    //             setError('Appointment not available');
    //         }
    //     } catch (err) {
    //         setError(err.message);
    //         console.log(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    return (
        <div className="w-full flex px-10 py-2 items-center justify-between bg-normal rounded-2xl">
            <section className="">
                <img className="w-20" src={heart} alt="cart item icon" />
            </section>

            <section className="w-full px-20 flex justify-between">
                <p>{appointmentItem.bookingDetails.serviceName}</p>
                <p>{appointmentItem.bookingDetails.doctor}</p>
                <p>${parseFloat(appointmentItem.bookingDetails.price).toFixed(2)}</p>
            </section>

            <section className="flex items-center gap-5 w-fit">
                <Button className="h-full" variant="dark" onClick={goToAppointmentDetails}>
                    VIEW
                </Button>

                {!appointmentItem.confirm && (
                    <Button className="h-full" variant="border_1" onClick={approveAppointment}>
                        APPROVE
                    </Button>
                )}

                <Button className="h-full" variant="hot" onClick={cancelAppointment}>
                    CANCEL
                </Button>
            </section>
            <ErrorMessageView error={error} />
        </div>
    );
}

AppointmentItem.propTypes = {
    appointmentItem: PropTypes.object,
    index: PropTypes.number.isRequired,
};
