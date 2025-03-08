import { Button } from './Button';
import google_logo from '../assets/google logo.svg';
import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function SignupButton({ iconName, onClick, className, buttonText, ...props }) {
    const icon = {
        google: google_logo,
    };
    return (
        <Button
            {...props}
            onClick={onClick}
            size="google"
            variant="clear"
            className={twMerge('flex justify-between gap-2', className)}
        >
            {iconName && <img src={icon[iconName]} alt="sign up button" />}
            {buttonText}
        </Button>
    );
}

SignupButton.propTypes = {
    iconName: PropTypes.string.isRequired,
    onClick: PropTypes.any.isRequired,
    className: PropTypes.any.isRequired,
    buttonText: PropTypes.string.isRequired,
};
