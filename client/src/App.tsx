import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Attraction } from "@types";
import AttractionsPage from "./pages/Attractions";

const App = () => {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/attractions");
                if (!res.ok) throw new Error("Erreur récupération attractions");

                const data: Attractions[] = await res.json();
                setAttractions(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAttractions();
    }, []);

    return (
        <Routes>
            <Route
                path="/attractions"
                element={
                    attractions.length > 0
                        ? <AttractionsPage attractions={attractions} />
                        : <p>Loading...</p>
                }
            />
        </Routes>
    );
};

export default App;