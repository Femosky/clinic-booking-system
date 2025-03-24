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
            navigate('/booking', { state: { selectedService: service } });
        }
    }

    async function handleGetService(index) {
        const clinicId = cart[index].booking_details.clinic_id;
        const serviceId = cart[index].booking_details.service_id;

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
        <div className="w-full flex px-10 py-2 items-center justify-between bg-normal rounded-2xl">
            <section>
                <img className="w-20" src={heart} alt="cart item icon" />
            </section>

            <section className="w-full px-20 flex justify-between">
                <p>{cartItem.booking_details.service_name}</p>
                <p>{cartItem.booking_details.doctor}</p>
                <p>${parseFloat(cartItem.booking_details.price).toFixed(2)}</p>
            </section>

            <section className="flex">
                <Button onClick={() => editBooking(index)} variant="clear" size="round">
                    <img src={pen} alt="edit cart item icon" />
                </Button>
                <Button onClick={() => removeCartItem(index)} variant="clear" size="round">
                    <img src={trash} alt="delete cart item icon" />
                </Button>
            </section>
            <ErrorMessageView error={error} />
        </div>
    );
}

CartItem.propTypes = {
    cartItem: PropTypes.object,
    index: PropTypes.number.isRequired,
};
