// ** React Imports
import React, { createContext, useState, useContext } from 'react'

// ** ConfirmDialog Import
import ConfirmDialog from '@/components/ConfirmDialog'

export interface ConfirmationContentProps {
  isGeneral?: boolean
  title?: string
  text?: string
  rejectButtonText?: string
  groupName?: string
  name?: string
}
interface ConfirmationContextProps {
  confirm: (content: string | ConfirmationContentProps) => Promise<void>
}

const ConfirmationContext = createContext<ConfirmationContextProps | undefined>(undefined)

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }

  return context
}

export const ConfirmationProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<string | ConfirmationContentProps>('')
  const [resolve, setResolve] = useState<(() => void) | null>(null)

  const confirm = (content: string | ConfirmationContentProps) => {
    setContent(content)
    setIsOpen(true)

    return new Promise<void>(res => {
      setResolve(() => res)
    })
  }

  const handleCancel = () => {
    setIsOpen(false)
    setResolve(null)
  }

  const handleConfirm = () => {
    setIsOpen(false)
    resolve?.()
    setResolve(null)
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog open={isOpen} content={content} onCancel={handleCancel} onConfirm={handleConfirm} />
    </ConfirmationContext.Provider>
  )
}
