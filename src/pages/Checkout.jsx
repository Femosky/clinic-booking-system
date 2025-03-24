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
import { calculateTax } from '../global/tax';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { Input } from '../components/Input';
import { stockCardNumber, stockCVV, stockDate, stockName, userType1 } from '../global/global_variables';
import { isValidCardExpiryDate, isValidCardNumber } from '../global/global_methods';
import { CartItem } from '../components/CartItem';
import { getDatabase, push, ref, set } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';

export function Checkout() {
    const { cart } = useCart();
    const navigate = useNavigate();
    const { userData } = useUserData();

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

    return (
        <div className="w-full flex justify-between">
            <section className="min-h-[40rem] w-3/4 px-5 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl">Booking Summary</h2>

                    {cart && cart.length < 1 ? (
                        <p>No bookings yet</p>
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

            <section className="w-1/4 flex flex-col justify-between bg-dark rounded-2xl px-2 py-6 gap-5">
                <div className="w-full flex justify-between px-10">
                    <img className="w-12" src={paypal} alt="paypal icon" />
                    <img className="w-12" src={visa} alt="visa icon" />
                    <img className="w-12" src={gpay} alt="google pay icon" />
                    <img className="w-12" src={applePay} alt="apple pay icon" />
                </div>

                <CheckoutForm />
            </section>
        </div>
    );
}

function CheckoutForm() {
    const { cart, setCart } = useCart();
    const [user] = useAuthState(auth);
    const db = getDatabase();

    const [cardNumber, setCardNumber] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [error, setError] = useState(null);

    function handleExpiryChange(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters

        // Auto-insert slash after 2 digits
        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }

        // Limit to MM/YY format (5 characters total)
        if (value.length > 5) return;

        setExpiryDate(value);
    }

    function handleCardNumberChange(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters

        // Auto-insert dashes every 4 digits
        value = value.replace(/(.{4})/g, '$1-').trim();

        // Remove trailing dash if present
        if (value.endsWith('-')) {
            value = value.slice(0, -1);
        }

        // Limit to 19 characters (16 digits + 3 dashes)
        if (value.length > 19) return;

        console.log(value);

        setCardNumber(value);
    }

    function areInputsValid() {
        if (!isValidCardNumber(cardNumber)) {
            setError('Invalid card number.');
            return false;
        }

        if (cardHolderName.length === 0) {
            setError('Enter your card name.');
            return false;
        } else if (cardHolderName.length < 2) {
            setError('Enter a valid card name.');
            return false;
        }

        if (!isValidCardExpiryDate(expiryDate)) {
            setError('Enter a valid expiry date.');
            return false;
        }

        if (cvv.length !== 3) {
            setError('Enter your card cvv number.');
            return false;
        }

        setError('');
        return true;
    }

    function clearInputs() {
        setCardNumber('');
        setCardHolderName('');
        setExpiryDate('');
        setCvv('');
    }

    async function handlePayment() {
        // Handle payment logic

        if (!areInputsValid()) {
            return;
        }

        if (cart === null && cart.length < 1) {
            return;
        }

        const patientId = user.uid;
        if (patientId === null) {
            return;
        }

        cart.forEach(async (cartItem) => {
            const clinicId = cartItem.booking_details.clinic_id;

            try {
                const appointmentRef = ref(db, `appointments/${clinicId}`);
                const appointmentResult = await push(appointmentRef, cartItem);

                if (appointmentResult === null) {
                    return;
                }

                const appointmentID = appointmentResult.key;
                const patientRegistryRef = ref(db, `patients/${patientId}/appointments/${appointmentID}`);

                await set(patientRegistryRef, {
                    clinic_id: clinicId,
                    timestamp: Date.now(),
                });

                // Clean the cart
                setCart([]);
                clearInputs();
            } catch (err) {
                console.log(err.message);
                setError(err.message);
            }
        });
    }

    useEffect(() => {
        if (cart && cart.length > 0) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [cart]);

    return (
        <div className="flex flex-col justify-between h-full">
            <form onSubmit={handlePayment}>
                <div>
                    <h3 className="text-lg text-white">Card number</h3>
                    <Input
                        size="round"
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        name="card-number"
                        id="card-number"
                        placeholder={stockCardNumber}
                        required
                    />
                </div>
                <div>
                    <h3 className="text-lg text-white">Name on card</h3>
                    <Input
                        size="round"
                        type="text"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        name="card-holder-name"
                        id="card-holder-name"
                        placeholder={stockName}
                        required
                    />
                </div>

                <div className="flex gap-5">
                    <div>
                        <h3 className="text-lg text-white">Card Number</h3>
                        <Input
                            size="round"
                            type="text"
                            value={expiryDate}
                            onChange={handleExpiryChange}
                            name="expiry-date"
                            id="expiry-date"
                            placeholder={stockDate}
                            maxLength={5}
                            required
                        />
                    </div>
                    <div>
                        <h3 className="text-lg text-white">Card Number</h3>
                        <Input
                            size="round"
                            type="text"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            name="cvv"
                            id="cvv"
                            placeholder={stockCVV}
                            maxLength={3}
                            required
                        />
                    </div>
                </div>

                <ErrorMessageView error={error} />
            </form>

            <Button
                onClick={handlePayment}
                className={`w-full ${isButtonDisabled && 'cursor-default'}`}
                variant={isButtonDisabled ? 'disabled' : 'default'}
                disabled={isButtonDisabled}
                size="round"
            >
                Make Payment
            </Button>
        </div>
    );
}

function OrderSummaryView() {
    const { cart } = useCart();
    const [total, setTotal] = useState(0.0);
    const [grandTotal, setGrandTotal] = useState(0.0);
    const { userData } = useUserData();
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [tax, setTax] = useState(0);

    const province = 'ab';

    function calculateDelivery() {
        return 10.0;
    }

    useEffect(() => {
        function calculateGrandTotal(tempDeliveryFee, tempTax, tempTotal) {
            const discount = userData?.discount ? userData.discount : 0.0;

            return discount + tempDeliveryFee + tempTax + tempTotal;
        }

        const tempTotal = cart.reduce((acc, cartItem) => acc + parseFloat(cartItem.booking_details.price), 0.0);

        setTotal(tempTotal);

        let tempDeliveryFee = cart.length > 0 ? calculateDelivery() : 0.0;
        setDeliveryFee(tempDeliveryFee);

        if (tempTotal < 0) {
            return;
        }

        let tempTax = calculateTax(province, tempTotal);
        setTax(tempTax);

        let tempGrandTotal = calculateGrandTotal(tempDeliveryFee, tempTax, tempTotal);
        setGrandTotal(tempGrandTotal);
    }, [cart, userData]);

    return (
        <div className="w-full flex flex-col gap-4 bg-normal rounded-2xl px-10 py-2">
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
                            <p>Delivery</p>
                            <p>${deliveryFee.toFixed(2)}</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>Estimated taxes</p>
                            <p>${tax.toFixed(2)}</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>{`Items total count (${cart.length})`}</p>
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
        </div>
    );
}
