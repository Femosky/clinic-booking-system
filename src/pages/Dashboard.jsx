import { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorMessageView } from '../components/ErrorMessageView';
import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { PageTitle } from '../components/PageTitle';
import { checkoutPath, dashboardTitle, userType1 } from '../global/global_variables';
import { Title2 } from '../components/Title2';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/CartItem';
import { AppointmentItem } from '../components/AppointmentItem';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import { useClinicAppointments } from '../hooks/useClinicAppointments';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';

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
    const { appointments, pastAppointments, loading, getAppointments, getPastAppointments } = useClinicAppointments();

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
            setTotalAppointments(appointments.length);
            // setTotalAppointments(appointments.length + pastAppointments.length); // Can't decide whether to add pastAppointments, ask group
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
                getAppointments={getAppointments}
                getPastAppointments={getPastAppointments}
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
        <div className="w-full flex flex-col md:flex-row justify-between gap-2 md:gap-10">
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
            className={`w-full flex justify-between md:flex-col md:w-1/3 rounded-2xl px-5 py-2 md:p-5 ${
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
};

function ClinicAppointmentsView({
    appointments,
    pastAppointments,
    confirmedAppointments,
    pendingAppointments,
    getAppointments,
    getPastAppointments,
    selectedItem,
}) {
    const [showConfirmed, setShowConfirmed] = useState(true);
    const [showPending, setShowPending] = useState(true);
    const [showPast, setShowPast] = useState(false);

    function toggleConfirmed() {
        setShowConfirmed(!showConfirmed);
    }

    function togglePending() {
        setShowPending(!showPending);
    }

    function togglePast() {
        setShowPast(!showPast);
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Total Appointments */}
            {selectedItem === 0 && (
                <div>
                    {appointments.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-5">
                                <Button
                                    onClick={toggleConfirmed}
                                    className="flex items-center w-fit gap-2"
                                    variant="transparent"
                                    size="round"
                                >
                                    <Title2 title="Confirmed Appointments" className="w-fit" />

                                    {showConfirmed ? <ChevronUp /> : <ChevronDown />}
                                </Button>

                                {confirmedAppointments.length > 0 &&
                                    showConfirmed &&
                                    confirmedAppointments.map((appointment, index) => (
                                        <AppointmentItem
                                            key={index}
                                            appointmentItem={appointment}
                                            getAppointments={getAppointments}
                                            getPastAppointments={getPastAppointments}
                                        />
                                    ))}
                            </div>

                            <div className="flex flex-col gap-5">
                                <Button
                                    onClick={togglePending}
                                    className="flex items-center w-fit gap-2"
                                    variant="transparent"
                                    size="round"
                                >
                                    <Title2 title="Pending Appointments" className="w-fit" />

                                    {showPending ? <ChevronUp /> : <ChevronDown />}
                                </Button>

                                {pendingAppointments.length > 0 &&
                                    showPending &&
                                    pendingAppointments.map((appointment, index) => (
                                        <AppointmentItem
                                            key={index}
                                            appointmentItem={appointment}
                                            getAppointments={getAppointments}
                                            getPastAppointments={getPastAppointments}
                                        />
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <span>No appointments</span>
                    )}
                </div>
            )}

            {/* Confirmed Appointments */}
            {selectedItem === 1 && (
                <div>
                    {confirmedAppointments.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-5">
                                <Button
                                    onClick={toggleConfirmed}
                                    className="flex items-center w-fit gap-2"
                                    variant="transparent"
                                    size="round"
                                >
                                    <Title2 title="Confirmed Appointments" className="w-fit" />

                                    {showConfirmed ? <ChevronUp /> : <ChevronDown />}
                                </Button>

                                {showConfirmed &&
                                    confirmedAppointments.map((appointment, index) => (
                                        <AppointmentItem
                                            key={index}
                                            appointmentItem={appointment}
                                            getAppointments={getAppointments}
                                            getPastAppointments={getPastAppointments}
                                        />
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div>No confirmed appointments</div>
                    )}
                </div>
            )}

            {/* Pending Appointments */}
            {selectedItem === 2 && (
                <div>
                    {pendingAppointments.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-5">
                                <Button
                                    onClick={togglePending}
                                    className="flex items-center w-fit gap-2"
                                    variant="transparent"
                                    size="round"
                                >
                                    <Title2 title="Pending Appointments" className="w-fit" />

                                    {showPending ? <ChevronUp /> : <ChevronDown />}
                                </Button>

                                {showPending &&
                                    pendingAppointments.map((appointment, index) => (
                                        <AppointmentItem
                                            key={index}
                                            appointmentItem={appointment}
                                            getAppointments={getAppointments}
                                            getPastAppointments={getPastAppointments}
                                        />
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div>No pending appointments</div>
                    )}
                </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 ? (
                <div>
                    <>
                        <div className="flex flex-col gap-5">
                            <Button
                                onClick={togglePast}
                                className="flex items-center w-fit gap-2"
                                variant="transparent"
                                size="round"
                            >
                                <Title2 title={`Past Appointments (${pastAppointments.length})`} className="w-fit" />

                                {showPast ? <ChevronUp /> : <ChevronDown />}
                            </Button>

                            {showPast &&
                                pastAppointments.map((appointment, index) => (
                                    <AppointmentItem
                                        key={index}
                                        appointmentItem={appointment}
                                        getAppointments={getAppointments}
                                        getPastAppointments={getPastAppointments}
                                    />
                                ))}
                        </div>
                    </>
                </div>
            ) : (
                <>{showPast && <div>No past appointments</div>}</>
            )}
        </div>
    );
}

ClinicAppointmentsView.propTypes = {
    appointments: PropTypes.array.isRequired,
    pastAppointments: PropTypes.array.isRequired,
    confirmedAppointments: PropTypes.array.isRequired,
    pendingAppointments: PropTypes.array.isRequired,
    getAppointments: PropTypes.func,
    getPastAppointments: PropTypes.func,
    selectedItem: PropTypes.number.isRequired,
};

function PatientDashboardView() {
    const { appointments, pastAppointments, loading, getAppointments, getPastAppointments } = usePatientAppointments();

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
            <PatientUpcomingAppointments
                appointments={confirmedAppointments}
                getAppointments={getAppointments}
                getPastAppointments={getPastAppointments}
            />
            <PatientPendingAppointments
                appointments={pendingAppointments}
                getAppointments={getAppointments}
                getPastAppointments={getPastAppointments}
            />
            <PatientPastAppointments pastAppointments={pastAppointments} />
        </div>
    );
}

function PatientPendingBookings() {
    const { cart } = useCart();
    const navigate = useNavigate();

    const [showBookings, setShowBookings] = useState(true);

    function goToCheckout() {
        navigate(checkoutPath);
    }

    function toggleBookings() {
        setShowBookings(!showBookings);
    }

    return (
        <div className="flex flex-col gap-5">
            {cart != null && cart.length > 0 && (
                <section>
                    <div className="flex gap-4 items-center">
                        <Button
                            onClick={toggleBookings}
                            className="flex items-center w-fit gap-2"
                            variant="transparent"
                            size="round"
                        >
                            <Title2 title="Pending Bookings" className="w-fit text-amber-700" />

                            {showBookings ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                        <Button
                            onClick={goToCheckout}
                            className="flex bg-blue-50 hover:bg-blue-100 text-sm"
                            variant="clear"
                            size="round"
                        >
                            <p>Complete at Checkout</p>
                            <ArrowUpRight />
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 py-2">
                        {showBookings &&
                            cart.map((cartItem, index) => <CartItem key={index} cartItem={cartItem} index={index} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

function PatientUpcomingAppointments({ appointments, getAppointments, getPastAppointments }) {
    const [showConfirmed, setShowConfirmed] = useState(true);

    function toggleConfirmed() {
        setShowConfirmed(!showConfirmed);
    }

    return (
        <div className="flex flex-col gap-5">
            <Button
                onClick={toggleConfirmed}
                className="flex items-center w-fit gap-2"
                variant="transparent"
                size="round"
            >
                <Title2 title="Upcoming Appointments" className="w-fit" />

                {showConfirmed ? <ChevronUp /> : <ChevronDown />}
            </Button>

            {appointments.length > 0 ? (
                <div className="flex flex-col gap-2 py-2">
                    {showConfirmed &&
                        appointments.map((appointmentItem, index) => (
                            <AppointmentItem
                                key={index}
                                appointmentItem={appointmentItem}
                                getAppointments={getAppointments}
                                getPastAppointments={getPastAppointments}
                                index={index}
                            />
                        ))}
                </div>
            ) : (
                <>{showConfirmed && <div>No upcoming appointments</div>}</>
            )}
        </div>
    );
}

PatientUpcomingAppointments.propTypes = {
    appointments: PropTypes.array.isRequired,
    getAppointments: PropTypes.func,
    getPastAppointments: PropTypes.func,
};

function PatientPendingAppointments({ appointments, getAppointments, getPastAppointments }) {
    const [showPending, setShowPending] = useState(true);

    function togglePending() {
        setShowPending(!showPending);
    }

    return (
        <div className="flex flex-col gap-5">
            <Button
                onClick={togglePending}
                className="flex items-center w-fit gap-2"
                variant="transparent"
                size="round"
            >
                <Title2 title="Pending Appointments" className="w-fit" />

                {showPending ? <ChevronUp /> : <ChevronDown />}
            </Button>

            {appointments.length > 0 ? (
                <div className="flex flex-col gap-2 py-2">
                    {showPending &&
                        appointments.map((appointmentItem, index) => (
                            <AppointmentItem
                                key={index}
                                appointmentItem={appointmentItem}
                                getAppointments={getAppointments}
                                getPastAppointments={getPastAppointments}
                                index={index}
                            />
                        ))}
                </div>
            ) : (
                <>{showPending && <div>No pending appointments</div>}</>
            )}
        </div>
    );
}

PatientPendingAppointments.propTypes = {
    appointments: PropTypes.array.isRequired,
    getAppointments: PropTypes.func,
    getPastAppointments: PropTypes.func,
};

function PatientPastAppointments({ pastAppointments }) {
    const [showPast, setShowPast] = useState(false);

    function togglePast() {
        setShowPast(!showPast);
    }
    return (
        <div className="flex flex-col gap-5">
            <Button onClick={togglePast} className="flex items-center w-fit gap-2" variant="transparent" size="round">
                <Title2 title={`Past Appointments (${pastAppointments.length})`} className="w-fit" />

                {showPast ? <ChevronUp /> : <ChevronDown />}
            </Button>

            {pastAppointments.length > 0 ? (
                <div className="flex flex-col gap-2 py-2">
                    {showPast &&
                        pastAppointments.map((appointmentItem, index) => (
                            <AppointmentItem key={index} appointmentItem={appointmentItem} index={index} />
                        ))}
                </div>
            ) : (
                <>{showPast && <div>No past appointments</div>}</>
            )}
        </div>
    );
}

PatientPastAppointments.propTypes = {
    pastAppointments: PropTypes.array.isRequired,
};
