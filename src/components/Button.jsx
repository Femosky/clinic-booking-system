import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { BUTTON_BORDER_THICKNESS } from '../global/global_variables';
import PropTypes from 'prop-types';

const buttonStyles = cva(['transition-colors'], {
    variants: {
        variant: {
            default: ['bg-normal', 'hover:bg-hover', 'text-dark'],
            light_border: ['bg-normal', 'hover:bg-hover', 'text-dark', `border-${BUTTON_BORDER_THICKNESS} border-dark`],
            dark: ['bg-dark', 'hover:bg-dark-hover', 'text-normal'],
            hot: ['bg-hot', 'text-white', 'hover:bg-hot-hover'],
            clear: [],
        },
        size: {
            default: ['px-5', 'py-2', 'font-medium', 'text-base'],
            round: ['rounded-full', 'items-center', 'justify-center', 'p-2'],
            special: ['px-5', 'py-3', 'rounded-tl-4xl', 'rounded-bl-4xl', 'rounded-br-4xl'],
            google: ['px-3', 'py-2', 'bg-white', 'border border-black', 'rounded-4xl', 'w-fit', 'font-medium'],
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

export function Button({ type, variant, size, className, ...props }) {
    return <button {...props} type={type} className={twMerge(buttonStyles({ variant, size }), className)} />;
}

Button.propTypes = {
    type: PropTypes.any.isRequired,
    variant: PropTypes.any.isRequired,
    size: PropTypes.any.isRequired,
    className: PropTypes.any.isRequired,
};
