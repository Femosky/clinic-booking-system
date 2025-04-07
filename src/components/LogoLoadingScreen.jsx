import logo from '../assets/logo.png';

export function LogoLoadingScreen() {
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-white absolute top-0 left-0 right-0 bottom-0 z-[999]">
            <img className="h-[6rem]" src={logo} alt="loading logo" />
        </div>
    );
}
