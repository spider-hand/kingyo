import { useQuery } from '@tanstack/vue-query'
import { UsersApi, type User } from '@/services'
import useApi from './useApi'

const useUserQuery = () => {
  const { apiConfig } = useApi()
  const usersApi = new UsersApi(apiConfig)

  // Query for listing all users
  const { data: users, isFetching: isFetchingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await usersApi.listUsers()
    },
    staleTime: Infinity,
    refetchOnMount: false,
  })

  // Query for the current authenticated user
  const { data: currentUser, isFetching: isFetchingCurrentUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return await usersApi.retrieveUsersMe()
    },
    staleTime: Infinity,
  })
  return {
    users,
    currentUser,
    isFetchingCurrentUser,
    isFetchingUsers,
  }
}

export default useUserQuery
