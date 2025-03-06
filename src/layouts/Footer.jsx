import { APP_NAME, BUTTON_BORDER_THICKNESS, PAGE_MAX_WIDTH } from '../global/global_variables';
import facebook_icon from '../assets/facebook-2.png';
import x_icon from '../assets/twitter-2.png';
import instagram_icon from '../assets/instagram-2.png';
import { Button } from '../components/Button';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

export function Footer({ className, ...props }) {
    const footer_list = [
        {
            id: 1,
            title: 'shop',
            list_items: [
                ['overview', ''],
                ['pricing', ''],
                ['products', ''],
                ['releases', ''],
            ],
        },
        {
            id: 2,
            title: 'company',
            list_items: [
                ['about us', ''],
                ['contact', ''],
                ['news', ''],
                ['support', ''],
            ],
        },
    ];

    return (
        <div {...props} className={twMerge('w-full', className)}>
            <div
                className={twMerge(
                    'flex flex-col w-full py-10 md:flex-row justify-between gap-5 bg-dark text-white',
                    PAGE_MAX_WIDTH
                )}
            >
                <div className="flex flex-col w-full gap-10 md:justify-between">
                    <div className="flex flex-col md:flex-row md:w-full gap-0 sm:gap-14 md:gap-28 mdp:gap-44 lg:gap-64">
                        <LogoSocial />

                        <div className="flex justify-center md:justify-between gap-16 md:gap-44">
                            {footer_list.map((item) => {
                                return <FooterList key={item.id} footer_item={item} />;
                            })}
                        </div>
                    </div>

                    <div className="border-t-2 border-white w-full" />
                </div>

                <StayUpToDate />
            </div>
        </div>
    );
}

function LogoSocial() {
    return (
        <div className="flex flex-col justify-between items-center gap-10 md:gap-0 md:items-start">
            <h3>{APP_NAME.toUpperCase()}</h3>

            {/* SOCIAL ICONS */}
            <div>
                <h4>Social Media</h4>
                <div className="flex justify-between">
                    <a href="https://www.facebook.com" target="_blank">
                        <img className="w-7 bg-white rounded-xl" src={facebook_icon} alt="facebook icon" />
                    </a>
                    <a href="https://www.x.com" target="_blank">
                        <img className="w-7 bg-white rounded-xl" src={x_icon} alt="x icon" />
                    </a>
                    <a href="https://www.instagram.com" target="_blank">
                        <img className="w-7 bg-white rounded-xl" src={instagram_icon} alt="instagram icon" />
                    </a>
                </div>
            </div>
        </div>
    );
}

function FooterList({ footer_item }) {
    return (
        <div className="flex flex-col gap-5 justify-center">
            <h4>{footer_item.title}</h4>
            <ul>
                {footer_item.list_items.map((item) => {
                    return <li key={item[0]}>{item[0]}</li>;
                })}
            </ul>
        </div>
    );
}

FooterList.propTypes = {
    footer_item: PropTypes.shape({
        title: PropTypes.string.isRequired,
        list_items: PropTypes.arrayOf(PropTypes.array).isRequired,
    }).isRequired,
};

function StayUpToDate() {
    return (
        <div className="flex flex-col gap-5 md:gap-0 justify-between">
            <div className="flex flex-col gap-5">
                <h4>STAY UP TO DATE</h4>

                <form action="" className="flex justify-between">
                    <input
                        className={twMerge(BUTTON_BORDER_THICKNESS, 'border-normal pl-5 text-sm w-full max-w-[22rem]')}
                        type="email"
                        placeholder="Enter email address"
                    />
                    <Button>Submit</Button>
                </form>
            </div>

            <div className="flex justify-between self-center md:self-start w-full max-w-[15rem] pt-10 md:pt-0">
                <p>Terms</p>
                <p>Privacy</p>
                <p>Cookies</p>
            </div>
        </div>
    );
}

Footer.propTypes = {
    className: PropTypes.string.isRequired,
};
