import { twMerge } from 'tailwind-merge';
import PropTypes from 'prop-types';

export function PageTitle({ pageTitle, className, ...props }) {
    return (
        <h1 {...props} className={twMerge('w-full text-dark text-2xl md:text-3xl lg:text-4xl', className)}>
            {pageTitle}
        </h1>
    );
}

PageTitle.propTypes = {
    pageTitle: PropTypes.string.isRequired,
    className: PropTypes.string,
};
