import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { BUTTON_BORDER_THICKNESS } from '../global/global_variables';
import PropTypes from 'prop-types';

const inputStyles = cva(['transition-colors'], {
    variants: {
        variant: {
            default: ['bg-white', 'border-b border-b-dark', 'py-4', 'text-dark', 'w-full', 'focus:outline-none'],
            light_border: ['bg-normal', 'hover:bg-hover', 'text-dark', `border-${BUTTON_BORDER_THICKNESS} border-dark`],
            dark: ['bg-dark', 'hover:bg-dark-hover', 'text-normal'],
            hot: ['bg-hot', 'text-white', 'hover:bg-hot-hover'],
        },
        size: {
            default: ['py-2', 'font-medium', 'text-sm'],
            round: ['rounded-md', 'items-center', 'justify-center', 'p-2'],
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

export function Input({ type, id, placeholder, variant, size, className, ...props }) {
    return (
        <input
            {...props}
            type={type}
            id={id}
            placeholder={placeholder}
            className={twMerge(inputStyles({ variant, size }), className)}
        />
    );
}

Input.propTypes = {
    type: PropTypes.any.isRequired,
    id: PropTypes.any.isRequired,
    placeholder: PropTypes.any.isRequired,
    variant: PropTypes.any.isRequired,
    size: PropTypes.any.isRequired,
    className: PropTypes.any.isRequired,
};
