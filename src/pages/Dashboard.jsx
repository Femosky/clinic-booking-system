import { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorMessageView } from '../components/ErrorMessageView';
import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { PageTitle } from '../components/PageTitle';
import { dashboardTitle, userType1 } from '../global/global_variables';
import { Title2 } from '../components/Title2';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/CartItem';
import { AppointmentItem } from '../components/AppointmentItem';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useClinicAppointments } from '../hooks/useClinicAppointments';

export function Dashboard() {
    const { userData } = useUserData();

    return (
        <div className="w-full flex flex-col gap-5">
            <PageTitle pageTitle={dashboardTitle} />
            {userData != null && userData.userType == userType1 ? <ClinicDashboardView /> : <PatientDashboardView />}
        </div>
    );
}

function ClinicDashboardView() {
    const [totalAppointments, setTotalAppointments] = useState(0);
    const { appointments, pastAppointments, loading } = useClinicAppointments();

    const [selectedItem, setSelectedItem] = useState(0);

    const [confirmedAppointments, setConfirmedAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);

    useEffect(() => {
        if (loading) {
            return;
        }

        let tempConfirmedAppointments = [];
        let tempPendingAppointments = [];
        appointments.forEach((appointment) => {
            if (appointment.confirmed) {
                tempConfirmedAppointments.push(appointment);
            } else {
                tempPendingAppointments.push(appointment);
            }
        });

        setConfirmedAppointments(tempConfirmedAppointments);
        setPendingAppointments(tempPendingAppointments);
    }, [appointments, loading]);

    useEffect(() => {
        function calculateTotalAppointments() {
            setTotalAppointments(appointments.length + pastAppointments.length);
        }

        calculateTotalAppointments();
        console.log('TOTAL APOINTE', appointments.length);
    }, [appointments, pastAppointments]);

    return (
        <div className="flex flex-col gap-10">
            <ClinicSummaryView
                totalAppointments={totalAppointments}
                setTotalAppointments={setTotalAppointments}
                appointments={appointments}
                pastAppointments={pastAppointments}
                confirmedAppointments={confirmedAppointments}
                pendingAppointments={pendingAppointments}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
            />
            <ClinicAppointmentsView
                totalAppointments={totalAppointments}
                setTotalAppointments={setTotalAppointments}
                appointments={appointments}
                pastAppointments={pastAppointments}
                confirmedAppointments={confirmedAppointments}
                pendingAppointments={pendingAppointments}
                selectedItem={selectedItem}
            />
        </div>
    );
}

function ClinicSummaryView({
    totalAppointments,
    setTotalAppointments,
    appointments,
    pastAppointments,
    confirmedAppointments,
    pendingAppointments,
    selectedItem,
    setSelectedItem,
}) {
    const [numberOfConfirmedAppointments, setNumberOfConfirmedAppointments] = useState(0);
    const [numberOfPendingAppointments, setNumberOfPendingAppointments] = useState(0);

    const items = ['All Appointments', 'Confirmed Appointments', 'Pending Appointments'];

    const [firstItem, setFirstItem] = useState(true);
    const [secondItem, setSecondItem] = useState(false);
    const [thirdItem, setThirdItem] = useState(false);

    function toggleSummaryItem(index) {
        if (index === 0) {
            setSelectedItem(0);
            setFirstItem(true);
            setSecondItem(false);
            setThirdItem(false);
        } else if (index === 1) {
            setSelectedItem(1);
            setFirstItem(false);
            setSecondItem(true);
            setThirdItem(false);
        } else if (index === 2) {
            setSelectedItem(2);
            setFirstItem(false);
            setSecondItem(false);
            setThirdItem(true);
        }
    }

    useEffect(() => {
        for (let i = 0; i < 3; i++) {
            if (i === 0) {
                setTotalAppointments(appointments.length);
            } else if (i === 1) {
                setNumberOfConfirmedAppointments(confirmedAppointments.length);
            } else if (i === 2) {
                setNumberOfPendingAppointments(pendingAppointments.length);
            }
        }
    }, [appointments, confirmedAppointments, pendingAppointments, setTotalAppointments]);

    return (
        <div className="w-full flex justify-between gap-10">
            {items.map((itemName, index) => (
                <SummaryItem
                    key={index}
                    index={index}
                    selectedItem={selectedItem}
                    totalAppointments={totalAppointments}
                    numberOfConfirmedAppointments={numberOfConfirmedAppointments}
                    numberOfPendingAppointments={numberOfPendingAppointments}
                    toggleSummaryItem={toggleSummaryItem}
                    name={itemName}
                />
            ))}
        </div>
    );
}

ClinicSummaryView.propTypes = {
    totalAppointments: PropTypes.number.isRequired,
    setTotalAppointments: PropTypes.func.isRequired,
    appointments: PropTypes.array.isRequired,
    pastAppointments: PropTypes.array.isRequired,
    confirmedAppointments: PropTypes.array.isRequired,
    pendingAppointments: PropTypes.array.isRequired,
    selectedItem: PropTypes.number.isRequired,
    setSelectedItem: PropTypes.func.isRequired,
};

function SummaryItem({
    index,
    selectedItem,
    totalAppointments,
    numberOfConfirmedAppointments,
    numberOfPendingAppointments,
    toggleSummaryItem,
    name,
}) {
    const [number, setNumber] = useState(0);

    useEffect(() => {
        if (index === 0) {
            setNumber(totalAppointments);
        } else if (index === 1) {
            setNumber(numberOfConfirmedAppointments);
        } else if (index === 2) {
            setNumber(numberOfPendingAppointments);
        }
    }, [index, totalAppointments, numberOfConfirmedAppointments, numberOfPendingAppointments]);

    return (
        <div
            onClick={() => toggleSummaryItem(index)}
            className={`w-1/3 rounded-2xl p-5 ${
                index === selectedItem
                    ? 'bg-dark text-normal hover:bg-dark-hover'
                    : 'bg-normal text-dark hover:bg-hover'
            }`}
        >
            <p>{name}</p>
            <p className="text-center">{number}</p>
        </div>
    );
}

SummaryItem.propTypes = {
    index: PropTypes.number.isRequired,
    selectedItem: PropTypes.number.isRequired,
    totalAppointments: PropTypes.number.isRequired,
    numberOfConfirmedAppointments: PropTypes.number.isRequired,
    numberOfPendingAppointments: PropTypes.number.isRequired,
    toggleSummaryItem: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
};

function ClinicAppointmentsView({
    appointments,
    pastAppointments,
    confirmedAppointments,
    pendingAppointments,
    selectedItem,
}) {
    return (
        <div className="flex flex-col gap-5">
            {/* Total Appointments */}
            {selectedItem === 0 && (
                <div>
                    {appointments.length > 0 ? (
                        <>
                            {confirmedAppointments.length > 0 &&
                                confirmedAppointments.map((appointment, index) => (
                                    <div key={index} className="flex flex-col gap-5">
                                        <Title2 title="Confirmed Bookings" />
                                        <AppointmentItem appointmentItem={appointment} />
                                    </div>
                                ))}

                            {pendingAppointments.length > 0 &&
                                pendingAppointments.map((appointment, index) => (
                                    <div key={index} className="flex flex-col gap-5">
                                        <Title2 title="Pending Bookings" />
                                        <AppointmentItem appointmentItem={appointment} />
                                    </div>
                                ))}
                        </>
                    ) : (
                        <span>No appointments</span>
                    )}
                </div>
            )}

            {/* Confirmed Appointments */}
            {selectedItem === 1 && (
                <div>
                    {confirmedAppointments.length > 0 ? (
                        confirmedAppointments.map((appointment, index) => (
                            <div key={index} className="flex flex-col gap-5">
                                <Title2 title="Confirmed Bookings" />
                                <AppointmentItem appointmentItem={appointment} />
                            </div>
                        ))
                    ) : (
                        <div>No confirmed appointments</div>
                    )}
                </div>
            )}

            {/* Pending Appointments */}
            {selectedItem === 2 && (
                <div>
                    {pendingAppointments.length > 0 ? (
                        pendingAppointments.map((appointment, index) => (
                            <div key={index} className="flex flex-col gap-5">
                                <Title2 title="Pending Bookings" />
                                <AppointmentItem appointmentItem={appointment} />
                            </div>
                        ))
                    ) : (
                        <div>No pending appointments</div>
                    )}
                </div>
            )}
        </div>
    );
}

ClinicAppointmentsView.propTypes = {
    appointments: PropTypes.array.isRequired,
    pastAppointments: PropTypes.array.isRequired,
    confirmedAppointments: PropTypes.array.isRequired,
    pendingAppointments: PropTypes.array.isRequired,
    selectedItem: PropTypes.number.isRequired,
};

function PatientDashboardView() {
    const { appointments, loading } = usePatientAppointments();

    const [confirmedAppointments, setConfirmedAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);

    useEffect(() => {
        if (loading) {
            return;
        }

        let tempConfirmedAppointments = [];
        let tempPendingAppointments = [];
        appointments.forEach((appointment) => {
            if (appointment.confirmed) {
                tempConfirmedAppointments.push(appointment);
            } else {
                tempPendingAppointments.push(appointment);
            }
        });

        console.log(appointments);

        setConfirmedAppointments(tempConfirmedAppointments);
        setPendingAppointments(tempPendingAppointments);
    }, [appointments, loading]);

    return (
        <div className="flex flex-col gap-5">
            <PatientPendingBookings />
            <PatientUpcomingAppointments appointments={confirmedAppointments} />
            <PatientPendingAppointments appointments={pendingAppointments} />
        </div>
    );
}

function PatientPendingBookings() {
    const { cart } = useCart();

    return (
        <div className="flex flex-col gap-5">
            {cart != null && cart.length > 0 && (
                <section>
                    <Title2 title="Pending Bookings" />
                    <div className="flex flex-col gap-2 py-5">
                        {cart.map((cartItem, index) => (
                            <CartItem key={index} cartItem={cartItem} index={index} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function PatientUpcomingAppointments({ appointments }) {
    return (
        <div className="flex flex-col gap-5">
            <Title2 title="Upcoming Appointments" />
            {appointments.length > 0 ? (
                <div className="flex flex-col gap-2 py-5">
                    {appointments.map((appointmentItem, index) => (
                        <AppointmentItem key={index} appointmentItem={appointmentItem} index={index} />
                    ))}
                </div>
            ) : (
                <div>No upcoming appointments</div>
            )}
        </div>
    );
}

PatientUpcomingAppointments.propTypes = {
    appointments: PropTypes.array.isRequired,
};

function PatientPendingAppointments({ appointments }) {
    return (
        <div className="flex flex-col gap-5">
            <Title2 title="Pending Appointments" />
            {appointments.length > 0 ? (
                <div className="flex flex-col gap-2 py-5">
                    {appointments.map((appointmentItem, index) => (
                        <AppointmentItem key={index} appointmentItem={appointmentItem} index={index} />
                    ))}
                </div>
            ) : (
                <div>No pending appointments</div>
            )}
        </div>
    );
}

PatientPendingAppointments.propTypes = {
    appointments: PropTypes.array.isRequired,
};
