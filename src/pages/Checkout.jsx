import paypal from '../assets/paypal-credit-card-payment-method-19675.png';
import visa from '../assets/visa-credit-card-payment-method-19674.png';
import gpay from '../assets/google-pay-credit-card-payment-method-19705.png';
import applePay from '../assets/apple-pay-credit-card-payment-method-19706.png';
import { Button } from '../components/Button';
import { BorderLine } from '../components/BorderLine';
import PropTypes from 'prop-types';
import { useCart } from '../hooks/useCart';
import { useEffect, useState } from 'react';
import { useUserData } from '../hooks/useUserData';
import { calculateTax, provinceTotalTaxPercentage } from '../global/tax';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { Input } from '../components/Input';
import { stockCardNumber, stockCVV, stockDate, stockName, userType1 } from '../global/global_variables';
import {
    convertKeysToSnakeCase,
    getReservedEmailForDoctor,
    getReservedEmailForPatient,
    isUndefined,
    isValidCardExpiryDate,
    isValidCardNumber,
    sendEmailNotificationUpdate,
} from '../global/global_methods';
import { CartItem } from '../components/CartItem';
import { get, getDatabase, push, ref, set } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';
import { SuccessMessageView } from '../components/SuccessMessageView';

export function Checkout() {
    const { cart, setCart } = useCart();
    const navigate = useNavigate();
    const { userData } = useUserData();

    const db = getDatabase();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        if (userData !== null && userData.userType === userType1) {
            // Navigate back to the previous page
            navigate(-1);
        }

        console.log(cart);
    }, [userData, navigate]);

    useEffect(() => {
        if (cart && cart.length > 0) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [cart]);

    if (userData === null) {
        return <LogoLoadingScreen />;
    }

    if (userData.userType === userType1) {
        return <LogoLoadingScreen />;
    }

    async function checkValidCartItems() {
        // Handle payment logic

        setError('');

        if (cart === null && cart.length < 1) {
            return;
        }

        let tempCart = [...cart];

        tempCart = tempCart.filter((cartItem) => {
            const result = cartItem.taken;
            return !result;
        });

        let validCartNumber = tempCart.length;

        // tempCart.forEach((item, i) => {
        //     if (i === 0) {
        //         tempCart[i]['taken'] = true;
        //     }
        // });

        // setCart(tempCart);
        // return;

        let preparedCheckoutItems = await Promise.all(
            tempCart.map(async (cartItem, index) => {
                // cart.forEach(async (cartItem) => {
                const clinicId = cartItem.bookingDetails.clinicId;
                const serviceId = cartItem.bookingDetails.serviceId;
                const slotId = cartItem.bookingDetails.slot.slotId;

                // Check if the slot is still available
                try {
                    const reservationRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}/available`);
                    const availableData = await get(reservationRef);

                    if (availableData.val() === false) {
                        // IF SLOT IS NO LONGER AVAILABLE, MARK IT AS INVALID IN THE CART
                        let tempCart = [...cart];
                        tempCart[index]['taken'] = true;
                        setCart(tempCart);
                        setError(`${cartItem.bookingDetails.serviceName} service is no longer available.`);
                        console.log(cart[index]);
                        return null;
                    } else {
                        return cartItem;
                    }
                } catch (err) {
                    console.log(err.message);
                    setError(err.message);
                    return null;
                }
            })
        );

        preparedCheckoutItems = preparedCheckoutItems.filter((checkoutItem) => checkoutItem !== null);

        console.log(preparedCheckoutItems);
        console.log('VALID', validCartNumber);

        return [preparedCheckoutItems, validCartNumber];
    }

    async function handleReservation() {
        const result = await checkValidCartItems();
        const preparedCheckoutItems = result[0];
        const validCartNumber = result[1];

        if (preparedCheckoutItems.length === validCartNumber) {
            // IS VALID

            const patientId = userData.userId;
            if (patientId === null) {
                return;
            }

            for (let i = 0; i < preparedCheckoutItems.length; i++) {
                const cartItem = preparedCheckoutItems[i];

                const clinicId = cartItem.bookingDetails.clinicId;
                const serviceId = cartItem.bookingDetails.serviceId;
                const slotId = cartItem.bookingDetails.slot.slotId;

                const clinicEmail = cartItem.bookingDetails.clinicEmail;
                const patientEmail = cartItem.patientData.email;
                const clinicName = cartItem.bookingDetails.clinicName;
                const patientName = cartItem.patientData.fullname;
                const doctorEmail = cartItem.bookingDetails.doctorEmail;
                const doctorName = cartItem.bookingDetails.doctor;

                const serviceName = cartItem.bookingDetails.serviceName;
                const duration = cartItem.bookingDetails.duration;
                const appointmentTime = cartItem.bookingDetails.slot.timestamp;

                if (
                    isUndefined(clinicId) ||
                    isUndefined(serviceId) ||
                    isUndefined(slotId) ||
                    isUndefined(serviceName) ||
                    isUndefined(duration) ||
                    isUndefined(appointmentTime) ||
                    isUndefined(clinicId) ||
                    isUndefined(clinicEmail) ||
                    isUndefined(patientEmail) ||
                    isUndefined(clinicName) ||
                    isUndefined(patientName) ||
                    isUndefined(doctorEmail) ||
                    isUndefined(doctorName)
                ) {
                    console.log('Missing paramaters.');
                    setError('Missing paramaters.');
                    continue;
                }

                console.log('CLINIC ID ', clinicId);

                try {
                    // APPEND APPOINTMENT
                    const appointmentRef = ref(db, `appointments/${clinicId}`);
                    const appointmentResult = await push(appointmentRef, convertKeysToSnakeCase(cartItem));

                    if (appointmentResult === null) {
                        setError('Error reserving appointment: cannot push cartItem to the database');
                        continue;
                    }

                    // ADD A RECEIPT TO PATIENT'S RECORDS
                    const appointmentID = appointmentResult.key;
                    const patientRegistryRef = ref(db, `patients/${patientId}/appointments/${appointmentID}`);

                    await set(patientRegistryRef, {
                        clinic_id: clinicId,
                        timestamp: Date.now(),
                    });

                    // MARK SLOT AS RESERVED
                    const reservationRef = ref(db, `services/${clinicId}/${serviceId}/slots/${slotId}/available`);
                    const hell0 = await set(reservationRef, false);
                    console.log('HELLOOOOD', hell0);

                    // SEND CONFIRMATION EMAILS

                    const messagePatient = getReservedEmailForPatient(
                        serviceName,
                        doctorName,
                        clinicName,
                        duration,
                        appointmentTime
                    );

                    const messageDoctor = getReservedEmailForDoctor(
                        serviceName,
                        patientName,
                        clinicName,
                        duration,
                        appointmentTime
                    );

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

                    // Remove the item from the cart
                    let tempCart = [];

                    cart.forEach((item) => {
                        if (JSON.stringify(item) !== JSON.stringify(cartItem)) {
                            tempCart.push(item);
                        }
                    });

                    setCart(tempCart);
                    setSuccess(
                        'Your booking has been successfully reserved. You will receive a confirmation email shortly.'
                    );
                } catch (err) {
                    console.log(err.message);
                    setError(err.message);
                }
            }
        } else {
            // IS NOT VALID
            setError('An appointment has already been reserved');
        }
    }

    return (
        <div className="w-full flex flex-col gap-10 justify-between">
            <section className="min-h-[40rem] w-full flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl">Booking Summary</h2>

                    {cart && cart.length < 1 ? (
                        <p className="py-5">No bookings yet</p>
                    ) : (
                        <div className="flex flex-col gap-2 py-5">
                            {cart.map((cartItem, index) => (
                                <CartItem key={index} cartItem={cartItem} index={index} />
                            ))}
                        </div>
                    )}
                </div>

                <OrderSummaryView />
            </section>

            {error && <ErrorMessageView error={error} />}
            {success && <SuccessMessageView success={success} />}

            <Button
                onClick={handleReservation}
                className={`w-full ${isButtonDisabled && 'cursor-default'}`}
                variant={isButtonDisabled ? 'disabled' : 'default'}
                disabled={isButtonDisabled}
                size="round"
            >
                Make Reservation Request
            </Button>
        </div>
    );
}

function OrderSummaryView() {
    const { cart } = useCart();
    const [validCartItemsCount, setValidCartItemsCount] = useState(0);
    const [provinceTax, setProvinceTax] = useState(null);
    const [total, setTotal] = useState(0.0);
    const [grandTotal, setGrandTotal] = useState(0.0);
    const { userData } = useUserData();
    const [tax, setTax] = useState(0);

    useEffect(() => {
        function calculateGrandTotal(tempTax, tempTotal) {
            const discount = userData?.discount ? userData.discount : 0.0;

            return discount + tempTax + tempTotal;
        }

        let tempCart = [...cart];
        tempCart = tempCart.filter((item) => item.taken === false);
        setValidCartItemsCount(tempCart.length);

        const tempTotal = tempCart.reduce((acc, cartItem) => acc + parseFloat(cartItem.bookingDetails.price), 0.0);

        setTotal(tempTotal);

        if (cart.length < 1) {
            return;
        }

        let tempProvince = tempCart[0].bookingDetails.clinicProvince;
        setProvinceTax(tempProvince);

        let tempTax = calculateTax(tempProvince, tempTotal);
        setTax(tempTax);

        let tempGrandTotal = calculateGrandTotal(tempTax, tempTotal);
        setGrandTotal(tempGrandTotal);
    }, [cart, userData]);

    return (
        <div className="w-full flex flex-col gap-4 bg-normal rounded-2xl text-sm sm:text-base px-4 md:px-10 py-2">
            <section>Order Summary</section>

            <section>
                <ul className="w-full flex flex-col">
                    <li>
                        <div className="w-full flex justify-between">
                            <p>Discount</p>
                            <p>${userData?.discount ? userData.discount : '0.00'}</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>Estimated taxes (~{provinceTotalTaxPercentage[provinceTax]}%)</p>
                            <p>${tax.toFixed(2)}</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>{`Valid Items total count (${validCartItemsCount})`}</p>
                            <p>${total.toFixed(2)}</p>
                        </div>
                    </li>
                </ul>
            </section>

            <BorderLine />

            <section>
                <div className="w-full flex justify-between">
                    <p>Total</p>
                    <p>${grandTotal.toFixed(2)}</p>
                </div>
            </section>

            {validCartItemsCount > 0 && (
                <p className="text-center italic text-xs text-amber-700">
                    Please note that you will be required to pay the estimated listed total above in person (*subject to
                    change)
                </p>
            )}
        </div>
    );
}
