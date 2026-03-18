// Attrtaction Detail Page

import type { Attraction } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { Badge, Box, Button, Heading, Image, Text, Wrap, WrapItem } from "@chakra-ui/react";
import bgImage from '../../public/assets/bg-image.png';
import Header from "@/components/Header";

const AttractionDetailPAge = () => {
  //slug
  const { slug } = useParams();
  // attrctation type
  const [attraction, setAttraction] = useState<Attraction[]>([]);
  // loading prepare
  const [isLoading, setIsLoading] = useState(true)
  //error
  const [error, setError] = useState<String | null>(null)

  const attractionImages: Record<number, string> = {
    1: "/assets/spectacle.png",
    2: "/assets/dead rise.png",
    3: "/assets/foret.png",
    4: "/assets/granderoue.png",
    5: "/assets/piscine.png",
    6: "/assets/ghost-train-landscape.png",
  };
  // refact fetch with axios
  useEffect(() => {
    setIsLoading(true);
    const axiosAttraction = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/attractions/${slug}`);
        if (!res)
          throw new Error("Erreur lors de la récupération d'une attraction");
        setAttraction(res.data);
      } catch (error) {
        console.error(error);
        setError("Attraction non trouvé")
      } finally {
        setIsLoading(false);
      }
    };
    axiosAttraction();

  }, [slug]);

  if (!isLoading) {
    return <p>Chargement de l'attraction'...</p>;
  }
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgImage={`url(${bgImage})`}
    >
      <Header />

      <Image width={100} borderRadius={8} src={image}/>
      <Heading>nom de l'attraction</Heading>
      <Badge colorScheme="blue"></Badge>
      <Text noOfLines={3} mb={4} flex="1">
        {description}
      </Text>
      <Text>xx minutes durée</Text>
      <Text>xx personnes capacité</Text>
      <Text>taille minimal</Text>
      <Badge>catégories</Badge>
      <Button
          borderRadius="15px"
          width="32%"
          bg="zombieland.cta1orange"
          color="white"
          _hover={{ bg: "zombieland.cta2orange" }}
          mt="auto"                 // pousse le bouton en bas
          alignSelf="flex-end" // aligne le bouton à droite
          >
          retour
        </Button>


    </Box >
  );
};

export default AttractionDetailPAge;