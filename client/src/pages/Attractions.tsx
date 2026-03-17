import { Box, Wrap, WrapItem } from "@chakra-ui/react";
import AttractionCard from "./AttractionsCard";
import type { Attraction } from "@types";

interface AttractionsProps {
    attractions: Attraction[];
}

const AttractionsPage = ({ attractions }: AttractionsProps) => {
    return (
        <Box>
            <Wrap gap={8} bg="#042032" p={4} color="#be0964ff">
                {attractions.map((attraction) => (
                    <WrapItem key={attraction.id_ATTRACTION}>
                        <AttractionCard {...attraction} />
                    </WrapItem>
                ))}
            </Wrap>
        </Box>
    );
};

export default AttractionsPage;





