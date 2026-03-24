import { useState, useEffect } from "react";
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { API_URL } from "@/config/api";

interface Reservation {
    id_RESERVATION: number
    nb_tickets: number
    date: string
    total_amount: string
    status: string
    id_USER: number
    id_TICKET: number
}

const AdminReservations = () => {
    const [ reservations, setReservations] =useState<Reservation[]>([]);
    const [ loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');

    useEffect(() => {
        const axiosReservation = async () => {
         try {

             const response = await axios.get(`${API_URL}/api/reservations`, 
                {
                withCredentials: true,
                });
            setReservations(response.data)
            setLoading(false)
        } catch (error) {
            setError("Erreur lors du chargement")
        }
    };
        axiosReservation()
    }, []);

    const handleStatusChange = async (id: number, status: string) => {
    await axios.patch(`${API_URL}/api/reservations/${id}`,
        { status },
        { withCredentials: true }
    )
    // Met à jour le state local pour refléter le changement
    setReservations(reservations.map(r =>
        r.id_RESERVATION === id ? { ...r, status } : r
    ))
}
    
    const filteredReservations = reservations.filter(r => filterStatus === "All" || r.status === filterStatus)
    return(
        <></>
    );

};
export default AdminReservations