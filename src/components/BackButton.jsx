import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';
import { ChevronLeft } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export function BackButton({ buttonText, className, ...props }) {
    const navigate = useNavigate();

    function goBack() {
        navigate(-1);
    }

    return (
        <div {...props} className={twMerge('w-full', className)}>
            <Button onClick={goBack} className="flex gap-2">
                <ChevronLeft /> {buttonText ? buttonText : 'Back'}
            </Button>
        </div>
    );
}

BackButton.propTypes = {
    buttonText: PropTypes.string,
    className: PropTypes.string,
};
