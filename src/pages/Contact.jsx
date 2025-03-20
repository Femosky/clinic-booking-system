import chat from '../assets/Group 157.png';
import locationPin from '../assets/location-pointer-2961 1.png';
import phoneIcon from '../assets/phone-6012 1.png';

export function Contact() {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-20">
            <section className="text-3xl">
                <h2>Contact Our Friendly Team</h2>
            </section>

            <section className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="bg-normal min-w-[15rem] w-1/3 px-2 py-7 rounded-2xl">
                    <img src={chat} className="" alt="chat with us icon" />
                    <p>Chat with us</p>
                    <p>Speak to your friendly team</p>
                    <p>clinicbooking@gmail.com</p>
                </div>

                <div className="bg-normal min-w-[15rem] w-1/3 px-2 py-7 rounded-2xl">
                    <img src={locationPin} className="" alt="chat with us icon" />
                    <p>Chat with us</p>
                    <p>Speak to your friend team</p>
                    <p>clinicbooking@gmail.com</p>
                </div>

                <div className="bg-normal min-w-[15rem] w-1/3 px-2 py-7 rounded-2xl">
                    <img src={phoneIcon} className="" alt="chat with us icon" />
                    <p>Chat with us</p>
                    <p>Speak to your friend team</p>
                    <p>clinicbooking@gmail.com</p>
                </div>
            </section>

            <section className="text-2xl">
                <h3>{"Let's get in Touch"}</h3>
            </section>
        </div>
    );
}
