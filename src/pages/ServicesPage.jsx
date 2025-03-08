import { twMerge } from 'tailwind-merge';
import clinic1 from '../assets/image 4.png';
import { PropTypes } from 'prop-types';
import { Button } from '../components/Button';
import { Minus, Plus } from 'lucide-react';
import { getDatabase } from 'firebase/database';
import { useServices } from '../hooks/useServices';
import { useUserData } from '../hooks/useUserData';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import { useUserId } from '../hooks/useUserId';

export function ServicesPage() {
    const { uid } = useUserId();
    const { services, error } = useServices(uid);

    return (
        <div className="w-full">
            <section className="flex justify-between items-center p-4">
                <p className="text-2xl">Services</p>
                <select name="" id="" className="p-2 min-w-[20rem] border border-dark rounded-2xl text-lg">
                    <option value="A" disabled selected>
                        Filter by Employees
                    </option>
                </select>
            </section>
            <section className="w-full grid grid-cols-4 gap-20 place-items-stretch">
                {services.length === 0 ? (
                    <p>No services available at this time.</p>
                ) : (
                    services.map((service) => <ServiceCard key={service.id} service={service} />)
                )}
            </section>
        </div>
    );
}

function ServiceCard({ services, className, ...props }) {
    return (
        <div {...props} className={twMerge('', className)}>
            <div className="w-full flex items-end bg-normal h-[18rem]">
                <div className="w-full h-[16rem] overflow-hidden">
                    <img className="w-full h-full object-cover" src={clinic1} alt="service image" />
                </div>
            </div>
            <p className="p-2 bg-normal">{services?.title}</p>

            <div className="text-center py-4">
                <p>By Dr. Anand</p>
                <p>$37.00 | ***** 4-5hrs</p>
            </div>

            <Button className="w-full" variant="dark">
                Book Now
            </Button>

            <div className="flex border border-dark rounded-lg my-3 px-2 py-3 place-self-center justify-between w-[10rem]">
                <Minus />
                <p>1</p>
                <Plus />
            </div>
        </div>
    );
}

ServiceCard.propTypes = {
    services: PropTypes.shape({
        title: PropTypes.string.isRequired,
    }).isRequired,
    className: PropTypes.string.isRequired,
};
