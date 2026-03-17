import { useEffect, useState } from "react";
import type { Attraction } from "@types";
// Entry point for application routes
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// Import the register page
import Register from './pages/Register'
// Import the login page
import Login from './pages/Login'
// Import the reservation page
import Reservation from './pages/Reservation'
// Import the my reservations page
import MyReservations from './pages/MyReservations'
// Import the attractions page
import AttractionsPage from "./pages/Attractions"

const App = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  
  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/attractions");
        if (!res.ok) throw new Error("Erreur récupération attractions");
        const data: Attraction[] = await res.json();
        setAttractions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttractions();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/my-account/reservations" element={<MyReservations />} />
        <Route path="/attractions" element={attractions.length > 0 ? <AttractionsPage attractions={attractions} /> : <p>Loading...</p>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

