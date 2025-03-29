import {
    abhayaAboutUsLink,
    femiAboutUsLink,
    ourMission,
    ourMission2,
    ourMission3,
    shyamaAboutUsLink,
} from '../global/global_variables';
import doctorImg from '../assets/doctors.jpeg';
import { Title2 } from '../components/Title2';
import femiImg from '../assets/femi-photo.jpeg';
import shyamaImg from '../assets/shyama-photo.jpeg';
import abhayaImg from '../assets/abhaya-photo.jpeg';
import { PageTitle } from '../components/PageTitle';

export function AboutUs() {
    return (
        <div>
            <section className="w-full flex flex-col-reverse gap-5 md:gap-0 md:flex-row">
                <div className="w-full md:w-1/2 flex flex-col gap-10">
                    <PageTitle className="text-4xl text-center" pageTitle="OUR MISSION" />
                    <div className="w-full flex flex-col gap-5 pr-10 text-lg">
                        <p>{ourMission}</p>
                        <p>{ourMission2}</p>
                        <p>{ourMission3}</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <img src={doctorImg} alt="doctors image" />
                </div>
            </section>

            <section className="flex flex-col gap-16 py-24">
                <Title2 className="place-self-center text-3xl md:text-4xl text-center" title="Get to know us" />

                <div className="w-full flex flex-col gap-4 md:gap-0 md:flex-row justify-between">
                    <div className="w-full md:w-1/3 flex flex-col gap-4  items-center">
                        <a className="w-full" href={femiAboutUsLink} target="_blank">
                            <img
                                className="w-full max-w-[24rem] h-[24rem] object-cover object-left-bottom"
                                src={femiImg}
                                alt="image of cofounder, femi"
                            />
                            <p className="text-center">Olufemi Ojeyemi</p>
                        </a>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col gap-4 items-center">
                        <a className="w-full" href={shyamaAboutUsLink} target="_blank">
                            <img
                                className="w-full max-w-[24rem] h-[24rem] object-cover object-top"
                                src={shyamaImg}
                                alt="image of cofounder, femi"
                            />
                            <p className="text-center">Shyama Sodha</p>
                        </a>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col gap-4 items-center">
                        <a className="w-full" href={abhayaAboutUsLink} target="_blank">
                            <img
                                className="w-full max-w-[24rem] h-[24rem] object-cover object-bottom"
                                src={abhayaImg}
                                alt="image of cofounder, femi"
                            />
                            <p className="text-center">Abhaya Mani Paudel</p>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
