import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function BorderLine({ className, ...props }) {
    return <div {...props} className={twMerge('border-t border-dark w-full', className)} />;
}

BorderLine.propTypes = {
    className: PropTypes.any.isRequired,
};
