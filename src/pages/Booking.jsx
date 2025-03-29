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
import { provinces, userType1 } from '../global/global_variables';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { capitalize, formatToDayDateMonthYear, isValidEmail } from '../global/global_methods';
import { TextArea } from '../components/TextArea';

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

            tempSlots.sort((a, b) => {
                const dateA = a.timestamp;
                const dateB = b.timestamp;
                console.log('DFBNSIUF', typeof a.timestamp);

                return dateA - dateB;
            });

            console.log('AAAAAAA', tempSlots);

            console.log(selectedService);

            setSlots(tempSlots);
        }
    }, [selectedService]);

    useEffect(() => {
        if (userData !== null && userData.userType === userType1) {
            // Navigate back to the previous page
            navigate(-1);
        }
    }, [userData, navigate]);

    if (userData === null) {
        return <LogoLoadingScreen />;
    }

    if (userData.userType === userType1) {
        return <LogoLoadingScreen />;
    }

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

            {/* HEIGHT SECTION */}
            <div className="w-full grow md:min-h-[40rem] flex flex-col gap-2 md:gap-0 md:flex-row justify-between">
                <section className="w-full md:w-2/7 ">
                    <div className="w-full flex flex-col gap-2 md:gap-28 md:p-5 text-xl">
                        <Button
                            onClick={toggleDateTime}
                            className="w-full py-2 md:py-5 rounded-2xl"
                            variant={dateTime ? 'dark' : 'default'}
                        >
                            Date and Time
                        </Button>
                        <Button
                            onClick={proceedToInformation}
                            className="w-full py-2 md:py-5 rounded-2xl"
                            variant={yourInformation ? 'dark' : 'default'}
                        >
                            Your Information
                        </Button>
                    </div>
                </section>

                <section className="w-full md:w-5/7 grow h-full flex flex-col">
                    {dateTime && <div className="bg-normal py-5 md:py-10 text-center text-2xl">Date and Time</div>}
                    {yourInformation && (
                        <div className="bg-normal border-b-[0.5px] py-5 md:py-10 text-center text-2xl">
                            Your Information
                        </div>
                    )}

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
                </section>
            </div>
        </div>
    );
}

function DateTime({ selectedService, proceedToInformation, slots, selectedSlot, toggleSelectedSlot, error }) {
    return (
        <div className="w-full h-full flex flex-col justify-between gap-4 px-10 py-10 md:py-20 bg-hover">
            <div className="flex flex-col gap-5">
                <h2>*Service</h2>
                <p>{`${selectedService.name} by ${selectedService.doctor}`}</p>
            </div>

            <div className="flex flex-col gap-4">
                {!selectedSlot && <p>Select a booking slot</p>}
                <div className="flex flex-col md:flex-row gap-2">
                    {selectedService.slots ? (
                        slots.map((slot, index) => (
                            <Button
                                variant={selectedSlot === slot ? 'dark' : 'default'}
                                onClick={() => {
                                    toggleSelectedSlot(slot);
                                }}
                                className="border border-dark px-2 md:px-5 text-sm md:text-base"
                                key={index}
                            >
                                {formatToDayDateMonthYear(slot.timestamp)}
                            </Button>
                        ))
                    ) : (
                        <div>No slots</div>
                    )}
                </div>
            </div>

            <ErrorMessageView error={error} />
            <Button variant="dark" onClick={proceedToInformation} className="place-self-center md:place-self-end">
                Continue
            </Button>
        </div>
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

    function handlePhoneNumberChange(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters

        // Format as (XXX) XXX-XXXX
        if (value.length > 3 && value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else if (value.length > 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }

        // Limit to 14 characters, accounting for formatting
        if (value.length > 14) return;

        setPhoneNumber(value);
    }

    function areInputsValid() {
        if (fullname.length === 0) {
            setError('Please enter your full name');
            return false;
        } else if (fullname.length < 2) {
            setError('Please enter a valid full name');
            return false;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email');
            return false;
        }

        if (phoneNumber.length !== 14) {
            setError('You must enter a valid phone number');
            return false;
        }

        setError('');
        return true;
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
            bookedBy: userData,
            patientData: patientData,
            taken: false,
            confirmed: false,
            completed: false,
            bookingDetails: {
                clinicId: selectedService.clinicId,
                clinicName: selectedService.clinicName,
                clinicAddress: selectedService.clinicAddress,
                clinicProvince: selectedService.clinicProvince,
                clinicEmail: selectedService.clinicEmail,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                doctor: selectedService.doctor,
                doctorEmail: selectedService.doctorEmail,
                duration: selectedService.duration,
                price: selectedService.price,
                imageUrl: selectedService.imageUrl,
                slot: selectedSlot,
            },
        };

        console.log('FIRST BOOKING ', booking);

        return booking;
    }

    async function isBookingValid() {
        // Former RESERVE FUNCTION

        const serviceId = selectedService.id;
        const clinicId = selectedService.clinicId;
        const slotId = selectedSlot.slotId;

        // Check if the booking is reserved
        try {
            const reservationRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}`);
            const reservationSnapshot = await get(reservationRef);
            if (!reservationSnapshot.exists()) {
                setError('Appointment does not exist.');
                console.log('Appointment does not exist.');
                return;
            }
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

        if (!areInputsValid()) {
            return;
        }

        // Temporarily reserve

        const booking = await isBookingValid();

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
        <div className="h-full gap-4 px-10 py-10 md:py-20 bg-hover">
            <form onSubmit={handleMakeBooking} className="h-full flex flex-col gap-10 justify-between">
                <div className="w-full md:max-w-4/5">
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
                        />
                    </div>

                    <div>
                        <h3 className="text-dark">
                            E-mail Address <CompulsoryAsterisk />
                        </h3>
                        <Input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={handlePhoneNumberChange}
                        />
                    </div>

                    <div>
                        <h3 className="text-dark">Additional notes (if any):</h3>
                        <TextArea
                            type="text"
                            name="additional"
                            id="additional"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                        />
                    </div>

                    <ErrorMessageView error={error} />
                </div>

                <Button onClick={toggleYourInformation} className="self-center md:self-end" variant="dark">
                    Continue
                </Button>
            </form>
        </div>
    );
}

YourInformation.propTypes = {
    selectedService: PropTypes.object.isRequired,
    selectedSlot: PropTypes.object.isRequired,
    toggleYourInformation: PropTypes.func.isRequired,
};
