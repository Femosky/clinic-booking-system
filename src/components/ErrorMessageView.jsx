import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export function ErrorMessageView({ error, className, ...props }) {
    return <div {...props}>{error && <p className={twMerge('text-red-500', className)}>{error}</p>}</div>;
}

ErrorMessageView.propTypes = {
    error: PropTypes.string.isRequired,
    className: PropTypes.string,
};
