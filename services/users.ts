import { doc, getDoc } from 'firebase/firestore'
import db from '../firebase'
import User from '../types/user'

export async function getAllUsers() {
  return []
}

export async function getUserById(userId: string) {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return undefined

  const user: User = { id: docSnap.id, ...docSnap.data() } as unknown as User

  return user
}