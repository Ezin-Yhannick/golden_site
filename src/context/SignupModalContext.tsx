import { createContext, useContext, useState, ReactNode } from 'react'

interface SignupModalContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SignupModalContext = createContext<SignupModalContextValue | null>(null)

export function SignupModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SignupModalContext.Provider
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </SignupModalContext.Provider>
  )
}

export function useSignupModal() {
  const ctx = useContext(SignupModalContext)
  if (!ctx) throw new Error('useSignupModal doit être utilisé dans SignupModalProvider')
  return ctx
}
