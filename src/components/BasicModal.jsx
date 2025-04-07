import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { useState } from 'react';
import { ErrorMessageView } from './ErrorMessageView';

export function BasicModal({ reason, description, customFunction, open, setOpen }) {
    const [error, setError] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    async function handleAction() {
        const result = await customFunction();

        if (result) {
            handleClose();
        } else {
            setError(result[1]);
        }
    }

    return (
        <div>
            <Button
                onClick={handleOpen}
                className={reason === 'remove' && 'w-full'}
                variant={reason === 'cancel' ? 'hot' : reason === 'remove' ? 'hot' : 'border_1'}
            >
                {reason.toUpperCase()}
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="p-4 min-w-[20rem] md:w-[40rem] absolute top-1/2 left-1/2 rounded-2xl transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg flex flex-col gap-2">
                    <h2 className="text-base md:text-xl font-medium text-dark">Are you sure you want to {reason}?</h2>
                    <p className="text-xs md:text-base">
                        {description ? description : 'This action cannot be undone.'}
                    </p>

                    {error && <ErrorMessageView error={error} />}

                    <div className="flex gap-2 mt-4 place-self-center md:place-self-end">
                        <Button onClick={handleClose}>Discard</Button>

                        <Button
                            onClick={handleAction}
                            variant={reason === 'cancel' ? 'hot' : reason === 'remove' ? 'hot' : 'dark'}
                        >
                            {reason.toUpperCase()}
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

BasicModal.propTypes = {
    reason: PropTypes.string.isRequired,
    description: PropTypes.string,
    customFunction: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
};
