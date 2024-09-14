import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import {MyFatoorahGooglePay} from "./googlePay.jsx"; // Import the js-cookie library


export const useQueryParams = () => {
    const [searchParams] = useSearchParams();
    return {
        orderId: searchParams.get('orderId'),
        wixTransactionId: searchParams.get('wixTransactionId'),
        amount: searchParams.get('amount'),
        url: searchParams.get('ref')
    };
};

export function formatAmount(amountStr) {
    const cleanedStr = amountStr.replace(/[^\d]/g, '');

    if (cleanedStr.length <= 2) {
        return '0.' + cleanedStr.padStart(2, '0');
    }

    const integerPart = cleanedStr.slice(0, -2);
    const decimalPart = cleanedStr.slice(-2);

    return integerPart + '.' + decimalPart;
}

const MyFatoorahCard = () => {
    const cardElementRef = useRef(null);

    useEffect(() => {
        const fetchSessionIdAndSetup = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND}/create-session`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const sessionId = response.data.SessionId;
                const countryCode = response.data.CountryCode;

                if (window.myFatoorah && !cardElementRef.current.hasChildNodes()) {
                    const config = {
                        countryCode: countryCode,
                        sessionId: sessionId,
                        cardViewId: 'card-element',
                        supportedNetworks: "v,m,ae",
                    };

                    window.myFatoorah.init(config);
                }
            } catch (error) {
                console.error('Error fetching session ID:', error.message);
            }
        };

        fetchSessionIdAndSetup();
    }, []);

    return <div id="card-element" ref={cardElementRef}></div>;
};
const initPayment = async (orderId, wixTransactionId,amount) => {
    try {

        if (window.myFatoorah) {
            const response = await window.myFatoorah.submit('USD');
            const sessionId = response.sessionId;
            const data = { sessionId, orderId, wixTransactionId, amount };

            const paymentResponse = await axios.post(`${import.meta.env.VITE_BACKEND}/execute-payment`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Redirect to the Payment URL
            window.location.href = paymentResponse.data?.Data?.PaymentURL;
        }
    } catch (error) {
        console.error('Payment submission error:', error);
    }
};




const MyFatoorahApplePay = () => {
    const { orderId, wixTransactionId, amount, url } = useQueryParams();
    Cookies.set('ref', url);
    const cardElementRef = useRef(null);

    useEffect(() => {
        const fetchSessionId = async () => {
            try {
                // Fetch the session ID and other details from your backend
                const response = await axios.post(`${import.meta.env.VITE_BACKEND}/create-session`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const sessionId = response.data.SessionId;
                const countryCode = response.data.CountryCode;

                if(sessionId && window.myFatoorahAP && !cardElementRef.current.hasChildNodes()) {

                    const config = {
                        sessionId: sessionId,
                        countryCode: countryCode,
                        currencyCode: "AED",
                        amount: (3.67 * formatAmount(amount)),
                        cardViewId: "apple-pay-card-element",
                        callback: payment,
                        style: {
                            frameHeight: 51,
                            button: {
                                height: "35px",
                                type: "Pay",
                                borderRadius: "8px"
                            }
                        }
                    };
                    window.myFatoorahAP.init(config);
                }

            } catch (error) {
                console.error('Error fetching session ID:', error.message);
            }
        };

        fetchSessionId();
    }, [amount]);

    const payment = (response) => {
        // Process the payment response
        const sessionId = response.sessionId;
        // Send session ID and other details to your backend for further processing
        axios.post(`${import.meta.env.VITE_BACKEND}/execute-apple-payment`, {
            sessionId,
            orderId,
            wixTransactionId,
            amount
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((paymentResponse) => {
            // Handle the redirection or display a success message
            window.location.href = paymentResponse.data?.Data?.PaymentURL;
        }).catch(error => {
            console.error('Payment submission error:', error);
        });
    };

    return <div id="apple-pay-card-element" ref={cardElementRef}></div>;
};



const PaymentDetails = () => {
    const { orderId, wixTransactionId, amount } = useQueryParams();

    return (
        <div className="p-6 md:p-6 bg-white shadow-md flex flex-col items-center ">
            <div>
            <MyFatoorahApplePay />
            <MyFatoorahGooglePay />
            </div>
            <div className="relative mb-4 w-[25rem]">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex items justify-center text-sm pt-3">
                    <span className="px-2 bg-white text-base text-gray-400">Or pay with card</span>
                </div>
            </div>
            <MyFatoorahCard />
            <button
                type="submit"
                className="w-72 bg-[#192552] text-white py-3 rounded-md"
                onClick={() => initPayment(orderId, wixTransactionId, amount)}
            >
                {amount !== null ? `Pay $${formatAmount(amount)}` : 'Loading...'}
            </button>
            <div className="mt-4 text-center text-gray-500">
                Powered by <span className="font-bold">Zoho</span>
            </div>
        </div>
    );
};


const OrderSummary = () => {
    const { amount } = useQueryParams();
    return (
    <div className="p-2 md:pl-[5rem] md:pr-[5rem] md:pb-[5rem]">
        <h2 className="text-xl font-semibold text-gray-600">Pay your invoice</h2>
        <h3 className="text-5xl font-semibold mb-4">{amount !== null ? `Pay $${formatAmount(amount)}` : 'Loading...'}</h3>
        <div className="mb-4 mt-12">
            <img src='/img1.webp'/>
        </div>
        <div className="mb-4">
            <p className="text-[#333333] text-sm">**What you'll see on your card statement<br/>*To use Apple Pay, you must be on Safari<br/>Charges may appear in a different currency, but will always equal the USD order value.</p>
        </div>
    </div>)
};

const Card = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <OrderSummary />
                    <PaymentDetails />
                </div>
            </div>
        </div>
    </div>
);

export default Card;
