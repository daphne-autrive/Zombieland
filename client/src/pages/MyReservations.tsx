// My reservations page - list of reservations with cancel button

import { useEffect, useState } from 'react'
import { Box, Button, Heading, Text, Flex, Spinner } from '@chakra-ui/react'
import bgImage from '../assets/bg-image.png'
import bgBouton from '../assets/bg-bouton.png'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import InfoModal from '../components/InfoModal'
import { isoToLocalDate } from '@/utils/date'

// defines the shape of a reservation object
// use an interface instead of any allows ts to check that we are accessing valid fiels
interface Reservation {
    id_RESERVATION: number
    nb_tickets: number
    date: string
    total_amount: string
    status: string
    created_at: string
    updated_at: string
    id_USER: number
    id_TICKET: number
}

function MyReservations() {
    // reservations stores the list of reservations retrieved from the API
    // tells ts that this state is always an aray of reservation objects
    const [reservations, setReservations] = useState<Reservation[]>([])
    // loading stores the loading state of the page
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [message, setMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)
    const [reservationToCancel, setReservationToCancel] = useState<number | null>(null)
    const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
    // pagination states
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    // id management
    // isAdmin is true only if the connected user is an admin AND there is a member id in the URL
    // this prevents members from accessing other members' reservations even if they know the URL
    const { id } = useParams()
    const isAdmin = currentUser?.role === 'ADMIN' && !!id

    // Filtering and sorting the reservations based on the search term and the current page
    const filteredReservations = reservations
        .filter((r) => r.status !== 'CANCELLED')
        .filter((r) => {
            const search = searchTerm.toLowerCase()
            const dateStr = new Date(r.date).toLocaleDateString('fr-FR').toLowerCase()
            return dateStr.includes(search) || r.id_RESERVATION.toString().includes(search)
        })
        // Sort by default by date desc (most recent first)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination logic
    // 4. Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

    // Fetch reservations when the page loads
    useEffect(() => {
        const init = async () => {
            // 1. Fetch user first
            const resUser = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                credentials: 'include'
            })
            const userData = await resUser.json()
            setCurrentUser(userData)

            // 2. Then fetch reservations based on role
            const isAdminUser = userData.role === 'ADMIN' && !!id
            const url = isAdminUser
                ? `${import.meta.env.VITE_API_URL}/api/reservations/user/${id}`
                : `${import.meta.env.VITE_API_URL}/api/reservations/me`

            const response = await fetch(url, { credentials: 'include' })
            const data = await response.json()
            if (!response.ok) { setLoading(false); return }
            setReservations(data)
            setLoading(false)
        }
        init()
    }, []) // Runs only once on mount

    // Check if the reservation is less than 10 days away
    const isWithin10Days = (dateStr: string) => {
        const reservationDate = isoToLocalDate(dateStr)
        const today = new Date()
        // Set time to midnight for accurate day comparison
        today.setHours(0, 0, 0, 0)
        // Calculate the difference in days between the reservation date and today
        const diffTime = reservationDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Return true if the reservation is within 10 days, false otherwise
        return diffDays < 10
    }

    // Handle cancel button click — check 10 days rule first

    const handleCancelClick = (reservation: Reservation) => {
        if (isWithin10Days(reservation.date)) {
            setBlockedMessage(`Impossible d'annuler cette réservation car elle est dans moins de 10 jours (le ${new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).`)
            return
        }
        setReservationToCancel(reservation.id_RESERVATION)
    }

    // Cancel a reservation by sending a delete request to the api
    const handleCancel = async (id_res: number, password: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/${id_res}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })

        if (response.ok) {
            setReservations(reservations.filter((r: Reservation) => r.id_RESERVATION !== id_res))
            setMessage('Votre annulation a bien été prise en compte.')
            // Navigate to the member's reservations page after cancellation 
            // (in case an admin is cancelling another member's reservation)
            const destination = (isAdmin && id)
                ? `/admin/members/${id}`
                : '/my-account/reservations'

            navigate(destination)
        } else {
            const data = await response.json()
            setMessage(data.message)
        }
    }

    const activeReservations = reservations.filter((r: Reservation) => r.status !== 'CANCELLED')
    return (
        <Box
            minH="100vh"
            bgImage={`url(${bgImage})`}
            bgSize="cover"
            // bgAttachment="fixed"
            bgPosition="center"
            display="flex"
            flexDirection="column"
        >
            <Header />

            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                px={8}
                py={10}
                minH="70vh"
            >
                <Heading
                    mb={10}
                    fontFamily="heading"
                    fontSize="54px"
                    textAlign="center"
                    color="zombieland.white"
                >
                    {isAdmin ? "Réservations du membre" : "Mes réservations"}
                </Heading>

                {loading ? (
                    <Spinner color="zombieland.white" size="xl" />
                ) : activeReservations.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
                        <Text color="zombieland.white" fontFamily="body" fontWeight="300">
                            Vous n'avez pas encore de réservations.
                        </Text>
                        <Button
                            onClick={() => navigate('/reservation')}
                            bgImage={`url(${bgBouton})`}
                            bgSize="cover"
                            bgPosition="center"
                            color="zombieland.secondary"
                            fontFamily="body"
                            fontWeight="bold"
                            fontSize="16px"
                            py={5}
                            px={4}
                            borderRadius="full"
                            letterSpacing="1px"
                            textTransform="uppercase"
                            boxShadow="inset 0 2px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)"
                            _hover={{ bg: "zombieland.cta2orange" }}
                        >
                            → Réserver maintenant
                        </Button>
                    </Box>
                ) : (
                    activeReservations.map((reservation: Reservation) => (
                        <Box
                            key={reservation.id_RESERVATION}
                            mb={4}
                            p={6}
                            w="100%"
                            maxW="500px"
                            borderRadius="md"
                            bg="rgba(0,0,0,0.3)"
                            boxShadow="inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)"
                            border="2px solid"
                            borderColor="zombieland.primary"
                            transition="all 0.3s ease"
                            _hover={{
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                                borderColor: "zombieland.cta1orange",
                                bg: "rgba(0,0,0,0.5)"
                            }}
                            cursor="pointer"
                        >
                            <Text color="zombieland.white" fontFamily="body" fontWeight="300" mb={1}>
                                - Date : {new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Text>
                            <Text color="zombieland.white" fontFamily="body" fontWeight="300" mb={1}>
                                - Billets : {reservation.nb_tickets}
                            </Text>
                            <Text color="zombieland.white" fontFamily="body" fontWeight="300" mb={4}>
                                - Statut : {reservation.status}
                            </Text>

                            <Flex justifyContent="flex-end">
                                <Button
                                    onClick={() => isAdmin
                                        ? setReservationToCancel(reservation.id_RESERVATION) // admin → pas de règle J-10
                                        : handleCancelClick(reservation) // membre → règle J-10
                                    }
                                    bgImage={`url(${bgBouton})`}
                                    bgSize="cover"
                                    bgPosition="center"
                                    color="zombieland.secondary"
                                    fontFamily="body"
                                    fontWeight="bold"
                                    fontSize="14px"
                                    py={3}
                                    px={4}
                                    borderRadius="full"
                                    boxShadow="inset 0 2px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)"
                                    _hover={{ opacity: 0.8 }}
                                >
                                    Annuler
                                </Button>
                            </Flex>
                        </Box>
                    ))
                )}
            </Box>

            {message && (
                <Text
                    mt={4}
                    textAlign="center"
                    fontFamily="body"
                    fontWeight="300"
                    color="zombieland.white"
                >
                    {message}
                </Text>
            )}

            {/* Confirm cancellation modal with password */}
            <InfoModal
                isOpen={blockedMessage !== null}
                onClose={() => setBlockedMessage(null)}
                title="Annulation impossible"
                message={blockedMessage ?? ""}
            />

            {/* Confirm cancellation modal with password */}
            <ConfirmModal
                isOpen={reservationToCancel !== null}
                onClose={() => setReservationToCancel(null)}
                title="Annuler la réservation"
                message="Voulez-vous vraiment annuler cette réservation ? Cette action est irréversible."
                onConfirm={(password) => {
                    if (reservationToCancel) handleCancel(reservationToCancel, password)
                    setReservationToCancel(null)
                }}
            />

            <Footer />
        </Box>
    )
}

export default MyReservations