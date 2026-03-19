// MyAccount page - user's profile which can be update or deleted

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Button, Heading, Flex, Input, Text } from '@chakra-ui/react'
import bgImage from '../assets/bg-image.png'
import bgBouton from '../assets/bg-bouton.png'
import Header from '../components/Header'
import Footer from '../components/Footer'

function MyAccount() {
  const [form, setForm] = useState({ firstname: '', lastname: '', password: '', confirmPassword: '' })
  const [currentUser, setCurrentUser] = useState<{id: number} | null>(null)
  const [message, setMessage] = useState('')
  const [reservations, setReservations] = useState([])
  const navigate = useNavigate();

  //Copy from "MyReservations"
  //Waiting for a refacto to add a filter,
  //Work on backend necessary to get AllReservations, 
  //OneReservations or a query.params to have a filter
  useEffect(() => {
    const fetchReservations = async () => {
      // Call the backend API to retrieve the reservations
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
        credentials: 'include' //to get the cookie sent from the back, the browser is automatically dealing with
      })
      // Convert the response to JSON
      const data = await response.json()
      setReservations(data)
    }
    fetchReservations()
  }, []) // Runs only once on mount

  const handleUpdate = async () => {
    //fetching on the api with patch methode
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/:id/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname: form.firstname, lastname: form.lastname, password: form.password }),
      credentials: 'include' //to get the cookie sent from the back, the browser is automatically dealing with
    })
    //only if response is ok the connection is allowed
    if (response.ok) {
      setMessage(' Votre profile a été mis à jour !');
    } else {
      //otherwise displaying an error message
      setMessage('Une erreur est survenue, veuillez réessayer.')
    }
  }

  return (

  )
}

export default MyAccount