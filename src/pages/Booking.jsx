import { Button } from '../components/Button';

export function Booking() {
    return (
        <div className="flex justify-between w-full">
            <section className="w-full max-w-[30rem] bg-red-200">
                <ul className="p-5 flex flex-col">
                    <li>Service Selection</li>
                    <li>Date and Time</li>
                    <li>Your Information</li>
                </ul>
            </section>

            <section className="w-full bg-blue-50">
                <div>Service Selection</div>
                <div>
                    <form action="">
                        <div>
                            <select
                                className="p-2 min-w-[20rem] border border-dark rounded-2xl"
                                name="services"
                                id="services"
                            >
                                <option value="volvo">Volvo</option>
                                <option value="volvo2">Volvo2</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="p-2 min-w-[20rem] border border-dark rounded-2xl"
                                name="employee"
                                id="employee"
                            >
                                <option value="volvo">Volvo</option>
                                <option value="volvo2">Volvo2</option>
                            </select>
                        </div>
                        <Button variant="dark">Continue</Button>
                    </form>
                </div>
            </section>
        </div>
    );
}
