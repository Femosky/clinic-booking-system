import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function Title2({ title, className, ...props }) {
    return (
        <h2 {...props} className={twMerge('w-full text-dark text-xl', className)}>
            {title}
        </h2>
    );
}

Title2.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
};
