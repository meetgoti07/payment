import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/success.css';
import axios from 'axios';
import Cookies from "js-cookie";

const Success = () => {
    const [loading, setLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const navigate = useNavigate();
    const { paymentId } = useParams(); // Assuming paymentId is passed as a URL parameter

    const getQueryParams = () => {
        const params = new URLSearchParams(location.search);
        return {
            paymentId: params.get('paymentId'),
            Id: params.get('Id')
        };
    };

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            const { paymentId } = getQueryParams();
            const url = Cookies.get('ref');
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND}/GetPaymentStatus`, {
                    key: paymentId,
                    url
                });
                const { data } = response.data;

                if (data.Data.InvoiceStatus === 'Paid') {
                    setIsPaid(true);

                    // Redirect to new link after 3 seconds
                    setTimeout(() => {
                        window.open('https://www.econorace.net/memberaccess', '_blank');
                    }, 3000);
                } else {
                    navigate('/failure');
                }
            } catch (error) {
                console.error('Error fetching payment status:', error);
                navigate('/failure');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentStatus();
    }, [paymentId, navigate]);

    const handleGoHome = () => {
        // Close the tab
        window.close();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-blue-50">
                <div className="border border-gray-300 p-8 rounded-lg bg-white shadow-md">
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isPaid) {
        return null; // Redirects to failure page
    }

    return (
        <div className="flex justify-center items-center h-screen bg-blue-50 text-center">
            <div className="border border-gray-300 p-8 rounded-lg bg-white shadow-md">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-4"/>
                <h1 className="text-4xl font-bold text-green-500 mb-2">Success!</h1>
                <p className="text-lg mb-4">Your transaction has been completed successfully.<br/>You will be redirected
                    to <a href="https://www.econorace.net/memberaccess" target="_blank">https://www.econorace.net/memberaccess</a></p>
            </div>
        </div>
    );
}

export default Success;
