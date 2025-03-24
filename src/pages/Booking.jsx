import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useEffect, useState } from 'react';
import { Input } from '../components/Input';
import { PropTypes } from 'prop-types';
import { CompulsoryAsterisk } from '../components/CompulsoryAsterisk';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { get, getDatabase, ref, set } from 'firebase/database';
import { useCart } from '../hooks/useCart';
import { useUserData } from '../hooks/useUserData';
import { userType1 } from '../global/global_variables';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';

export function Booking() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = useUserData();

    const { selectedService } = location.state || {};

    const [error, setError] = useState('');

    const [dateTime, setDateTime] = useState(true);
    const [yourInformation, setYourInformation] = useState(false);

    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    function toggleDateTime() {
        setDateTime(true);
        setYourInformation(false);
    }

    function toggleYourInformation() {
        setDateTime(false);
        setYourInformation(true);
    }

    function toggleSelectedSlot(slot) {
        if (selectedSlot !== slot) {
            setSelectedSlot(slot);
        } else {
            setSelectedSlot(null);
        }
    }

    function proceedToInformation() {
        if (!selectedSlot) {
            setError('You must select a slot before you proceed');
            return;
        }

        setError('');
        toggleYourInformation();
    }

    useEffect(() => {
        if (!selectedService || (userData && userData.userType === userType1)) {
            navigate(-1);
        }

        if (selectedService.slots) {
            let tempSlots = [];

            Object.keys(selectedService.slots).forEach((slotId) => {
                const slot = {
                    slotId,
                    ...selectedService.slots[slotId],
                };
                tempSlots.push(slot);
            });
            setSlots(tempSlots);
        }
    }, [selectedService]);

    if (!selectedService) {
        return <LogoLoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col">
            {selectedService.index != null && (
                <section className="w-full py-2">
                    <p className="text-center bg-normal text-dark text-xl py-2">Editing</p>
                </section>
            )}
            <div className="flex flex-col md:flex-row justify-between w-full min-h-[40rem]">
                <section className="w-full max-w-[30rem] bg-red-200">
                    <div className="flex flex-col gap-28 p-5 text-xl">
                        <Button
                            onClick={toggleDateTime}
                            className="px-10 py-5 rounded-2xl"
                            variant={dateTime ? 'dark' : 'default'}
                        >
                            Date and Time
                        </Button>
                        <Button
                            onClick={proceedToInformation}
                            className="px-10 py-5 rounded-2xl"
                            variant={yourInformation ? 'dark' : 'default'}
                        >
                            Your Information
                        </Button>
                    </div>
                </section>

                {dateTime && (
                    <DateTime
                        selectedService={selectedService}
                        proceedToInformation={proceedToInformation}
                        slots={slots}
                        selectedSlot={selectedSlot}
                        toggleSelectedSlot={toggleSelectedSlot}
                        error={error}
                    />
                )}
                {yourInformation && (
                    <YourInformation
                        selectedService={selectedService}
                        selectedSlot={selectedSlot}
                        toggleYourInformation={toggleYourInformation}
                    />
                )}
            </div>
        </div>
    );
}

function DateTime({ selectedService, proceedToInformation, slots, selectedSlot, toggleSelectedSlot, error }) {
    return (
        <section className="w-full flex flex-col bg-blue-50">
            <div className="bg-red-100 py-10 text-center text-2xl">Date and Time</div>
            <div className="w-full flex flex-col justify-between px-10 py-20 bg-hover h-full">
                <div className="flex flex-col gap-5">
                    <h2>*Service</h2>
                    <p>{`${selectedService.name} by ${selectedService.doctor}`}</p>
                </div>

                <div className="flex flex-col gap-4">
                    {!selectedSlot && <p>Select a booking slot</p>}
                    <div className="flex gap-2">
                        {selectedService.slots ? (
                            slots.map((slot, index) => (
                                <Button
                                    variant={selectedSlot === slot ? 'dark' : 'default'}
                                    onClick={() => {
                                        toggleSelectedSlot(slot);
                                    }}
                                    className="border border-dark"
                                    key={index}
                                >
                                    {slot.time}
                                </Button>
                            ))
                        ) : (
                            <div>No slots</div>
                        )}
                    </div>
                </div>

                <ErrorMessageView error={error} />
                <Button variant="dark" onClick={proceedToInformation} className="w-1/6 place-self-end">
                    Continue
                </Button>
            </div>
        </section>
    );
}

DateTime.propTypes = {
    selectedService: PropTypes.object.isRequired,
    proceedToInformation: PropTypes.func.isRequired,
    slots: PropTypes.array.isRequired,
    selectedSlot: PropTypes.object,
    toggleSelectedSlot: PropTypes.func.isRequired,
    error: PropTypes.string.isRequired,
};

function YourInformation({ selectedService, selectedSlot, toggleYourInformation }) {
    const navigate = useNavigate();
    const db = getDatabase();
    const { userData } = useUserData();
    const { cart, setCart } = useCart();

    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [error, setError] = useState('');

    function formValidation() {
        if (!fullname) {
            setError('You must enter your full name');
            return;
        }

        if (!email) {
            setError('You must enter your email');
            return;
        }

        if (!phoneNumber) {
            setError('You must enter your phone number');
            return;
        }
    }

    function getBookingDetails() {
        // Prepare booking
        const patientData = {
            fullname,
            email,
            phoneNumber,
            additionalNotes,
        };

        const booking = {
            booked_by: userData,
            patient_data: patientData,
            booking_details: {
                clinic_id: selectedService.clinicId,
                service_id: selectedService.id,
                service_name: selectedService.name,
                doctor: selectedService.doctor,
                price: selectedService.price,
                slot: selectedSlot,
            },
        };

        console.log('FIRST BOOKING ', booking);

        return booking;
    }

    async function temporarilyReserve() {
        const serviceId = selectedService.id;
        const clinicId = selectedService.clinicId;
        const slotId = selectedSlot.slotId;

        console.log('SERVICE ID: ', serviceId);
        console.log('CLINIC ID: ', clinicId);

        // Check if the booking is reserved
        try {
            const reservationRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}`);
            const reservationSnapshot = await get(reservationRef);
            if (!reservationSnapshot.exists()) {
                console.log('REF ', reservationRef);
                console.log('HERE');
                return;
            }
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return;
        }

        // Temporarily hold the slot
        try {
            const reservationRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}/available`);
            await set(reservationRef, false);
        } catch (err) {
            console.log(err.message);
            setError(err.message);
            return;
        }

        const booking = getBookingDetails();
        return booking;
    }

    async function handleMakeBooking(event) {
        event.preventDefault();

        formValidation();

        // Temporarily reserve

        const booking = await temporarilyReserve();

        // Add to Cart
        if (booking) {
            if (selectedService.index != null) {
                let newCart = [...cart];
                newCart[selectedService.index] = booking;
                setCart(newCart);
            } else {
                if (cart && cart.length > 0) {
                    setCart([...cart, booking]);
                } else {
                    setCart([booking]);
                }
            }
        } else {
            return;
        }

        // Proceed to Checkout
        navigate('/checkout');
    }

    return (
        <section className="w-full flex flex-col bg-blue-50">
            <div className="bg-red-100 py-10 text-center text-2xl">Your Information</div>
            <div className="px-10 py-20 bg-hover h-full">
                <form onSubmit={handleMakeBooking} className="h-full flex flex-col justify-between">
                    <div className="max-w-3/4">
                        <div>
                            <h3 className="text-dark">
                                Full name <CompulsoryAsterisk />
                            </h3>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Enter your full name"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <h3 className="text-dark">
                                E-mail Address <CompulsoryAsterisk />
                            </h3>
                            <Input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <h3 className="text-dark">
                                Mobile number <CompulsoryAsterisk />
                            </h3>
                            <Input
                                type="text"
                                name="phoneNumber"
                                id="phoneNumber"
                                placeholder="Enter your phone number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <h3 className="text-dark">Additional notes (if any):</h3>
                            <Input
                                type="text"
                                name="additional"
                                id="additional"
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </div>

                        <ErrorMessageView error={error} />
                    </div>

                    <Button onClick={toggleYourInformation} className="w-1/6 self-end" variant="dark">
                        Continue
                    </Button>
                </form>
            </div>
        </section>
    );
}

YourInformation.propTypes = {
    selectedService: PropTypes.object.isRequired,
    selectedSlot: PropTypes.object.isRequired,
    toggleYourInformation: PropTypes.func.isRequired,
};
