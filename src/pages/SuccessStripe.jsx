import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/success.css';

const SuccessStripe = () => {

    useEffect(() => {
        // Set a timeout to open a new tab after 3 seconds
        const timer = setTimeout(() => {
            window.open('https://www.econorace.net/memberaccess', '_blank');
        }, 3000);

        // Clear the timer if the component is unmounted
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex justify-center items-center h-screen bg-blue-50 text-center">
            <div className="border border-gray-300 p-8 rounded-lg bg-white shadow-md">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-4"/>
                <h1 className="text-4xl font-bold text-green-500 mb-2">Success!</h1>
                <p className="text-lg mb-4">Your transaction has been completed successfully.<br/>You will be redirected to <a href="https://www.econorace.net/memberaccess">https://www.econorace.net/memberaccess</a></p>
            </div>
        </div>
    );
}

export default SuccessStripe;
