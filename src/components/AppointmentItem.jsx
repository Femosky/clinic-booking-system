import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { get, getDatabase, push, ref, update } from 'firebase/database';
import heart from '../assets/image 5.png';
import pen from '../assets/pencil-5824 5.png';
// import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { ErrorMessageView } from './ErrorMessageView';
import { appointmentDetailsPath, bookingPath, userType1 } from '../global/global_variables';
import { useUserData } from '../hooks/useUserData';
import {
    getConfirmationEmailForDoctor,
    getConfirmationEmailForPatient,
    isUndefined,
    parsePrice,
    sendEmailNotificationUpdate,
} from '../global/global_methods';
import { useClinicAppointments } from '../hooks/useClinicAppointments';

export function AppointmentItem({ appointmentItem, index, getAppointments }) {
    const navigate = useNavigate();
    const db = getDatabase();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { userData } = useUserData();

    function goToAppointmentDetails() {
        navigate(appointmentDetailsPath, { state: { selectedAppointment: appointmentItem } });
    }

    async function cancelAppointmentForClinic() {
        // CANCEL APPOINTMENT
    }

    async function cancelAppointmentForPatient() {
        // CANCEL APPOINTMENT
    }

    async function approveAppointment() {
        // APPROVE APPOINTMENT

        const serviceName = appointmentItem.bookingDetails.serviceName;
        const duration = appointmentItem.bookingDetails.duration;
        const appointmentTime = appointmentItem.bookingDetails.slot.timestamp;

        const clinicId = userData.userId;
        const appointmentId = appointmentItem.appointmentId;

        const clinicEmail = userData.email;
        const patientEmail = appointmentItem.patientData.email;

        const clinicName = userData.name;
        const patientName = appointmentItem.patientData.fullname;

        const doctorEmail = appointmentItem.bookingDetails.doctorEmail;
        const doctorName = appointmentItem.bookingDetails.doctor;

        setError('');

        if (
            isUndefined(serviceName) ||
            isUndefined(duration) ||
            isUndefined(appointmentTime) ||
            isUndefined(clinicId) ||
            isUndefined(appointmentId) ||
            isUndefined(clinicEmail) ||
            isUndefined(patientEmail) ||
            isUndefined(clinicName) ||
            isUndefined(patientName) ||
            isUndefined(doctorEmail) ||
            isUndefined(doctorName)
        ) {
            console.log('Missing paramaters.');
            setError('Missing paramaters.');
            return;
        }

        if (!patientEmail || !doctorEmail) {
            console.error('Missing recipient email:', { patientEmail, doctorEmail });
            return;
        }

        const messagePatient = getConfirmationEmailForPatient(
            serviceName,
            doctorName,
            clinicName,
            duration,
            appointmentTime
        );

        const messageDoctor = getConfirmationEmailForDoctor(
            serviceName,
            patientName,
            clinicName,
            duration,
            appointmentTime
        );

        try {
            const appointmentsRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
            const result = await update(appointmentsRef, { confirmed: true });
            if (result === null) {
                return;
            }

            // Email to Patient
            const resultPatient = sendEmailNotificationUpdate(
                clinicEmail,
                patientEmail,
                clinicName,
                patientName,
                doctorEmail,
                doctorName,
                messagePatient
            );

            // // Email to Doctor
            const resultDoctor = sendEmailNotificationUpdate(
                clinicEmail,
                doctorEmail,
                clinicName,
                doctorName,
                doctorEmail,
                doctorName,
                messageDoctor
            );

            console.log('PATIENT', resultPatient);
            console.log('DOCTOR', resultDoctor);

            await getAppointments();
        } catch (err) {
            console.log(err.message);
            setError(err.message);
        }
    }

    return (
        <div className="w-full flex flex-col md:flex-row px-4 md:px-10 py-4 md:py-2 gap-4 justify-center md:items-center md:justify-between bg-normal rounded-2xl">
            <section className="w-full flex gap-4 md:items-center md:justify-between">
                <div className="flex items-center">
                    <img className="min-w-16 w-20" src={heart} alt="cart item icon" />
                </div>

                <div className="w-full md:px-20 flex flex-col md:flex-row md:justify-between text-sm md:text-base">
                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Service:</p>
                        <p>{appointmentItem.bookingDetails.serviceName}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Doctor:</p>
                        <p>{appointmentItem.bookingDetails.doctor}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Patient:</p>
                        <p>{appointmentItem.patientData.fullname}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Price:</p>
                        <p>${parsePrice(appointmentItem.bookingDetails.price)}</p>
                    </div>
                </div>
            </section>

            {error && <ErrorMessageView error={error} />}

            {appointmentItem.pastAppointment !== null && (
                <section className="flex items-center place-self-center gap-5 w-fit">
                    <Button className="h-full" variant="dark" onClick={goToAppointmentDetails}>
                        VIEW
                    </Button>

                    {userData?.userType === userType1 && !appointmentItem.confirmed && (
                        <Button className="h-full" variant="border_1" onClick={approveAppointment}>
                            APPROVE
                        </Button>
                    )}

                    {userData?.userType === userType1 ? (
                        <Button className="h-full" variant="hot" onClick={cancelAppointmentForClinic}>
                            CANCEL
                        </Button>
                    ) : (
                        <Button className="h-full" variant="hot" onClick={cancelAppointmentForPatient}>
                            CANCEL
                        </Button>
                    )}
                </section>
            )}
            {error && <ErrorMessageView className="text-center md:text-start" error={error} />}
        </div>
    );
}

AppointmentItem.propTypes = {
    appointmentItem: PropTypes.object,
    index: PropTypes.number.isRequired,
    getAppointments: PropTypes.func,
};
