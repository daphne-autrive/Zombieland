// My reservations page - list of reservations with cancel button

import { useEffect, useState } from 'react'
import { Box, Button, Input, Heading, Text, Flex, Spinner, Badge, Grid, GridItem, Divider, IconButton, Tooltip } from '@chakra-ui/react'
import bgImage from '../assets/bg-image.webp'
import bgBouton from '../assets/bg-bouton.webp'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { PageBackground } from '../components/PageBackground'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import InfoModal from '../components/InfoModal'
import { API_URL } from '@/config/api'
import axiosInstance from '@/lib/axiosInstance'
import { isAxiosError } from 'axios'
import { isoToLocalDate } from '@/utils/date'



// defines the shape of a reservation object...
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
    const [searchParams] = useSearchParams()
    const reservationId = searchParams.get('reservationId')
    // Sort and filter states
    const [sortBy, setSortBy] = useState<'created_at' | 'date' | 'total_amount'>('created_at')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL')
    // loading stores the loading state of the page
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [message, setMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false);
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
        .filter((r) => {
            if (reservationId) return r.id_RESERVATION === parseInt(reservationId)
            // Filtre par statut
            if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
            // Filtre par recherche date
            const search = searchTerm.toLowerCase()
            if (!search) return true
            const dateShort = new Date(r.date).toLocaleDateString('fr-FR').toLowerCase()
            const dateLong = new Date(r.date).toLocaleDateString('fr-FR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }).toLowerCase()
            return dateShort.includes(search) || dateLong.includes(search)
        })
        .sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1
            switch (sortBy) {
                case 'created_at':
                    return (a.id_RESERVATION - b.id_RESERVATION) * dir
                case 'date':
                    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
                case 'total_amount':
                    return (Number(a.total_amount) - Number(b.total_amount)) * dir
                default:
                    return 0
            }
        })

    // Pagination logic
    // 4. Pagination
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

    // Fetch reservations when the page loads
    useEffect(() => {
        setLoading(true)
        const init = async () => {
            try {
                // 1. Fetch user first
                const resUser = await axiosInstance.get(`${API_URL}/api/auth/me`, {
                    withCredentials: true
                })
                const userData = resUser.data
                setCurrentUser(userData)

                // 2. Then fetch reservations based on role
                const isAdminUser = userData.role === 'ADMIN' && !!id
                //ATTENTION MODIf
                const url = isAdminUser
                    //  ? `${API_URL}/api/reservations/user/${id}` route n'existe pas
                    ? `${API_URL}/api/reservations/user/${id}`   // ← route qui existe
                    : `${API_URL}/api/reservations/me`

                const response = await axiosInstance.get(url, { withCredentials: true })
                const data = response.data
                setReservations(data)


            } catch (error) {
                setMessage("Erreur lors de la récupération d'une réservation")
            } finally {
                setLoading(false);
            }
        }
        init()
    }, [id]) // Runs only once on mount


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
        return diffDays <= 10
    }

    // Handle cancel button click — check 10 days rule first

    const handleCancelClick = (reservation: Reservation) => {
        if (isWithin10Days(reservation.date)) {
            setBlockedMessage(`Impossible d'annuler cette réservation car elle est dans moins de 10 jours (le ${new Date(reservation.date)
                .toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}).`)
            return
        }
        setReservationToCancel(reservation.id_RESERVATION)
    }

    // Cancel a reservation by sending a delete request to the api
    const handleCancel = async (reservationId: number, password: string) => {
        try {
            await axiosInstance.delete(`${API_URL}/api/reservations/${reservationId}`, {
                data: { password },
                withCredentials: true,
            })

            // Re-fetch instead of local state update — keeps dashboard in sync
            const resUser = await axiosInstance.get(`${API_URL}/api/auth/me`, { withCredentials: true })
            const userData = resUser.data
            const isAdminUser = userData.role === 'ADMIN' && !!id
            const url = isAdminUser
                ? `${API_URL}/api/reservations/user/${id}`
                : `${API_URL}/api/reservations/me`
            const response = await axiosInstance.get(url, { withCredentials: true })
            setReservations(response.data)

            setMessage('Votre annulation a bien été prise en compte.')
            navigate('/my-account/reservations')

        } catch (error) {
            const message = "Votre annulation n'a pas été prise en compte"
            if (isAxiosError(error)) {
                setMessage(error.response?.data.message || message)
            } else {
                setMessage(message)
            }
        }
    }

    return (
        <PageBackground bgImage={bgImage}>
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

                {/* Search + filters — hidden when filtering by reservationId */}
                {!reservationId && (
                    <Flex direction="column" align="center" gap={4} maxW="560px" w="100%" mb={8}>
                        <Flex w="100%" gap={2}>
                            <Input
                                placeholder="Rechercher par date..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                                color="zombieland.white"
                                borderColor="zombieland.primary"
                                borderWidth="2px"
                                bg="rgba(0,0,0,0.3)"
                                fontFamily="body"
                                _placeholder={{ color: "rgba(250,235,220,0.35)" }}
                                _focus={{ borderColor: "zombieland.cta1orange", boxShadow: "none" }}
                            />
                            <Tooltip
                                label={sortBy === 'date' ? (sortDir === 'desc' ? 'Plus récente → plus vieille' : 'Plus vieille → plus récente') : 'Trier par date'}
                                placement="top"
                                bg="zombieland.secondary"
                                color="zombieland.white"
                                fontSize="12px"
                                fontFamily="body"
                            >
                                <IconButton
                                    aria-label="Trier par date"
                                    icon={
                                        <Text fontSize="16px" lineHeight="1">
                                            {sortBy === 'date' ? (sortDir === 'desc' ? '↓' : '↑') : '⇅'}
                                        </Text>
                                    }
                                    onClick={() => {
                                        if (sortBy === 'date') {
                                            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
                                        } else {
                                            setSortBy('date')
                                            setSortDir('desc')
                                        }
                                        setCurrentPage(1)
                                    }}
                                    bg={sortBy === 'date' ? 'rgba(71,97,130,0.35)' : 'rgba(0,0,0,0.3)'}
                                    color={sortBy === 'date' ? 'zombieland.white' : 'rgba(250,235,220,0.45)'}
                                    border="2px solid"
                                    borderColor={sortBy === 'date' ? 'zombieland.primary' : 'zombieland.primary'}
                                    borderRadius="md"
                                    transition="all 0.2s ease"
                                    _hover={{ bg: 'rgba(71,97,130,0.35)', color: 'zombieland.white' }}
                                />
                            </Tooltip>
                        </Flex>

                        {/* Filtre statut */}
                        <Flex gap={2} wrap="wrap" justify="center">
                            {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((s) => {
                                const isActive = statusFilter === s
                                const activeColor = s === 'CONFIRMED' ? '#a8c04a' : s === 'CANCELLED' ? 'zombieland.warningprimary' : 'zombieland.white'
                                const activeBg = s === 'CONFIRMED' ? 'rgba(168,192,74,0.15)' : s === 'CANCELLED' ? 'rgba(201,168,65,0.15)' : 'rgba(71,97,130,0.25)'
                                const activeBorder = s === 'CONFIRMED' ? '#a8c04a' : s === 'CANCELLED' ? '#C9A841' : 'zombieland.primary'
                                return (
                                    <Button
                                        key={s}
                                        size="sm"
                                        onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
                                        bg={isActive ? activeBg : 'transparent'}
                                        color={isActive ? activeColor : 'rgba(250,235,220,0.45)'}
                                        border="1px solid"
                                        borderColor={isActive ? activeBorder : 'rgba(250,235,220,0.2)'}
                                        fontFamily="body"
                                        fontWeight={isActive ? '700' : '400'}
                                        fontSize="12px"
                                        letterSpacing="0.5px"
                                        textTransform="uppercase"
                                        borderRadius="full"
                                        px={4}
                                        transition="all 0.2s ease"
                                        _hover={{
                                            color: activeColor,
                                            borderColor: activeBorder,
                                            bg: activeBg
                                        }}
                                    >
                                        {s === 'ALL' ? 'Toutes' : s === 'CONFIRMED' ? 'En cours' : 'Annulées'}
                                    </Button>
                                )
                            })}
                        </Flex>
                    </Flex>
                )}

                {loading ? (
                    <Spinner color="zombieland.white" size="xl" />
                ) : filteredReservations.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
                        <Text color="zombieland.white" fontFamily="body" fontWeight="300">
                            {searchTerm ? "Aucun résultat pour cette recherche." : "Vous n'avez pas encore de réservations."}
                        </Text>
                        {!searchTerm && (
                            <Button
                                onClick={() => navigate('/reservation')}
                                bgImage={`url(${bgBouton})`}
                                bgSize="cover"
                                bgPosition="center"
                                color="zombieland.secondary"
                                fontFamily="body"
                                fontWeight="bold"
                                fontSize={{ base: "12px", md: "16px" }}
                                py={5}
                                px={4}
                                borderRadius="full"
                                letterSpacing="1px"
                                textTransform="uppercase"
                                boxShadow="inset 0 2px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)"
                                _hover={{ bg: "zombieland.cta2orange", color: "zombieland.white" }}
                                aria-label="Réserver une visite à Zombieland"
                            >
                                → Réserver maintenant
                            </Button>
                        )}
                    </Box>
                ) : (
                    <>
                        {currentItems.map((reservation: Reservation) => {
                            const isPast = new Date(reservation.date) < new Date()
                            const isCancelled = reservation.status === 'CANCELLED'
                            const isUpcoming = !isPast && !isCancelled

                            return (
                                <Box
                                    key={reservation.id_RESERVATION}
                                    mb={4}
                                    w="100%"
                                    maxW="560px"
                                    borderRadius="lg"
                                    bg="rgba(0,0,0,0.35)"
                                    boxShadow="inset 0 2px 6px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05)"
                                    border="2px solid"
                                    borderColor={isUpcoming ? "zombieland.primary" : "rgba(250,235,220,0.15)"}
                                    transition="all 0.3s ease"
                                    opacity={isPast || isCancelled ? 0.7 : 1}
                                    _hover={{
                                        transform: isUpcoming ? "translateY(-4px)" : "none",
                                        boxShadow: isUpcoming ? "0 8px 24px rgba(0,0,0,0.5)" : undefined,
                                        borderColor: isUpcoming ? "zombieland.cta1orange" : "rgba(250,235,220,0.25)",
                                        bg: "rgba(0,0,0,0.5)"
                                    }}
                                    overflow="hidden"
                                >
                                    {/* Card header */}
                                    <Flex
                                        align="center"
                                        justify="space-between"
                                        px={6}
                                        py={3}
                                        bg="rgba(0,0,0,0.25)"
                                        borderBottom="1px solid"
                                        borderColor="rgba(250,235,220,0.08)"
                                    >
                                        <Text
                                            color="zombieland.white"
                                            fontFamily="heading"
                                            fontSize="18px"
                                            letterSpacing="1px"
                                        >
                                            Réservation #{reservation.id_RESERVATION}
                                        </Text>
                                        <Badge
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="11px"
                                            fontFamily="body"
                                            fontWeight="700"
                                            letterSpacing="1px"
                                            textTransform="uppercase"
                                            bg={
                                                isCancelled ? "rgba(201,168,65,0.2)"
                                                    : isPast ? "rgba(71,97,130,0.3)"
                                                        : "rgba(140,125,38,0.3)"
                                            }
                                            color={
                                                isCancelled ? "zombieland.warningprimary"
                                                    : isPast ? "zombieland.primary"
                                                        : "#a8c04a"
                                            }
                                            border="1px solid"
                                            borderColor={
                                                isCancelled ? "zombieland.warningprimary"
                                                    : isPast ? "zombieland.primary"
                                                        : "#a8c04a"
                                            }
                                        >
                                            {isCancelled ? "Annulée" : isPast ? "Passée" : "Confirmée"}
                                        </Badge>
                                    </Flex>

                                    {/* Card body */}
                                    <Box px={6} py={5}>
                                        <Grid templateColumns="1fr 1fr 1fr" gap={4} mb={4}>
                                            <GridItem>
                                                <Text color="rgba(250,235,220,0.55)" fontFamily="body" fontSize="11px" fontWeight="500" textTransform="uppercase" letterSpacing="1px" mb={1}>
                                                    Date de visite
                                                </Text>
                                                <Text color="zombieland.white" fontFamily="body" fontWeight="400" fontSize="14px" lineHeight="1.4">
                                                    {isoToLocalDate(reservation.date).toLocaleDateString('fr-FR', {
                                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </Text>
                                            </GridItem>
                                            <GridItem>
                                                <Text color="rgba(250,235,220,0.55)" fontFamily="body" fontSize="11px" fontWeight="500" textTransform="uppercase" letterSpacing="1px" mb={1}>
                                                    Billets
                                                </Text>
                                                <Text color="zombieland.white" fontFamily="body" fontWeight="400" fontSize="14px">
                                                    {reservation.nb_tickets} {reservation.nb_tickets > 1 ? 'billets' : 'billet'}
                                                </Text>
                                            </GridItem>
                                            <GridItem>
                                                <Text color="rgba(250,235,220,0.55)" fontFamily="body" fontSize="11px" fontWeight="500" textTransform="uppercase" letterSpacing="1px" mb={1}>
                                                    Montant
                                                </Text>
                                                <Text
                                                    color={isCancelled ? "zombieland.warningprimary" : "zombieland.white"}
                                                    fontFamily="body"
                                                    fontWeight="600"
                                                    fontSize="15px"
                                                >
                                                    {isCancelled ? 'Remboursé' : `${Number(reservation.total_amount).toFixed(2)} €`}
                                                </Text>
                                            </GridItem>
                                        </Grid>

                                        {new Date(reservation.date) >= new Date() && !isCancelled && (
                                            <>
                                                <Divider borderColor="rgba(250,235,220,0.1)" mb={4} />
                                                <Flex justifyContent="flex-end">
                                                    <Button
                                                        onClick={() => {
                                                            if (currentUser?.role === 'ADMIN') {
                                                                setReservationToCancel(reservation.id_RESERVATION);
                                                            } else {
                                                                handleCancelClick(reservation);
                                                            }
                                                        }}
                                                        bgImage={`url(${bgBouton})`}
                                                        bgSize="cover"
                                                        bgPosition="center"
                                                        color="zombieland.secondary"
                                                        fontFamily="body"
                                                        fontWeight="bold"
                                                        fontSize={{ base: "12px", md: "13px" }}
                                                        py={3}
                                                        px={5}
                                                        borderRadius="full"
                                                        boxShadow="inset 0 2px 8px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)"
                                                        _hover={{ opacity: 0.8 }}
                                                        aria-label={`Annuler la réservation du ${isoToLocalDate(reservation.date).toLocaleDateString('fr-FR')}`}
                                                    >
                                                        Annuler la réservation
                                                    </Button>
                                                </Flex>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            )
                        })}

                        {/* Pagination controls */}
                        <Flex mt={6} gap={4} alignItems="center" justifyContent="center">
                            <Button
                                size="sm"
                                variant="outline"
                                color="zombieland.white"
                                borderColor="zombieland.primary"
                                _hover={{ bg: "zombieland.primary", color: "black" }}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                                aria-label="Page précédente"
                            >
                                Précédent
                            </Button>

                            <Text color="zombieland.white" fontSize="sm">
                                Page {currentPage} sur {totalPages || 1}
                            </Text>

                            <Button
                                size="sm"
                                variant="outline"
                                color="zombieland.white"
                                borderColor="zombieland.primary"
                                _hover={{ bg: "zombieland.primary", color: "black" }}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                isDisabled={currentPage === totalPages || totalPages === 0}
                                aria-label="Page suivante"
                            >
                                Suivant
                            </Button>
                        </Flex>
                    </>
                )}
            </Box>

            {
                message && (
                    <Text
                        mt={4}
                        textAlign="center"
                        fontFamily="body"
                        fontWeight="300"
                        color="zombieland.white"
                    >
                        {message}
                    </Text>
                )
            }

            {/* Confirm cancellation modal with password */}
            <InfoModal
                isOpen={blockedMessage !== null}
                onClose={() => setBlockedMessage(null)}
                title="Annulation impossible"
                message={blockedMessage ?? ""}
                titleColor="zombieland.warningprimary"
            />

            {/* Confirm cancellation modal with password */}
            <ConfirmModal
                isOpen={reservationToCancel !== null}
                onClose={() => setReservationToCancel(null)}
                title="Annuler la réservation"
                message="Voulez-vous vraiment annuler cette réservation ? Cette action est irréversible."
                onConfirm={(password) => {
                    if (reservationToCancel) {
                        // Small delay to let the ConfirmModal close before showing the success modal
                        setTimeout(() => {
                            handleCancel(reservationToCancel, password)
                        }, 300)
                    }
                    setReservationToCancel(null)
                }}
            />

            {/* 3. Success modal */}
            <InfoModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    // Small delay before redirect to avoid visual flash
                    // If the user is an admin, we redirect to the member's reservations page, 
                    // otherwise we redirect to the user's own reservations page
                    setTimeout(() => {
                        const destination = (isAdmin && id)
                            ? `/admin/members/${id}`
                            : '/my-account/reservations';
                        navigate(destination);
                    }, 300)
                }}
                title="Annulation confirmée"
                message="Votre réservation a été annulée avec succès. Vous allez être redirigé."
            />

            <Footer />
        </PageBackground >
    )
}

export default MyReservations