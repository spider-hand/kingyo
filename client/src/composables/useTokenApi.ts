import { TokenApi } from '@/services'
import useApi from './useApi'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const useTokenApi = () => {
  const { apiConfig } = useApi()
  const tokenApi = new TokenApi(apiConfig)
  const router = useRouter()

  const isSigningIn = ref(false)
  const errorMessage = ref<string | null>(null)

  const signIn = async (username: string, password: string) => {
    try {
      isSigningIn.value = true
      errorMessage.value = null
      const resp = await tokenApi.createToken({
        tokenObtainPair: {
          username,
          password,
        },
      })

      localStorage.setItem('kingyo_access_token', resp.access)
      localStorage.setItem('kingyo_refresh_token', resp.refresh)
    } catch (error) {
      console.error('Error signing in:', error)
      errorMessage.value = 'Failed to sign in. Please check your credentials.'
    } finally {
      isSigningIn.value = false
    }
  }

  const signOut = () => {
    localStorage.removeItem('kingyo_access_token')
    localStorage.removeItem('kingyo_refresh_token')
    router.push({ name: 'login' })
  }

  return {
    signIn,
    signOut,
    isSigningIn,
    errorMessage,
  }
}

export default useTokenApi
