import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, remove, set, update } from 'firebase/database';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { ErrorMessageView } from './ErrorMessageView';
import { appointmentDetailsPath, klinicEmail, klinicName, userType1, userType2 } from '../global/global_variables';
import { useUserData } from '../hooks/useUserData';
import {
    convertKeysToSnakeCase,
    getCanceledEmailByPatient,
    getCanceledEmailFromPatient,
    getConfirmationEmailForDoctor,
    getConfirmationEmailForPatient,
    isUndefined,
    parsePrice,
    sendEmailNotificationUpdate,
} from '../global/global_methods';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import loadingImage from '../assets/placeholder-image.png';
import { BasicModal } from './BasicModal';

export function AppointmentItem({ appointmentItem, index, getAppointments }) {
    const navigate = useNavigate();
    const db = getDatabase();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [cancelModal, setCancelModal] = useState(false);
    const [approveModal, setApproveModal] = useState(false);

    const { userData } = useUserData();

    function goToAppointmentDetails() {
        navigate(appointmentDetailsPath, { state: { selectedAppointment: appointmentItem } });
    }

    async function cancelAppointmentForClinic() {
        // CANCEL APPOINTMENT

        const serviceName = appointmentItem.bookingDetails.serviceName;
        const duration = appointmentItem.bookingDetails.duration;
        const appointmentTime = appointmentItem.bookingDetails.slot.timestamp;

        const serviceId = appointmentItem.bookingDetails.serviceId;
        const slotId = appointmentItem.bookingDetails.slot.slotId;

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
            isUndefined(serviceId) ||
            isUndefined(slotId) ||
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
            return [false, 'Missing paramaters.'];
        }

        if (!patientEmail || !doctorEmail) {
            console.error('Missing recipient email:', { patientEmail, doctorEmail });
            return [false, 'Missing recipient email:'];
        }

        const messageForPatient = getCanceledEmailFromClinicForPatient(
            serviceName,
            doctorName,
            clinicName,
            duration,
            appointmentTime
        );

        const messageForDoctor = getCanceledEmailFromClinicForDoctor(
            serviceName,
            patientName,
            clinicName,
            duration,
            appointmentTime
        );

        let appointment = appointmentItem;
        appointment.completed = true;

        try {
            // APPEND TO COMPLETED RECORDS
            const completedAppointmentsRef = ref(db, `completed_appointments/${clinicId}/${appointmentId}`);
            await set(completedAppointmentsRef, convertKeysToSnakeCase(appointmentItem));

            // REMOVE FROM APPOINTMENTS
            const appointmentRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
            await remove(appointmentRef);

            // SET SLOT TO AVAILABLE AGAIN
            const slotRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}/available`);
            await set(slotRef, true);

            // SEND NOTIFICATION EMAIL TO PATIENT
            sendEmailNotificationUpdate(
                klinicEmail,
                patientEmail,
                klinicName,
                patientName,
                doctorEmail,
                doctorName,
                messageForPatient
            );

            // SEND NOTIFICATION EMAIL TO DOCTOR
            sendEmailNotificationUpdate(
                klinicEmail,
                doctorEmail,
                klinicName,
                doctorName,
                doctorEmail,
                doctorName,
                messageForDoctor
            );

            await getAppointments();
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    async function cancelAppointmentForPatient() {
        // CANCEL APPOINTMENT

        const serviceName = appointmentItem.bookingDetails.serviceName;
        const duration = appointmentItem.bookingDetails.duration;
        const appointmentTime = appointmentItem.bookingDetails.slot.timestamp;

        const serviceId = appointmentItem.bookingDetails.serviceId;
        const slotId = appointmentItem.bookingDetails.slot.slotId;

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
            isUndefined(serviceId) ||
            isUndefined(slotId) ||
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
            return [false, 'Missing paramaters.'];
        }

        if (!patientEmail || !doctorEmail) {
            console.error('Missing recipient email:', { patientEmail, doctorEmail });
            return [false, 'Missing recipient email:'];
        }

        const messageForPatient = getCanceledEmailByPatient(serviceName, doctorEmail, duration, appointmentTime);

        const messageForClinic = getCanceledEmailFromPatient(
            serviceName,
            patientName,
            doctorName,
            duration,
            appointmentTime
        );

        let appointment = appointmentItem;
        appointment.completed = true;

        try {
            // APPEND TO COMPLETED RECORDS
            const completedAppointmentsRef = ref(db, `completed_appointments/${clinicId}/${appointmentId}`);
            await set(completedAppointmentsRef, convertKeysToSnakeCase(appointmentItem));

            // REMOVE FROM APPOINTMENTS
            const appointmentRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
            await remove(appointmentRef);

            // SET SLOT TO AVAILABLE AGAIN
            const slotRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}/available`);
            await set(slotRef, true);

            // SEND NOTIFICATION EMAIL TO PATIENT
            sendEmailNotificationUpdate(
                klinicEmail,
                patientEmail,
                klinicName,
                patientName,
                doctorEmail,
                doctorName,
                messageForPatient
            );

            // SEND NOTIFICATION EMAIL TO ClINIC
            sendEmailNotificationUpdate(
                klinicEmail,
                clinicEmail,
                klinicName,
                clinicName,
                doctorEmail,
                doctorName,
                messageForClinic
            );

            // SEND NOTIFICATION EMAIL TO DOCTOR
            sendEmailNotificationUpdate(
                klinicEmail,
                doctorEmail,
                klinicName,
                doctorName,
                doctorEmail,
                doctorName,
                messageForClinic
            );

            await getAppointments();
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
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
            return [false, 'Missing parameters.'];
        }

        if (!patientEmail || !doctorEmail) {
            console.error('Missing recipient email:', { patientEmail, doctorEmail });
            return [false, 'Missing recipient email'];
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
                return [false, 'Unsuccessful operation.'];
            }

            // Email to Patient
            sendEmailNotificationUpdate(
                clinicEmail,
                patientEmail,
                clinicName,
                patientName,
                doctorEmail,
                doctorName,
                messagePatient
            );

            // // Email to Doctor
            sendEmailNotificationUpdate(
                clinicEmail,
                doctorEmail,
                clinicName,
                doctorName,
                doctorEmail,
                doctorName,
                messageDoctor
            );

            await getAppointments();
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    return (
        <div className="w-full flex flex-col md:flex-row px-4 md:px-10 py-4 md:py-2 gap-4 justify-center md:items-center md:justify-between bg-normal rounded-2xl">
            <section className="w-full flex gap-4 md:items-center md:justify-between">
                <div className="size-16 md:size-20 flex items-center">
                    <LazyLoadImage
                        className="size-full object-cover"
                        src={appointmentItem.bookingDetails.imageUrl}
                        alt="cart item image"
                        width={'100%'}
                        height={'100%'}
                        placeholderSrc={loadingImage}
                    />
                </div>

                <div className="w-full md:px-20 flex flex-col md:flex-row md:justify-between text-sm md:text-base">
                    {userData.userType === userType2 && (
                        <div className="flex justify-between">
                            <p className="flex md:hidden font-medium">Clinic name:</p>
                            <p>{appointmentItem.bookingDetails.clinicName}</p>
                        </div>
                    )}

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
                        <BasicModal
                            reason="approve"
                            customFunction={approveAppointment}
                            open={approveModal}
                            setOpen={setApproveModal}
                        />
                    )}

                    {userData?.userType === userType1 ? (
                        <BasicModal
                            reason="cancel"
                            customFunction={cancelAppointmentForClinic}
                            open={cancelModal}
                            setOpen={setCancelModal}
                        />
                    ) : (
                        <BasicModal
                            reason="cancel"
                            customFunction={cancelAppointmentForPatient}
                            open={cancelModal}
                            setOpen={setCancelModal}
                        />
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
