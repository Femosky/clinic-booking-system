import { useLocation, useNavigate } from 'react-router-dom';
import { useUserData } from '../hooks/useUserData';
import { useEffect } from 'react';
import { userType2 } from '../global/global_variables';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { Title2 } from '../components/Title2';
import { Button } from '../components/Button';

export function AppointmentDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    const { selectedAppointment } = location.state || {};

    const { userData } = useUserData();

    useEffect(() => {
        if (!selectedAppointment || (userData !== null && userData.userType === userType2)) {
            // Navigate back to the previous page
            navigate(-1);
        }
    }, [userData, navigate, selectedAppointment]);

    if (userData === null || !selectedAppointment) {
        return <LogoLoadingScreen />;
    }

    if (userData.userType === userType2) {
        return <LogoLoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-20">
            <main className="w-full flex flex-col gap-5 text-lg">
                <section>
                    <Title2 title="Patient Details" />
                    <div className="max-w-[40rem] py-5">
                        <div className="flex justify-between">
                            <p className="font-medium">Full name:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.patientData.fullname}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">Phone number:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.patientData.phoneNumber}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">Email address:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.patientData.email}</p>
                        </div>
                        {selectedAppointment.patientData.additionalNotes !== null &&
                            selectedAppointment.patientData.additionalNotes.length > 0 && (
                                <div className="flex justify-between">
                                    <p className="font-medium">Additional notes:</p>
                                    <p className="min-w-[20rem]">{selectedAppointment.patientData.additionalNotes}</p>
                                </div>
                            )}
                    </div>
                </section>
                <section>
                    <Title2 title="Appointment Details" />

                    <div className="max-w-[40rem] py-5">
                        <div className="flex justify-between">
                            <p className="font-medium">Service name:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.bookingDetails.serviceName}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">Doctor:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.bookingDetails.doctor}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">Price:</p>
                            <p className="min-w-[20rem]">
                                ${parseFloat(selectedAppointment.bookingDetails.price).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </section>
                <section>
                    <Title2 title="Slot" />
                    <div className="max-w-[40rem] py-5">
                        <div className="flex justify-between">
                            <p className="font-medium">Date:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.bookingDetails.slot.date}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">Time:</p>
                            <p className="min-w-[20rem]">{selectedAppointment.bookingDetails.slot.time}</p>
                        </div>
                    </div>
                </section>
            </main>

            <section className="flex place-self-end gap-2">
                <Button variant="hot">CANCEL</Button>
                {!selectedAppointment.confirmed && <Button variant="dark">CONFIRM</Button>}
            </section>
        </div>
    );
}
