import { Button } from '../components/Button';

export function Booking() {
    return (
        <div className="flex justify-between w-full min-h-[40rem]">
            <section className="w-full max-w-[30rem] bg-red-200">
                <ul className="flex flex-col gap-28 p-5 text-xl">
                    <li className="bg-normal px-10 py-5 rounded-2xl">Date and Time</li>
                    <li className="bg-normal px-10 py-5 rounded-2xl">Service Selection</li>
                    <li className="bg-normal px-10 py-5 rounded-2xl">Your Information</li>
                </ul>
            </section>

            <section className="w-full flex flex-col bg-blue-50">
                <div className="bg-red-100 py-10 text-center text-2xl">Service Selection</div>
                <div className="px-10 py-20 bg-hover h-full">
                    <form action="" className="flex flex-col justify-between h-full">
                        <div className="flex flex-col gap-10">
                            <div className="flex flex-col gap-5">
                                <h2>*Service</h2>
                                <select
                                    className="p-2 min-w-[20rem] border border-dark rounded-2xl"
                                    name="services"
                                    id="services"
                                >
                                    <option value="" disabled selected></option>
                                    <option value="volvo">Volvo</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-5">
                                <h2>Select Employee</h2>
                                <select
                                    className="p-2 min-w-[20rem] border border-dark rounded-2xl"
                                    name="employee"
                                    id="employee"
                                >
                                    <option value="" disabled selected></option>
                                    <option value="volvo">Volvo</option>
                                </select>
                            </div>
                        </div>
                        <Button className="w-1/6 self-end" variant="dark">
                            Continue
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}
