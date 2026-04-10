import { useEffect, useState } from "react";
import AttractionCard from "../components/AttractionsCard";
import type { Attraction } from "@types";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Box, Image, Button, Text, Wrap, WrapItem, Flex, Heading, IconButton, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, useDisclosure } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"
import { PageBackground } from "../components/PageBackground";
// Images
import bgButton from '../assets/bg-bouton.webp';
import bgImage from '../assets/bg-image.webp';
import zombi from '../assets/zombi.webp';
import fosse from '../assets/fosse.webp';
import grandhuit from '../assets/grandhuit.webp';
import reception from '../assets/reception.webp';
import train from '../assets/train.webp';
import parkEntryLandscape from '../assets/park-entry-landscape.webp';
import img1 from "../assets/quarantaine.webp"
import img2 from "../assets/ridebiomasse.webp"
import img3 from "../assets/marche.webp"
import img4 from "../assets/grand8.webp"
import img5 from "../assets/fossecadavres.webp"
import img6 from "../assets/centrerecherche.webp"



import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/api";
import axiosInstance from "@/lib/axiosInstance";

// Conversion catégories → enum backend
const categoryToEnum: Record<string, string> = {
    "Peur Acceptable": "LOW",
    "Peur Survivable": "MEDIUM",
    "Peur Mortelle": "HIGH",
};

const carouselImages = [
    { src: zombi, alt: "Zombie" },
    { src: fosse, alt: "Fosse de cadavres" },
    { src: grandhuit, alt: "Grand 8" },
    { src: reception, alt: "Réception" },
    { src: train, alt: "Train fantôme" },
]

const HomePage = () => {


    // États & logique de données

    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [selectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Current slide index for the carousel
    const [currentSlide, setCurrentSlide] = useState(0)

    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Images associées aux attractions
    const attractionImages: Record<number, string> = {
        1: img1,
        2: img2,
        3: img3,
        4: img4,
        5: img5,
        6: img6,
    };

    // Récupération des attractions
    useEffect(() => {
        const fetchAttractions = async () => {
            try {
                const res = await axiosInstance.get<Attraction[]>(`${API_URL}/api/attractions`);
                setAttractions(res.data);

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError("Erreur lors de la récupération des attractions");
            }
        };

        fetchAttractions();
    }, []);


    // Go to previous slide
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))
    // Go to next slide
    const nextSlide = () => setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))

    // Attractions pictures filtered by category (if any)
    const filteredAttractions = selectedCategory
        ? attractions.filter(a => a.intensity === categoryToEnum[selectedCategory])
        : attractions;
    return (
        <PageBackground bgImage={bgImage}>
            <Header />

            {/* Picture enter parc */}

            <Box
                pb={6}
                transition="all 0.3s ease"
                _hover={{ transform: "scale(1.02)" }}
                overflow="hidden"
                borderRadius="md"
            >
                <Image
                    src={parkEntryLandscape}
                    alt="Entrée du parc"
                    mx="auto"
                    width="100%"
                    transition="all 0.3s ease"
                />
            </Box>


            {/* Button to navigate to reservations */}
            <Button
                onClick={() => navigate('/reservation')}
                bgImage={`url(${bgButton})`}
                bgSize="cover"
                bgPosition="center"
                mx="auto"
                color="zombieland.secondary"
                borderRadius="full"
                transition="all 0.3s ease"
                _hover={{
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 20px rgba(250, 235, 220, 0.2)",
                    opacity: 0.9
                }}
                _active={{ transform: "translateY(-1px)" }}
                mb={8}
                fontWeight="bold"
                fontSize="18px"
                py={6}
                px={12}
                boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                aria-label="Réserver maintenant"
            >
                → Réserver maintenant
            </Button>

            <Box px={10} py={16} maxW="1000px" mx="auto" textAlign="center">
                <Text
                    fontSize={{ base: "2xl", sm: "3xl", lg: "4xl" }}
                    color="zombieland.white"
                    fontFamily="heading"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    mb={8}
                    fontWeight="bold"
                >
                    Une ville abandonnée. . des zombies... et vous.
                </Text>
                <Box
                    bg="rgba(41, 48, 54, 0.82)"
                    border="1px solid rgba(71, 97, 130, 0.5)"
                    borderRadius="lg"
                    px={{ base: 6, lg: 10 }}
                    py={8}
                    boxShadow="0 4px 32px rgba(0,0,0,0.4)"
                    backdropFilter="blur(8px)"
                    transition="all 0.25s ease"
                    _hover={{
                        bg: "rgba(41, 48, 54, 0.95)",
                        borderColor: "rgba(250, 235, 220, 0.35)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.55)"
                    }}
                >
                    <Text
                        fontSize={{ base: "md", sm: "lg", lg: "xl" }}
                        color="zombieland.white"
                        fontFamily="body"
                        fontWeight="300"
                        lineHeight="2"
                        mb={6}
                    >
                        Bienvenue à ZombieLand, une expérience immersive où chaque attraction
                        vous plonge au cœur d'un monde post-apocalyptique...
                    </Text>
                    <Box w="40px" h="1px" bg="zombieland.white" opacity={0.35} mx="auto" my={6} />
                    <Text
                        fontSize={{ base: "md", sm: "lg", lg: "xl" }}
                        color="zombieland.white"
                        fontFamily="body"
                        fontWeight="400"
                        lineHeight="2"
                    >
                        Ici, survivre fait partie du jeu. Arriverez-vous à survivre ?
                        Maîtriserez-vous vos peurs ?
                    </Text>
                </Box>
            </Box>

            {/* Galerie photos */}
            <Box px={{ base: 4, lg: 10 }} py={10} maxW="700px" mx="auto" w="100%">

                {/* Image principale portrait */}
                <Box
                    borderRadius="md"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={onOpen}
                    mb={3}
                    transition="opacity 0.3s ease"
                    _hover={{ opacity: 0.9 }}
                >
                    <Image
                        src={carouselImages[currentSlide].src}
                        alt={carouselImages[currentSlide].alt}
                        w="100%"
                        objectFit="contain"
                    />
                </Box>

                {/* Vignettes avec flèches de chaque côté */}
                <Flex align="center" gap={2}>
                    {/* Flèche gauche */}
                    <IconButton
                        aria-label="Précédent"
                        icon={<LuChevronLeft />}
                        onClick={prevSlide}
                        variant="ghost"
                        color="zombieland.white"
                        fontSize="22px"
                        flexShrink={0}
                        transition="all 0.2s ease"
                        _hover={{ bg: "rgba(250,235,220,0.15)", transform: "scale(1.2)" }}
                        _active={{ transform: "scale(0.95)" }}
                    />

                    {/* Vignettes */}
                    <Flex gap={2} flex="1">
                        {carouselImages.map((img, index) => (
                            <Box
                                key={index}
                                flex="1"
                                h={{ base: "55px", md: "72px" }}
                                borderRadius="sm"
                                overflow="hidden"
                                cursor="pointer"
                                opacity={index === currentSlide ? 1 : 0.45}
                                border={index === currentSlide ? "2px solid rgba(250,235,220,0.9)" : "2px solid transparent"}
                                transition="all 0.2s ease"
                                _hover={{ opacity: 0.85 }}
                                onClick={() => setCurrentSlide(index)}
                            >
                                <Image src={img.src} alt={img.alt} w="100%" h="100%" objectFit="cover" />
                            </Box>
                        ))}
                    </Flex>

                    {/* Flèche droite */}
                    <IconButton
                        aria-label="Suivant"
                        icon={<LuChevronRight />}
                        onClick={nextSlide}
                        variant="ghost"
                        color="zombieland.white"
                        fontSize="22px"
                        flexShrink={0}
                        transition="all 0.2s ease"
                        _hover={{ bg: "rgba(250,235,220,0.15)", transform: "scale(1.2)" }}
                        _active={{ transform: "scale(0.95)" }}
                    />
                </Flex>
            </Box>

            {/* Section attractions */}
            <Box px={{ base: 4, lg: 10 }} py={6} maxW="1100px" mx="auto" w="100%">
                <Flex align="center" gap={4} mb={8} justify="center">
                    <Box h="1px" flex="1" bg="rgba(250,235,220,0.15)" />
                    <Heading
                        fontFamily="heading"
                        fontSize={{ base: "32px", lg: "42px" }}
                        color="zombieland.white"
                        textAlign="center"
                        letterSpacing="1px"
                    >
                        Les expériences qui vous attendent
                    </Heading>
                    <Box h="1px" flex="1" bg="rgba(250,235,220,0.15)" />
                </Flex>

                <Wrap spacing="40px" justify="center" mb={10}>
                    {filteredAttractions.slice(0, 3).map((attraction) => (
                        <WrapItem key={attraction.id_ATTRACTION}>
                            <AttractionCard
                                {...attraction}
                                image={attractionImages[attraction.id_ATTRACTION]}
                            />
                        </WrapItem>
                    ))}
                </Wrap>
                {error && <Text>{error}</Text>}

                <Flex justify="center" mb={8}>
                    <Button
                        onClick={() => navigate('/attractions')}
                        bgImage={`url(${bgButton})`}
                        bgSize="cover"
                        bgPosition="center"
                        color="zombieland.secondary"
                        borderRadius="full"
                        transition="all 0.3s ease"
                        _hover={{
                            transform: "translateY(-3px)",
                            boxShadow: "0 8px 20px rgba(250, 235, 220, 0.2)",
                            opacity: 0.9
                        }}
                        _active={{ transform: "translateY(-1px)" }}
                        fontWeight="bold"
                        fontSize="18px"
                        py={6}
                        px={12}
                        boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                        aria-label="Voir toutes nos attractions"
                    >
                        → Toutes nos attractions
                    </Button>
                </Flex>
            </Box>

            {/* Modal for zoomed carousel image */}
            <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered motionPreset="slideInBottom">
                <ModalOverlay bg="rgba(0,0,0,0.95)" backdropFilter="blur(5px)" />
                <ModalContent bg="transparent" boxShadow="none">
                    <ModalCloseButton
                        color="zombieland.white"
                        fontSize="28px"
                        position="fixed"
                        top={4}
                        right={4}
                        zIndex={1000}
                        _hover={{ opacity: 0.8 }}
                    />
                    <ModalBody display="flex" alignItems="center" justifyContent="center" minH="100vh" p={4}>
                        <Image
                            src={carouselImages[currentSlide].src}
                            alt={carouselImages[currentSlide].alt}
                            maxW="90vw"
                            maxH="90vh"
                            objectFit="contain"
                            borderRadius="md"
                            boxShadow="0 0 50px rgba(250, 130, 52, 0.3)"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Footer />
        </PageBackground>
    );
};

export default HomePage;