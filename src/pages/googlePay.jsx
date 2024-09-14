import React, {useEffect, useRef} from "react";
import axios from "axios";
import {formatAmount, useQueryParams} from "./Card.jsx";
export const MyFatoorahGooglePay = () => {
    const { orderId, wixTransactionId, amount,url } = useQueryParams();
    const cardElementRefGP = useRef(null);

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

                if(sessionId && window.myFatoorahGP && !cardElementRefGP.current.hasChildNodes()) {

                    const config = {
                        sessionId: sessionId,
                        countryCode: countryCode,
                        currencyCode: "AED",
                        amount: `${parseFloat((3.67*(formatAmount(amount))).toFixed(2))}`,
                        cardViewId: "google-pay-card-element",
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

                    if (window.myFatoorahGP && window.myFatoorahGP.init) {
                        window.myFatoorahGP.init(config);
                        console.log(myFatoorahGP);
                    } else {
                        console.error("myFatoorahGP is not defined or not loaded.");
                    }
                }


            } catch (error) {
                console.error('Error fetching session ID:', error.message);
            }
        };

        fetchSessionIdAndSetup();
    }, [amount]);

    const payment = (response) => {
        // Process the payment response
        const sessionId = response.sessionId;
        console.log(response);
        // Send session ID and other details to your backend for further processing
        axios.post(`${import.meta.env.VITE_BACKEND}/execute-apple-payment`, {
            sessionId,
            orderId,
            wixTransactionId,
            amount: `${parseFloat((3.67*(formatAmount(amount))).toFixed(2))}`
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

    return <div id="google-pay-card-element" ref={cardElementRefGP}></div>;
};