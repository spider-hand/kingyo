import { Configuration, TokenApi } from '@/services'
import { useRouter } from 'vue-router'

const useApi = () => {
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit, retryCount = 0) => {
    const token = localStorage.getItem('kingyo_access_token')

    const initWithToken = {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: token ? `Bearer ${token}` : '',
      },
    }

    const resp = await fetch(input, initWithToken)

    if (resp.status === 401 && retryCount < 3) {
      await refreshToken()
      return await customFetch(input, init, retryCount + 1)
    } else if (!resp.ok) {
      throw new Error('Request failed with status ' + resp.status)
    }

    return resp
  }

  const router = useRouter()
  const basePath = import.meta.env.VITE_API_BASE_URL
  const apiConfig = new Configuration({
    basePath: basePath,
    fetchApi: customFetch,
  })

  const tokenApi = new TokenApi(apiConfig)

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('kingyo_refresh_token')
      if (!refreshToken) throw new Error('No refresh token found')

      const resp = await tokenApi.createTokenRefresh({
        tokenRefresh: {
          refresh: refreshToken,
        },
      })

      localStorage.setItem('kingyo_access_token', resp.access)
    } catch {
      localStorage.removeItem('kingyo_access_token')
      localStorage.removeItem('kingyo_refresh_token')
      router.push({ name: 'login' })
    }
  }

  return {
    apiConfig,
    refreshToken,
  }
}

export default useApi
