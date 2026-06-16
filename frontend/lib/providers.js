// app/user-provider.tsx
'use client'

import { createContext, useContext, use } from 'react'


const UserContext = createContext<Promise<UserData> | null>(null)

export function UserProvider({
  children,
  userPromise,
}) {
  return (
    <UserContext value={userPromise}>
      {children}
    </UserContext>
  )
}

export function useUser() {
  const userPromise = useContext(UserContext)

  if (!userPromise) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return use(userPromise).data
}