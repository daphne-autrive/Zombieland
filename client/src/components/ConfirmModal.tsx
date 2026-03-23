// To confirm the patch or deletion of the informations

import { useState } from 'react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox, Text } from '@chakra-ui/react'

interface ConfirmModalProps { 
    isOpen: boolean
    onClose: () => void
  //here giving the password to the parent component to check if the user is admin or not, 
  // if so allowing him to access the admin page
  //parents receiving this in : onConfirm={(password) => handleUpdate(password)}
  //then handleUpdate send it to the body of the PATCH request to check 
  // if the password is correct :
  //body: JSON.stringify ({
  //  firstname: ...,
  //  lastname: ...,
  //  password: ...,
  //  currentPassword: password  ← NEW FIELD =)
  //})
    onConfirm: (password: string) => void
    title: string
    message: string
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {

  const [isChecked, setIsChecked] = useState(false)
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    //check if the checkbox or the password is empty, if so do not confirm
    if (!isChecked || !password) {
      return 
    }
    onConfirm(password)
    setIsChecked(false)
    setPassword('')
    onClose()
  }

  return (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <Text mb={4}>{message}</Text>
        <Checkbox mb={4} isChecked={isChecked} onChange={(e) => setIsChecked(e.target.checked)}>
          Je confirme mon choix
        </Checkbox>
        <Text>Veuillez saisir votre mot de passe pour confirmer :</Text>
        <Input
          type="password"
          placeholder="Entrez votre mot de passe pour confirmer"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit}>Confirmer</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)
}

export default ConfirmModal