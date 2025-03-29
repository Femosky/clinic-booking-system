import chat from '../assets/Group 157.png';
import locationPin from '../assets/location-pointer-2961 1.png';
import phoneIcon from '../assets/phone-6012 1.png';
import { PageTitle } from '../components/PageTitle';
import { headquartersGoogleMapLink } from '../global/global_variables';

export function Contact() {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-20">
            <PageTitle pageTitle="Contact Us" />

            <section className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="bg-normal w-full flex flex-col gap-2 items-center md:min-w-[15rem] md:w-1/3 px-2 py-7 rounded-2xl">
                    <img src={chat} className="" alt="chat with us icon" />
                    <div className="w-full text-center">
                        <p>Chat with us</p>
                        <p>Speak to your friendly team</p>
                        <a href="mailto:klinic.bookings@gmail.com">
                            <p className="text-blue-400">klinic.bookings@gmail.com</p>
                        </a>
                    </div>
                </div>

                <div className="bg-normal w-full flex flex-col gap-2 items-center md:min-w-[15rem] md:w-1/3 px-2 py-7 rounded-2xl">
                    <img src={locationPin} className="" alt="chat with us icon" />
                    <div className="w-full text-center">
                        <p>Visit us</p>
                        <p>Headquaters at Milton, ON</p>
                        <a href={headquartersGoogleMapLink} target="_blank">
                            <p className="text-blue-400">Visit google map: https:google.map</p>
                        </a>
                    </div>
                </div>

                <div className="bg-normal w-full flex flex-col gap-2 items-center md:min-w-[15rem] md:w-1/3 px-2 py-7 rounded-2xl">
                    <img src={phoneIcon} className="" alt="chat with us icon" />
                    <div className="w-full text-center">
                        <p>Call us</p>
                        <p>Mon- Fri from 8am to 8pm</p>
                        <p>+1 (471) 741-7894</p>
                    </div>
                </div>
            </section>

            <section className="text-2xl">
                <h3>{"Let's get in Touch"}</h3>
            </section>
        </div>
    );
}
