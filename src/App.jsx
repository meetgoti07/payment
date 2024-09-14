import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Card from "./pages/Card.jsx";
import Success from "./pages/Success.jsx";
import Failed from "./pages/Failed.jsx";
import { useEffect } from "react";

function App() {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener("contextmenu", handleContextMenu);

        // Cleanup the event listener when the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<div>403 Unauthorised</div>} />
                <Route path="/pay" element={<Card />} />
                <Route path="/success" element={<Success />} />
                <Route path="/failure" element={<Failed />} />
            </Routes>
        </Router>
    );
}

export default App;
