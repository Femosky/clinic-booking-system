import { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorMessageView } from '../components/ErrorMessageView';
import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { PageTitle } from '../components/PageTitle';
import { dashboardTitle } from '../global/global_variables';
import { Title2 } from '../components/Title2';

export function Dashboard() {
    const { userData } = useUserData();

    useEffect(() => {
        console.log(userData);
    });

    return (
        <div className="w-full flex flex-col gap-5">
            <PageTitle pageTitle={dashboardTitle} />
            {userData != null && userData.userType ? <ClinicDashboardView /> : <section>Patient</section>}
        </div>
    );
}

function ClinicDashboardView() {
    return (
        <div className="flex flex-col gap-10">
            <ClinicSummaryView />
            <ClinicBookingsView />
        </div>
    );
}

function ClinicSummaryView() {
    const items = ['Total Bookings', 'Confirmed Booking', 'Pending Bookings'];

    return (
        <div className="w-full flex justify-between gap-10">
            {items.map((itemName, index) => (
                <SummaryItem key={index} name={itemName} number={index} />
            ))}
        </div>
    );
}

function SummaryItem({ name, number }) {
    return (
        <div className="w-1/3 bg-normal rounded-2xl p-5 hover:bg-hover">
            <p>{name}</p>
            <p className="text-center">{number}</p>
        </div>
    );
}

SummaryItem.propTypes = {
    name: PropTypes.string.isRequired,
    number: PropTypes.string.isRequired,
};

function ClinicBookingsView() {
    return (
        <div className="flex flex-col gap-5">
            <Title2 title="Bookings" />
            <div>
                <BookingItem />
            </div>
        </div>
    );
}

function BookingItem({ bookingItem, index }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="w-full flex px-10 py-2 items-center justify-between bg-normal rounded-2xl">
            <p className="w-1/6">{'1'}</p>

            <section className="w-5/6 flex items-center justify-between">
                <p>{'Mental Therapy'}</p>
                <p>{'Olufemi Ojeyemi'}</p>

                <div className="flex items-center gap-7">
                    <Button className="h-10" variant="dark">
                        View
                    </Button>
                    <Button variant="clear" size="round">
                        <img src={trash} alt="delete cart item icon" />
                    </Button>
                </div>
            </section>
            <ErrorMessageView error={error} />
        </div>
    );
}

BookingItem.propTypes = {
    bookingItem: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
};
