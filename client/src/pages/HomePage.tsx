import Header from "../components/Header";
import Footer from "../components/Footer";
import bgImage from '../assets/bg-image.png';
import parkEntryLandscape from '../assets/park-entry-landscape.png';
import { Box, Image } from "@chakra-ui/react";

const HomePage = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            bgAttachment="fixed"
            bgImage={`url(${bgImage})`}
        >
            <Header />

            <Box pt="80px" pb="100px">
                
                <Image src={parkEntryLandscape} alt="Entrée du parc" width="100%" />
            </Box>

            <Footer />
        </Box>
    );
};

export default HomePage;