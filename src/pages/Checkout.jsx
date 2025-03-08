import heart from '../assets/image 5.png';
import pen from '../assets/pencil-5824 5.png';
import trash from '../assets/remove-or-delete-black-circle-20731 5.png';
import paypal from '../assets/paypal-credit-card-payment-method-19675.png';
import visa from '../assets/visa-credit-card-payment-method-19674.png';
import gpay from '../assets/google-pay-credit-card-payment-method-19705.png';
import applePay from '../assets/apple-pay-credit-card-payment-method-19706.png';
import { Button } from '../components/Button';
import { BorderLine } from '../components/BorderLine';

export function Checkout() {
    return (
        <div className="w-full flex justify-between">
            <section className="min-h-[40rem] w-3/4 px-5 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl">Booking Summary</h2>

                    <div className="flex flex-col">
                        <CartItem />
                    </div>
                </div>

                <OrderSummaryView />
            </section>

            <section className="w-1/4 bg-dark rounded-2xl px-2 py-6">
                <div className="w-full flex justify-between px-10">
                    <img className="w-12" src={paypal} alt="paypal icon" />
                    <img className="w-12" src={visa} alt="visa icon" />
                    <img className="w-12" src={gpay} alt="google pay icon" />
                    <img className="w-12" src={applePay} alt="apple pay icon" />
                </div>
                <div></div>
                <div></div>
            </section>
        </div>
    );
}

function CartItem() {
    return (
        <div className="w-full flex px-10 py-2 items-center justify-between bg-normal rounded-2xl">
            <section>
                <img className="w-20" src={heart} alt="cart item icon" />
            </section>

            <section className="w-full px-20 flex justify-between">
                <p>Mental Therapy</p>
                <p>Dr. Anand</p>
                <p>$37.00</p>
            </section>

            <section className="flex">
                <Button variant="clear" size="round">
                    <img src={pen} alt="edit cart item icon" />
                </Button>
                <Button variant="clear" size="round">
                    <img src={trash} alt="delete cart item icon" />
                </Button>
            </section>
        </div>
    );
}

function OrderSummaryView() {
    return (
        <div className="w-full flex flex-col gap-4 bg-normal rounded-2xl px-10 py-2">
            <section>Order Summary</section>

            <section>
                <ul className="w-full flex flex-col">
                    <li>
                        <div className="w-full flex justify-between">
                            <p>Discount</p>
                            <p>$10.00</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>Delivery</p>
                            <p>$5.00</p>
                        </div>
                    </li>

                    <li>
                        <div className="w-full flex justify-between">
                            <p>{`Items total count (2)`}</p>
                            <p>$124.00</p>
                        </div>
                    </li>
                </ul>
            </section>

            <BorderLine />

            <section>
                <div className="w-full flex justify-between">
                    <p>Total</p>
                    <p>$139.00</p>
                </div>
            </section>
        </div>
    );
}
