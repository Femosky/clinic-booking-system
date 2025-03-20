import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function CompulsoryAsterisk({ starClass, className, ...props }) {
    return (
        <span {...props} className={twMerge('text-dark', className)}>
            (<span className={twMerge('text-red-500', starClass)}>*</span>)
        </span>
    );
}

CompulsoryAsterisk.propTypes = {
    starClass: PropTypes.string,
    className: PropTypes.string,
};
