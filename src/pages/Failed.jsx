import React, { useEffect } from "react";
import '../styles/failed.css';

const Failed = () => {

    useEffect(() => {
        // Set a timeout to open a new tab after 3 seconds
        const timer = setTimeout(() => {
            window.open('https://www.econorace.net/memberaccess', '_blank');
        }, 3000);

        // Clear the timer if the component is unmounted
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col justify-center items-center">
                <div className="flex justify-center items-center crd mb-3">
                    <p className="text-6xl">❌</p>
                </div>
                <h1>Failed</h1>
                <p>“Your card was declined. Try using Apple Pay or Google Pay. If you are still experiencing issues, please contact support via the chat widget.</p>
            </div>
        </div>
    );
}

export default Failed;
