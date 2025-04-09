import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { useEffect, useState } from 'react';
import { dashboardPath, klinicEmail, klinicName, userType1, userType2 } from '../global/global_variables';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { Title2 } from '../components/Title2';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { PageTitle } from '../components/PageTitle';
import {
    convertKeysToSnakeCase,
    formatToDayDateMonthYear,
    formatToTime,
    getCanceledEmailByPatient,
    getCanceledEmailFromClinicForDoctor,
    getCanceledEmailFromClinicForPatient,
    getCanceledEmailFromPatient,
    getConfirmationEmailForDoctor,
    getConfirmationEmailForPatient,
    isUndefined,
    sendEmailNotificationUpdate,
} from '../global/global_methods';
import { getDatabase, ref, remove, set, update } from 'firebase/database';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import loadingImage from '../assets/placeholder-image.png';
import { BasicModal } from '../components/BasicModal';

export function AppointmentDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const db = getDatabase();

    const { selectedAppointment } = location.state || {};

    const { userData } = useUserData();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [completed, setCompleted] = useState(false);

    const [cancelModal, setCancelModal] = useState(false);
    const [approveModal, setApproveModal] = useState(false);
    const [completedModal, setCompletedModal] = useState(false);

    async function cancelAppointmentForClinic() {
        // CANCEL APPOINTMENT

        const serviceName = selectedAppointment.bookingDetails.serviceName;
        const duration = selectedAppointment.bookingDetails.duration;
        const appointmentTime = selectedAppointment.bookingDetails.slot.timestamp;

        const serviceId = selectedAppointment.bookingDetails.serviceId;
        const slotId = selectedAppointment.bookingDetails.slot.slotId;

        const clinicId = selectedAppointment.bookingDetails.clinicId;
        const appointmentId = selectedAppointment.appointmentId;

        const clinicEmail = selectedAppointment.bookingDetails.clinicEmail;
        const patientEmail = selectedAppointment.patientData.email;
        const patientId = selectedAppointment.bookedBy.userId;

        const clinicName = selectedAppointment.bookingDetails.clinicName;
        const patientName = selectedAppointment.patientData.fullname;

        const doctorEmail = selectedAppointment.bookingDetails.doctorEmail;
        const doctorName = selectedAppointment.bookingDetails.doctor;

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
            isUndefined(patientId) ||
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

        let appointment = selectedAppointment;
        appointment.completed = true;

        try {
            // APPEND TO COMPLETED RECORDS
            const completedAppointmentsRef = ref(db, `completed_appointments/${clinicId}/${appointmentId}`);
            await set(completedAppointmentsRef, convertKeysToSnakeCase(selectedAppointment));

            const userCompletedRecordRef = ref(db, `patients/${patientId}/completed_appointments/${appointmentId}`);
            await set(userCompletedRecordRef, {
                clinic_id: clinicId,
                timestamp: Date.now(),
            });

            // REMOVE FROM APPOINTMENTS
            const appointmentRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
            await remove(appointmentRef);

            const userAppointmentRecordRef = ref(db, `patients/${patientId}/appointments/${appointmentId}`);
            await remove(userAppointmentRecordRef);

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

            setTimeout(() => {
                navigate(dashboardPath);
            }, 1000);
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    async function cancelAppointmentForPatient() {
        // CANCEL APPOINTMENT

        const serviceName = selectedAppointment.bookingDetails.serviceName;
        const duration = selectedAppointment.bookingDetails.duration;
        const appointmentTime = selectedAppointment.bookingDetails.slot.timestamp;

        const serviceId = selectedAppointment.bookingDetails.serviceId;
        const slotId = selectedAppointment.bookingDetails.slot.slotId;

        const clinicId = selectedAppointment.bookingDetails.clinicId;
        const appointmentId = selectedAppointment.appointmentId;

        const clinicEmail = selectedAppointment.bookingDetails.clinicEmail;
        const patientEmail = selectedAppointment.patientData.email;
        const patientId = selectedAppointment.bookedBy.userId;

        const clinicName = selectedAppointment.bookingDetails.clinicName;
        const patientName = selectedAppointment.patientData.fullname;

        const doctorEmail = selectedAppointment.bookingDetails.doctorEmail;
        const doctorName = selectedAppointment.bookingDetails.doctor;

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
            isUndefined(patientId) ||
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

        let appointment = selectedAppointment;
        appointment.completed = true;

        try {
            // APPEND TO COMPLETED RECORDS
            const completedAppointmentsRef = ref(db, `completed_appointments/${clinicId}/${appointmentId}`);
            await set(completedAppointmentsRef, convertKeysToSnakeCase(selectedAppointment));

            const userCompletedRecordRef = ref(db, `patients/${patientId}/completed_appointments/${appointmentId}`);
            await set(userCompletedRecordRef, {
                clinic_id: clinicId,
                timestamp: Date.now(),
            });

            // REMOVE FROM APPOINTMENTS
            const appointmentRef = ref(db, `appointments/${clinicId}/${appointmentId}`);
            await remove(appointmentRef);

            const userAppointmentRecordRef = ref(db, `patients/${patientId}/appointments/${appointmentId}`);
            await remove(userAppointmentRecordRef);

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

            setTimeout(() => {
                navigate(dashboardPath);
            }, 3000);
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    async function handleMarkAsCompleted() {
        const appointmentId = selectedAppointment.appointmentId;
        const clinicId = selectedAppointment.bookingDetails.clinicId;

        if (isUndefined(appointmentId) || isUndefined(clinicId)) {
            setError('Missing parameters.');
            return [false, 'Missing parameters.'];
        }

        try {
            const pastAppointmentsRef = ref(db, `completed_appointments/${clinicId}/${appointmentId}`);

            const data = {
                clinic_id: clinicId,
                timestamp: Date.now(),
            };

            const result = await set(pastAppointmentsRef, data);

            if (result === null) {
                console.log('Mark as completed failed.');
                setError('Mark as completed failed.');
                return [false, 'Mark as completed failed.'];
            } else {
                setCompleted(true);
                selectedAppointment.completed = true;
                return [true, ''];
            }
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    async function approveAppointment() {
        // APPROVE APPOINTMENT

        const serviceName = selectedAppointment.bookingDetails.serviceName;
        const duration = selectedAppointment.bookingDetails.duration;
        const appointmentTime = selectedAppointment.bookingDetails.slot.timestamp;

        const clinicId = userData.userId;
        const appointmentId = selectedAppointment.appointmentId;

        const clinicEmail = userData.email;
        const patientEmail = selectedAppointment.patientData.email;

        const clinicName = userData.name;
        const patientName = selectedAppointment.patientData.fullname;

        const doctorEmail = selectedAppointment.bookingDetails.doctorEmail;
        const doctorName = selectedAppointment.bookingDetails.doctor;

        setError('');

        console.log(serviceName);
        console.log(duration);
        console.log(appointmentTime);
        console.log(clinicId);
        console.log(appointmentId);
        console.log(clinicEmail);
        console.log(patientEmail);
        console.log(clinicName);
        console.log(patientName);
        console.log(doctorEmail);
        console.log(doctorName);

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
            return [false, 'Missing recipient email.'];
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
                return [false, 'Confirming appointment failed'];
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

            // MARK AS APPROVED
            setSuccess(true);
            return [true, ''];
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return [false, err.message];
        }
    }

    useEffect(() => {
        if (!selectedAppointment || userData === null) {
            // Navigate back to the previous page
            navigate(-1);
        }
    }, [userData, navigate, selectedAppointment]);

    if (!selectedAppointment || userData === null) {
        return <LogoLoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-5">
            <BackButton />

            <PageTitle className="text-center text-2xl sm:text-4xl" pageTitle="Appointment Details" />

            <div className="w-full flex-col gap-20 text-sm md:text-lg">
                <main className="w-full flex flex-col md:flex-row gap-5">
                    <section className="w-[10rem] md:w-[15rem] h-[10rem] md:h-[15rem] place-self-center md:place-self-start">
                        <LazyLoadImage
                            className="w-full h-full object-cover"
                            src={selectedAppointment.bookingDetails.imageUrl}
                            alt="service image"
                            width={'100%'}
                            height={'100%'}
                            placeholderSrc={loadingImage}
                        />
                    </section>
                    <section className="w-2/3">
                        <div className="w-full">
                            <Title2 title="Patient Details" />
                            <div className="w-full py-5">
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Full name:</p>
                                    <p className="w-5/7">{selectedAppointment.patientData.fullname}</p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Phone number:</p>
                                    <p className="w-5/7">{selectedAppointment.patientData.phoneNumber}</p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Email address:</p>
                                    <p className="w-5/7">{selectedAppointment.patientData.email}</p>
                                </div>
                                {selectedAppointment.patientData.additionalNotes !== null &&
                                    selectedAppointment.patientData.additionalNotes.length > 0 && (
                                        <div className="w-full flex gap-10 justify-between">
                                            <p className="w-2/7 min-w-[7rem] font-medium">Additional notes:</p>
                                            <p className="w-5/7">{selectedAppointment.patientData.additionalNotes}</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                        <div className="w-full">
                            <Title2 title="Appointment Details" />

                            <div className="w-full py-5">
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Clinic name:</p>
                                    <p className="w-5/7">{selectedAppointment.bookingDetails.clinicName}</p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Service name:</p>
                                    <p className="w-5/7">{selectedAppointment.bookingDetails.serviceName}</p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Doctor:</p>
                                    <p className="w-5/7">{selectedAppointment.bookingDetails.doctor}</p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Price:</p>
                                    <p className="w-5/7">
                                        ${parseFloat(selectedAppointment.bookingDetails.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <Title2 title="Slot" />
                            <div className="w-full py-5">
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Date:</p>
                                    <p className="w-5/7">
                                        {formatToDayDateMonthYear(selectedAppointment.bookingDetails.slot.timestamp)}
                                    </p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Time:</p>
                                    <p className="w-5/7">
                                        {formatToTime(selectedAppointment.bookingDetails.slot.timestamp)}
                                    </p>
                                </div>
                                <div className="w-full flex gap-10 justify-between">
                                    <p className="w-2/7 min-w-[7rem] font-medium">Address:</p>
                                    <p className="w-5/7">{selectedAppointment.bookingDetails.clinicAddress}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* BUTTONS */}
                {selectedAppointment.pastAppointment !== null && (
                    <section className="flex place-self-center md:place-self-end gap-2">
                        {userData?.userType === userType1 && !selectedAppointment.completed && (
                            <BasicModal
                                reason="cancel"
                                customFunction={cancelAppointmentForClinic}
                                open={cancelModal}
                                setOpen={setCancelModal}
                            />
                        )}

                        {userData?.userType === userType2 && !selectedAppointment.completed && (
                            <BasicModal
                                reason="cancel"
                                customFunction={cancelAppointmentForPatient}
                                open={cancelModal}
                                setOpen={setCancelModal}
                            />
                        )}

                        {userData?.userType === userType1 &&
                            selectedAppointment.confirmed === false &&
                            !selectedAppointment.completed &&
                            !success && (
                                <BasicModal
                                    reason="approve"
                                    customFunction={approveAppointment}
                                    open={approveModal}
                                    setOpen={setApproveModal}
                                />
                            )}

                        {!selectedAppointment.completed && success && (
                            <Button disabled className="cursor-default" variant="dark">
                                CONFIRMED
                            </Button>
                        )}

                        {userData?.userType === userType1 &&
                            selectedAppointment.confirmed &&
                            !selectedAppointment.completed && (
                                <BasicModal
                                    reason="mark as completed"
                                    customFunction={handleMarkAsCompleted}
                                    open={completedModal}
                                    setOpen={setCompletedModal}
                                />
                            )}

                        {selectedAppointment.completed && (
                            <Button disabled className="cursor-default" variant="dark">
                                COMPLETED
                            </Button>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
