// To confirm the patch or deletion of the informations

import { useState } from 'react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox, Text } from '@chakra-ui/react'

interface ConfirmModalProps { 
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
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
    onConfirm()
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