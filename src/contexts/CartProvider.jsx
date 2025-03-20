import { createContext, useEffect, useState } from 'react';
import { cartLS } from '../global/global_variables';
import PropTypes from 'prop-types';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Sync updated cart with the local storage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    return <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { CartContext };
