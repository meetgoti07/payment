import React, { useEffect, useRef } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import the js-cookie library

//
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);


const useQueryParams = () => {
    const [searchParams] = useSearchParams();
    return {
        orderId: searchParams.get('orderId'),
        wixTransactionId: searchParams.get('wixTransactionId'),
        amount: searchParams.get('amount'),
        url: searchParams.get('ref')
    };
};

function formatAmount(amountStr) {
    const cleanedStr = amountStr.replace(/[^\d]/g, '');

    if (cleanedStr.length <= 2) {
        return '0.' + cleanedStr.padStart(2, '0');
    }

    const integerPart = cleanedStr.slice(0, -2);
    const decimalPart = cleanedStr.slice(-2);

    return integerPart + '.' + decimalPart;
}

// const ExpressCheckout = () => {
//     const expressCheckoutRef = useRef(null);
//     const { orderId, wixTransactionId, amount,url } = useQueryParams();
//     const [clientSecret, setClientSecret] = useState(null);
//
//     // Fetch the clientSecret from the backend
//     useEffect(() => {
//         const fetchClientSecret = async () => {
//             if (!amount) return; // Wait for amount to be set
//             Cookies.set('ref', url);
//
//             try {
//                 const response = await fetch(`${import.meta.env.VITE_BACKEND}/create-payment-intent`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         amount: parseInt(amount), // Ensure amount is an integer
//                         currency: 'usd',
//                         orderId,
//                         wixTransactionId,
//                         url
//                     }),
//                 });
//
//                 const data = await response.json();
//                 setClientSecret(data.clientSecret);
//             } catch (error) {
//                 console.error('Error fetching client secret:', error);
//             }
//         };
//
//         fetchClientSecret();
//     }, [amount, orderId, wixTransactionId]);
//
//     // Set up Stripe elements after clientSecret is fetched
//     useEffect(() => {
//         const setupExpressCheckout = async () => {
//             if (!clientSecret) return; // Wait for clientSecret to be set
//
//             try {
//                 const stripe = await stripePromise;
//
//                 // Initialize elements with clientSecret
//                 const elements = stripe.elements({ clientSecret });
//
//                 const expressCheckoutElement = elements.create('expressCheckout');
//
//                 expressCheckoutElement.on('confirm', async (event) => {
//                     try {
//                         const result = await stripe.confirmPayment({
//                             elements,
//                             clientSecret,
//                             confirmParams: {
//                                 return_url: 'https://pay.getbrandbloom.com/success-stripe',
//                             },
//                         });
//
//                         if (result.error) {
//                             console.error('Payment confirmation error:', result.error.message);
//                         } else {
//                             console.log('Payment successful!');
//                         }
//                     } catch (error) {
//                         console.error('Error confirming payment:', error);
//                     }
//                 });
//
//                 if (expressCheckoutRef.current) {
//                     expressCheckoutElement.mount(expressCheckoutRef.current);
//                 }
//             } catch (error) {
//                 console.error('Error setting up Express Checkout:', error);
//             }
//         };
//
//         setupExpressCheckout();
//     }, [clientSecret]);
//
//     return <div ref={expressCheckoutRef} id="express-checkout-element"></div>;
// };

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

// const MyFatoorahApplePay = () => {
//     const { orderId, wixTransactionId, amount, url } = useQueryParams();
//     Cookies.set('ref', url);
//     const cardElementRef = useRef(null);
//
//     useEffect(() => {
//         const fetchSessionIdAndSetup = async () => {
//             try {
//                 // Fetch the session ID and other details from your backend
//                 const response = await axios.post(`${import.meta.env.VITE_BACKEND}/create-session`, {}, {
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 });
//
//                 const sessionId = response.data.SessionId;
//                 const countryCode = response.data.CountryCode;
//
//                 if(window.myFatoorahAP && !cardElementRef.current.hasChildNodes()) {
//                     const config = {
//                         sessionId: sessionId,
//                         countryCode: countryCode,
//                         currencyCode: "AED",
//                         amount: (3.67 * formatAmount(amount)),
//                         cardViewId: "apple-pay-card-element",
//                         callback: payment,
//                         style: {
//                             frameHeight: 51,
//                             button: {
//                                 height: "35px",
//                                 type: "Pay",
//                                 borderRadius: "8px"
//                             }
//                         }
//                     };
//                     console.log(config);
//
//                     window.myFatoorahAP.init(config);
//                     console.log(myFatoorahAP);
//                 }
//
//             } catch (error) {
//                 console.error('Error fetching session ID:', error.message);
//             }
//         };
//
//         fetchSessionIdAndSetup();
//     }, [amount]);
//
//     const payment = (response) => {
//         // Process the payment response
//         const sessionId = response.sessionId;
//         // Send session ID and other details to your backend for further processing
//         axios.post(`${import.meta.env.VITE_BACKEND}/execute-apple-payment`, {
//             sessionId,
//             orderId,
//             wixTransactionId,
//             amount
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         }).then((paymentResponse) => {
//             // Handle the redirection or display a success message
//             window.location.href = paymentResponse.data?.Data?.PaymentURL;
//         }).catch(error => {
//             console.error('Payment submission error:', error);
//         });
//     };
//
//     return <div id="apple-pay-card-element" ref={cardElementRef}></div>;
// };

const MyFatoorahGooglePay = () => {
    const { orderId, wixTransactionId, amount } = useQueryParams();
    // const cardElementRefGP = useRef(null);
    console.log('Gpay Start');
    useEffect(() => {
        const fetchSessionIdAndSetup = async () => {
            try {
                // Fetch the session ID and other details from your backend
                const response = await axios.post(`${import.meta.env.VITE_BACKEND}/create-session`, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const sessionId = response.data.SessionId;
                const countryCode = response.data.CountryCode;

                console.log(sessionId,countryCode);

                    const config = {
                        sessionId: sessionId,
                        countryCode: countryCode,
                        currencyCode: "AED",
                        amount: (3.67 * formatAmount(amount)),
                        cardViewId: "gp-card-element",
                        callback: payment,
                        style: {
                            frameHeight: 51,
                            button: {
                                height: "40px",
                                text: "pay", // Accepted texts: ["book", "buy", "checkout", "donate", "order", "pay", "plain", "subscribe"]
                                borderRadius: "8px",
                                color: "black", // Accepted colors: ["black", "white", "default"]
                                language: "en"
                            }
                        }
                    };
                    console.log(config);

                    myFatoorahGP.init(config);
                    console.log(myFatoorahGP);

            } catch (error) {
                console.error('Error fetching session ID:', error.message);
            }
        };

        fetchSessionIdAndSetup();
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

    return <div id="gp-card-element"></div>;
};

const PaymentDetails = () => {
    const { orderId, wixTransactionId, amount } = useQueryParams();

    return (
        <div className="p-6 md:p-6 bg-white shadow-md flex flex-col items-center ">
            {/*<MyFatoorahApplePay />*/}
            <MyFatoorahGooglePay />
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
