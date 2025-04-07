import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export function SuccessMessageView({ success, className, ...props }) {
    return (
        <div {...props}>
            {success && (
                <p className={twMerge('text-green-500 text-xs sm:text-sm md:text-base', className)}>{success}</p>
            )}
        </div>
    );
}

SuccessMessageView.propTypes = {
    success: PropTypes.string.isRequired,
    className: PropTypes.string,
};
