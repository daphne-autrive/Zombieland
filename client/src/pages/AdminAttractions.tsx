// Admin page to manage attractions : list, filter, edit and delete
import { useEffect, useState, useRef } from "react"
import { Box, Text, Button, Flex, Menu, MenuButton, MenuList, MenuItem, Spinner, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import bgImage from '../assets/bg-image.png'
import type { Attraction } from "@types"

const categoryToEnum: Record<string, string> = {
    "Peur Acceptable": "LOW",
    "Peur Survivable": "MEDIUM",
    "Peur Mortelle": "HIGH",
}

const AdminAttractions = () => {
    const [attractions, setAttractions] = useState<Attraction[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const [attractionToDelete, setAttractionToDelete] = useState<number | null>(null)
    const cancelRef = useRef<HTMLButtonElement>(null)

    const fetchAttractions = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attractions`)
        if (!res.ok) {
            setError("Erreur lors de la récupération des attractions")
            setLoading(false)
            return
        }
        const data: Attraction[] = await res.json()
        setAttractions(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchAttractions()
    }, [])

    const handleDelete = async (id: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attractions/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        if (!res.ok) {
            setError("Erreur lors de la suppression de l'attraction")
            return
        }
        // Refresh the list after deletion
        // Rafraîchit la liste après suppression
        fetchAttractions()
    }

    // Filter attractions by category
    // Filtre les attractions par catégorie
    const filteredAttractions = selectedCategory
        ? attractions.filter(a => a.intensity === categoryToEnum[selectedCategory])
        : attractions

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
                    Gestion des attractions
                </Text>

                {/* Filter button */}
                {/* Bouton de filtre */}
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
                            Filtrer par catégorie
                        </MenuButton>
                        <MenuList bg="#1a1a1a" border="1px solid #333">
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setSelectedCategory(null)}>Toutes</MenuItem>
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setSelectedCategory("Peur Acceptable")}>Peur Acceptable</MenuItem>
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setSelectedCategory("Peur Survivable")}>Peur Survivable</MenuItem>
                            <MenuItem bg="#1a1a1a" color="white" _hover={{ bg: "#333" }} onClick={() => setSelectedCategory("Peur Mortelle")}>Peur Mortelle</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>

                {/* Loading spinner */}
                {/* Spinner de chargement */}
                {loading && (
                    <Flex justify="center" mt={10}>
                        <Spinner color="zombieland.primary" size="xl" />
                    </Flex>
                )}

                {error && <Text color="red.400">{error}</Text>}

                {/* Attractions table */}
                {/* Tableau des attractions */}
                {!loading && (
                    <TableContainer bg="rgba(255,255,255,0.06)" borderRadius="md" border="2px solid" borderColor="zombieland.primary">
                        <Table variant="unstyled">
                            <Thead>
                                <Tr borderBottom="1px solid #333">
                                    <Th color="zombieland.cta1orange">Nom</Th>
                                    <Th color="zombieland.cta1orange">Intensité</Th>
                                    <Th color="zombieland.cta1orange">Durée</Th>
                                    <Th color="zombieland.cta1orange">Capacité</Th>
                                    <Th color="zombieland.cta1orange">Taille min.</Th>
                                    <Th color="zombieland.cta1orange">Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredAttractions.map((attraction) => (
                                    <Tr
                                        key={attraction.id_ATTRACTION}
                                        borderBottom="1px solid #222"
                                        transition="all 0.3s ease"
                                        cursor="pointer"
                                        _hover={{
                                            bg: "rgba(255,255,255,0.05)",
                                            borderColor: "zombieland.cta1orange",
                                        }}
                                        // Navigate to attraction detail page on row click
                                        // Navigue vers la page de détail de l'attraction au clic sur la ligne
                                        onClick={() => navigate(`/attractions/${attraction.id_ATTRACTION}`)}
                                    >
                                        <Td color="zombieland.white" fontWeight="bold">{attraction.name}</Td>
                                        <Td color="gray.400">{attraction.intensity}</Td>
                                        <Td color="gray.400">{attraction.duration ?? "—"}</Td>
                                        <Td color="gray.400">{attraction.capacity ?? "—"}</Td>
                                        <Td color="gray.400">{attraction.min_height ? `${attraction.min_height} cm` : "—"}</Td>
                                        <Td>
                                            <Flex gap={3}>
                                                <Button
                                                    size="sm"
                                                    border="2px solid"
                                                    borderColor="zombieland.primary"
                                                    color="zombieland.white"
                                                    bg="transparent"
                                                    _hover={{ borderColor: "zombieland.cta1orange", color: "zombieland.cta1orange" }}
                                                    // Prevent row click from triggering
                                                    // Empêche le clic de se propager à la ligne
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/admin/attractions/${attraction.id_ATTRACTION}/edit`)
                                                    }}
                                                >
                                                    Modifier
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    border="2px solid"
                                                    borderColor="red.500"
                                                    color="red.400"
                                                    bg="transparent"
                                                    _hover={{ bg: "red.500", color: "white" }}
                                                    // Prevent row click from triggering
                                                    // Empêche le clic de se propager à la ligne
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setAttractionToDelete(attraction.id_ATTRACTION)
                                                    }}
                                                >
                                                    Supprimer
                                                </Button>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}

            </Box>

            {/* Confirmation popup before deletion */}
            {/* Pop-up de confirmation avant suppression */}
            <AlertDialog
                isOpen={attractionToDelete !== null}
                leastDestructiveRef={cancelRef}
                onClose={() => setAttractionToDelete(null)}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="#1a1a1a" border="1px solid #333">
                        <AlertDialogHeader color="zombieland.white" fontWeight="bold">
                            Supprimer l'attraction
                        </AlertDialogHeader>
                        <AlertDialogBody color="gray.400">
                            Voulez-vous vraiment supprimer cette attraction ? Cette action est irréversible.
                        </AlertDialogBody>
                        <AlertDialogFooter gap={3}>
                            <Button ref={cancelRef} onClick={() => setAttractionToDelete(null)}>
                                Annuler
                            </Button>
                            <Button
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() => {
                                    if (attractionToDelete) handleDelete(attractionToDelete)
                                    setAttractionToDelete(null)
                                }}
                            >
                                Supprimer
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Footer />
        </Box>
    )
}

export default AdminAttractions