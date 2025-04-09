import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { get, getDatabase, ref } from 'firebase/database';
import heart from '../assets/image 5.png';
import pen from '../assets/pencil-5824 5.png';
import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { ErrorMessageView } from './ErrorMessageView';
import { formatToDayDateMonthYear } from '../global/global_methods';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import loadingImage from '../assets/placeholder-image.png';
import { bookingPath } from '../global/global_variables';

export function CartItem({ cartItem, index }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { cart, setCart } = useCart();

    function removeCartItem(index) {
        let tempCart = [...cart];

        if (tempCart) {
            tempCart.splice(index, 1);
            setCart(tempCart);
        }
    }

    async function editBooking(index) {
        const service = await handleGetService(index);

        if (service) {
            navigate(bookingPath, { state: { selectedService: service } });
        }
    }

    async function handleGetService(index) {
        const clinicId = cart[index].bookingDetails.clinicId;
        const serviceId = cart[index].bookingDetails.serviceId;

        if (!clinicId || !serviceId) {
            setError('Clinic or service ID missing');
            return;
        }

        setLoading(true);
        try {
            const db = getDatabase();
            const serviceRef = ref(db, `services/${clinicId}/${serviceId}`);
            const snapshot = await get(serviceRef);

            if (snapshot.exists()) {
                return {
                    id: serviceId,
                    clinicId,
                    index,
                    ...snapshot.val(),
                };
            } else {
                console.log('Unable to get service');
                setError('Appointment not available');
            }
        } catch (err) {
            setError(err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative w-full flex flex-col md:flex-row px-4 md:px-10 py-4 md:py-2 gap-4 justify-center md:items-center md:justify-between bg-normal rounded-2xl">
            {/* Gray Overlay when the cart item is taken */}
            {cartItem.taken && (
                <>
                    <div className="absolute inset-0 z-10 flex justify-center bg-gray-500 opacity-50 rounded-2xl pointer-events-none">
                        <p className="text-xs sm:text-sm lg:text-base text-white font-medium z-100">
                            This appointment slot is no longer available.
                        </p>
                    </div>
                </>
            )}

            <section
                className={`w-full flex gap-4 md:items-center md:justify-between ${cartItem.taken && 'pt-1 sm:pt-4'}`}
            >
                <div className="size-16 md:size-20 flex items-center">
                    <LazyLoadImage
                        className="size-full object-cover"
                        src={cartItem.bookingDetails.imageUrl}
                        alt="cart item image"
                        width={'100%'}
                        height={'100%'}
                        placeholderSrc={loadingImage}
                    />
                </div>

                <div className="w-full flex flex-col md:flex-row md:justify-between text-sm md:text-base">
                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Time:</p>
                        <p>{formatToDayDateMonthYear(cartItem.bookingDetails.slot.timestamp)}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Clinic name:</p>
                        <p>{cartItem.bookingDetails.clinicName}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Service:</p>
                        <p>{cartItem.bookingDetails.serviceName}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Doctor:</p>
                        <p>{cartItem.bookingDetails.doctor}</p>
                    </div>

                    <div className="flex justify-between">
                        <p className="flex md:hidden font-medium">Price:</p>
                        <p>${parseFloat(cartItem.bookingDetails.price).toFixed(2)}</p>
                    </div>
                </div>
            </section>

            <section className="flex items-center place-self-center gap-5 w-fit">
                <Button
                    className={`h-full ${cartItem.taken && 'cursor-default'}`}
                    disabled={cartItem.taken}
                    onClick={() => editBooking(index)}
                    variant="clear"
                    size="round"
                >
                    <img className="w-10" src={pen} alt="edit cart item icon" />
                </Button>
                <Button className="h-full" onClick={() => removeCartItem(index)} variant="clear" size="round">
                    <img className="w-10" src={trash} alt="delete cart item icon" />
                </Button>
            </section>
            {error && <ErrorMessageView className="text-center md:text-start" error={error} />}
        </div>
    );
}

CartItem.propTypes = {
    cartItem: PropTypes.object,
    index: PropTypes.number.isRequired,
};
