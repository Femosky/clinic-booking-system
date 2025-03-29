import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { useEffect, useState } from 'react';
import { userType1, userType2 } from '../global/global_variables';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { Title2 } from '../components/Title2';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { PageTitle } from '../components/PageTitle';
import {
    convertUnixToDateObject,
    formatToDayDateMonthYear,
    formatToTime,
    getConfirmationEmailForDoctor,
    getConfirmationEmailForPatient,
    isUndefined,
    sendEmailNotificationUpdate,
} from '../global/global_methods';
import { get, getDatabase, push, ref, update } from 'firebase/database';
import { set } from 'date-fns';

export function AppointmentDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const db = getDatabase();

    const { selectedAppointment } = location.state || {};

    const { userData } = useUserData();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [completed, setCompleted] = useState(false);

    async function cancelAppointmentForClinic() {
        // CANCEL APPOINTMENT
    }

    async function cancelAppointmentForPatient() {
        // CANCEL APPOINTMENT
    }

    async function handleMarkAsCompleted() {
        const appointmentId = selectedAppointment.appointmentId;
        const clinicId = selectedAppointment.bookingDetails.clinicId;

        if (isUndefined(appointmentId) || isUndefined(clinicId)) {
            setError('Missing parameters.');
            return;
        }

        try {
            const pastAppointmentsRef = ref(db, `completed_appointments`);

            const data = {
                appointment_id: appointmentId,
                clinic_id: clinicId,
                timestamp: Date.now(),
            };

            const result = await push(pastAppointmentsRef, data);

            if (result === null) {
                console.log('Mark as completed failed.');
                setError('Mark as completed failed.');
            } else {
                setCompleted(true);
            }
        } catch (err) {
            console.log(err.message);
            setError(err.message);
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

            // MARK AS APPROVED
            setSuccess(true);
        } catch (err) {
            console.log(err.message);
            setError(err.message);
        }
    }

    useEffect(() => {
        console.log(selectedAppointment);
    }, [selectedAppointment]);

    useEffect(() => {
        if (!selectedAppointment || userData === null) {
            // Navigate back to the previous page
            console.log(selectedAppointment);
            // navigate(-1);
        }
    }, [userData, navigate, selectedAppointment]);

    if (!selectedAppointment || userData === null) {
        return <LogoLoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-5">
            <BackButton />

            <PageTitle className="text-center text-2xl sm:text-4xl" pageTitle="Appointment Details" />

            <div className="w-full flex flex-col gap-20 text-sm md:text-lg">
                <main className="w-full flex flex-col gap-5">
                    <section className="w-full">
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
                    </section>
                    <section className="w-full">
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
                    </section>
                    <section className="w-full">
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
                    </section>
                </main>

                {selectedAppointment.pastAppointment !== null && (
                    <section className="flex place-self-center md:place-self-end gap-2">
                        {!completed && userData?.userType === userType1 && (
                            <Button onClick={cancelAppointmentForClinic} className="text-sm sm:text-base" variant="hot">
                                CANCEL
                            </Button>
                        )}

                        {!completed && userData?.userType === userType2 && (
                            <Button
                                onClick={cancelAppointmentForPatient}
                                className="text-sm sm:text-base"
                                variant="hot"
                            >
                                CANCEL
                            </Button>
                        )}

                        {!success && userData?.userType === userType1 && selectedAppointment.confirmed === false && (
                            <Button onClick={approveAppointment} variant="dark">
                                APPROVE
                            </Button>
                        )}

                        {success && (
                            <Button disabled className="cursor-default" variant="dark">
                                CONFIRMED
                            </Button>
                        )}

                        {!completed && userData?.userType === userType1 && selectedAppointment.confirmed && (
                            <Button
                                onClick={handleMarkAsCompleted}
                                className="text-sm sm:text-base"
                                variant={selectedAppointment.completed ? 'dark' : 'default'}
                            >
                                {selectedAppointment.completed ? 'COMPLETED' : 'MARK AS COMPLETED'}
                            </Button>
                        )}

                        {completed && (
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
