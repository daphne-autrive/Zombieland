import { useState, useEffect } from "react";
import axios from "axios";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { API_URL } from "@/config/api";
import type { Reservation } from "@/types/Reservations";
import { Badge, Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from "@chakra-ui/react";
import AdminTable from "@/components/AdminTable";
import bgImage from '../../assets/bgadminpage.png'



const AdminReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
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
    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            bgAttachment="fixed"
            bgImage={`url(${bgImage})`}
            bgSize="cover"
        >
            <Header />

            <Box flex="1" p={3} pt="100px" pb="100px" maxW="1000px" mx="auto" w="100%">

                <Text fontWeight="bold" color="zombieland.white" mb={6} textAlign="center" fontFamily="heading" fontSize="54px">
                    Gestion des réservations
                </Text>

                {/* Filter button */}
                <Flex justifyContent={{ base: "center", lg: "flex-end" }} mb={6}>
                    <Menu>
                        <MenuButton
                            color="zombieland.white"
                            px={4}
                            py={2}
                            border="2px solid"
                            borderColor="zombieland.primary"
                            borderRadius="md"
                            transition="all 0.3s ease"
                            _hover={{
                                borderColor: "zombieland.cta1orange",
                                color: "zombieland.cta1orange"
                            }}
                        >
                            Filtrer par status
                        </MenuButton>
                        <MenuList bg="#1a1a1a" border="1px solid #333">
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setFilterStatus("All")}>Tous</MenuItem>
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setFilterStatus("CONFIRMED")}>Confirmer</MenuItem>
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setFilterStatus("CANCELLED")}>Annuler</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>

                {/* Loading spinner */}
                {loading && (
                    <Flex justify="center" mt={10}>
                        <Spinner color="zombieland.primary" size="xl" />
                    </Flex>
                )}

                {error && <Text color="red.400">{error}</Text>}

                {!loading && (
                    <AdminTable
                        data={filteredReservations}
                        columns={[
                            {
                                header: "ID",
                                render: (r) => r.id_RESERVATION
                            },
                            {
                                header: "Membre",
                                render: (r) => r.id_USER
                            },
                            {
                                header: "Date",
                                render: (r) => new Date(r.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                            },
                            {
                                header: "Billets",
                                render: (r) => r.nb_tickets
                            },
                            {
                                header: "Statut",
                                render: (r) => (
                                    <Badge colorScheme={r.status === "CONFIRMED" ? "green" : "red"}>
                                        {r.status}
                                    </Badge>
                                )
                            },
                            {
                                header: "Actions",
                                render: (r) => (
                                    <Flex gap={3}>
                                        <Button
                                            size="sm"
                                            bg="#3E4D28"
                                            color="white"
                                            _hover={{ opacity: 0.8 }}
                                            isDisabled={r.status === "CONFIRMED"}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(r.id_RESERVATION, "CONFIRMED")
                                            }}
                                        >
                                            Confirmer
                                        </Button>
                                        <Button
                                            size="sm"
                                            bg="#8C6E21"
                                            color="white"
                                            _hover={{ bg: "#6e5519" }}
                                            isDisabled={r.status === "CANCELLED"}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStatusChange(r.id_RESERVATION, "CANCELLED")
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                    </Flex>
                                )
                            }
                        ]}
                    />
                )}
            </Box>
            <Footer />
        </Box>
    )
}


export default AdminReservations