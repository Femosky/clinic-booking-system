import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { BUTTON_BORDER_THICKNESS } from '../global/global_variables';

const buttonStyles = cva(['transition-colors'], {
    variants: {
        variant: {
            default: ['bg-normal', 'hover:bg-hover', 'text-dark'],
            light_border: ['bg-normal', 'hover:bg-hover', 'text-dark', `border-${BUTTON_BORDER_THICKNESS} border-dark`],
            dark: ['bg-dark', 'hover:bg-dark-hover', 'text-normal'],
            hot: ['bg-hot', 'text-white', 'hover:bg-hot-hover'],
        },
        size: {
            default: ['px-5', 'py-2', 'font-medium', 'text-base'],
            round: ['rounded-full', 'items-center', 'justify-center', 'p-2'],
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

/* eslint-disable react/prop-types */
export function Button({ variant, size, className, ...props }) {
    return <button {...props} className={twMerge(buttonStyles({ variant, size }), className)} />;
}
