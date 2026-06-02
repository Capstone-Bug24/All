import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '../hooks/use-toast'
import { z } from 'zod'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'

// API 응답 타입 정의
// const ApiResponse = (T) => ({
//   success: boolean,
//   user: T,
//   message: string,
//   token: string,
// })

// Create improved User schema with validation
const registerUserSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  
  phoneNumber: z.string().min(1, '전화번호를 입력해주세요'),
  name: z.string().min(1, '이름을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

// Login schema with just username & password
const loginUserSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

// 비밀번호 변경 스키마
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: z.string().min(6, '새 비밀번호는 6자 이상이어야 합니다'),
  confirmNewPassword: z.string().min(1, '새 비밀번호 확인을 입력해주세요'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: '새 비밀번호가 일치하지 않습니다',
  path: ['confirmNewPassword'],
})
// 계정 삭제 스키마
const deleteAccountSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

const API_BASE_URL = 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  //withCredentials: true, //백엔드 인증 문제로 주석처리
  headers: {
    'Content-Type': 'application/json',
  },
})

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiDetectionData, setAiDetectionData] = useState(null)
  const navigate = useNavigate()

  // 전역 다크/라이트 모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isDarkMode')
      return saved !== null ? JSON.parse(saved) : true
    } catch (error) {
      console.warn('다크모드 설정 파싱 에러, 기본값 사용:', error)
      return true
    }
  })

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
    isDarkMode ? document.body.classList.remove('light-mode') : document.body.classList.add('light-mode')
  }, [isDarkMode])

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로컬 스토리지에서 사용자 정보 확인
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Axios 인터셉터 설정 (토큰 자동 갱신)
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response, // 성공적인 응답은 그대로 반환
      async (error) => {
        const originalRequest = error.config
        // 401 에러이고, 재시도한 요청이 아닐 경우에만 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true // 무한 재시도를 방지하기 위한 플래그

          // /auth/refresh 구현 전 주석처리
          /*
          try {
            // 1. 로컬 스토리지에서 리프레시 토큰 가져오기
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              // 리프레시 토큰이 없으면 갱신 시도조차 할 수 없으므로 로그아웃 처리
              throw new Error('No refresh token available.');
            }

            // 2. 리프레시 토큰으로 새 액세스 토큰 요청
            const { data } = await api.post('/auth/refresh', { refreshToken });
            const { token: newAccessToken } = data;

            // 3. 새로 받은 토큰을 로컬 스토리지와 axios 헤더에 저장
            localStorage.setItem('token', newAccessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // 실패했던 원래 요청을 새 토큰으로 재시도
            return api(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패 시 (예: 리프레시 토큰도 만료된 경우)
            console.error('Unable to refresh token:', refreshError);
            
            // 로그아웃 처리
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken'); // 리프레시 토큰도 제거
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            navigate('/login');
            toast({
              title: '세션 만료',
              description: '보안을 위해 자동으로 로그아웃되었습니다. 다시 로그인해주세요.',
              variant: 'destructive',
            });
            return Promise.reject(refreshError);
          }
          */
        }
        return Promise.reject(error)
      }
    )

    // 컴포넌트가 언마운트될 때 인터셉터 정리
    return () => {
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [navigate, toast])

  // Add token to requests if it exists
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  // AI 탐지 서버 웹소켓 연결
  useEffect(() => {
    const socket = io('http://localhost:5002')

    socket.on('connect', () => {
      console.log('✅ AI 감지 서버와 연결되었습니다. ID:', socket.id)
    })

    socket.on('ai_detection', (data) => {
      console.log('📡 AI 탐지 데이터 수신:', data)
      setAiDetectionData(data)
    })

    socket.on('disconnect', () => {
      console.log('❌ AI 감지 서버와 연결이 끊어졌습니다.')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  //로그인인
  const loginMutation = useMutation({
    mutationFn: async (data) => {

      const response = await api.post('/auth/login', data)

      const { token, user } = response.data // refreshToken 관련 주석처리

      if (!token || !user) {
        throw new Error('로그인 응답에 토큰 또는 사용자 정보가 없습니다.')
      }

      // Store tokens in localStorage
      localStorage.setItem('token', token)
      // localStorage.setItem('refreshToken', refreshToken) // refreshToken 관련 주석처리

      // Set default authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      return response.data
    },
    onSuccess: (data) => {
      const userData = data?.user || data
      const metadata = userData?.user_metadata
      const updatedUser = {
        ...userData, // ID, Email 등 기본 정보 복사
        name: userData?.full_name || metadata?.full_name || user?.name,
        phoneNumber: userData?.phone_number || metadata?.phone_number || user?.phoneNumber,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast({
        title: '로그인 성공',
        description: `${updatedUser.name}님 환영합니다!`,
        variant: 'success',
      })
      navigate('/')
    },
    onError: (error) => {
      toast({
        title: '로그인 실패',
        description: error.message || '로그인에 실패했습니다.',
        variant: 'destructive',
      })
    },
  })

  // Update logout mutation to clear token
  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token')
      // localStorage.removeItem('refreshToken') // refreshToken 관련 주석처리
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      navigate('/login')
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      // Transform the data to match backend field names
      const transformedData = {
        email: data.email,
        password: data.password,
        full_name: data.name,
        phone_number: data.phoneNumber,
      }

      const response = await api.post('/auth/signup', transformedData)
      if (!response.data.user) {
        throw new Error(response.data.message || '회원가입에 실패했습니다.')
      }
      return response.data
    },
    onSuccess: (data) => {
      const userData = data?.user || data
      const metadata = userData?.user_metadata
      const updatedUser = {
        ...userData, // ID, Email 등 기본 정보 복사
        name: userData?.full_name || metadata?.full_name || user?.name,
        phoneNumber: userData?.phone_number || metadata?.phone_number || user?.phoneNumber,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast({
        title: '회원가입 성공',
        description: `${updatedUser.name}님 환영합니다!`,
        variant: 'success',
      })
      navigate('/')
    },
    onError: (error) => {
      setError(error)
      toast({
        title: '회원가입 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      try {


        const response = await api.post('/auth/reset-password', data)
        
        if (!response.data.success) {
          throw new Error(response.data.message || '비밀번호 재설정에 실패했습니다.')
        }
        toast({
          title: '비밀번호 재설정',
          description: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
          variant: 'success',
        })
      } catch (error) {
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || '비밀번호 재설정에 실패했습니다.')
        }
        throw new Error('비밀번호 재설정에 실패했습니다.')
      }
    },
    onError: (error) => {
      setError(error)
      toast({
        title: '비밀번호 재설정 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await api.put('/auth/update-password', {
          new_password: data.newPassword,
        })
        return response.data


      } catch (error) {
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || '비밀번호 변경에 실패했습니다.')
        }
        throw new Error('비밀번호 변경에 실패했습니다.')
      }
    },

    onSuccess: () => {
      toast({
        title: '비밀번호 변경 성공',
        description: '다음에 로그인할 때 새 비밀번호를 사용해주세요.',
        variant: 'success',
      })
      // 필요하다면 비밀번호 변경 후 로그아웃 시키거나 프로필로 이동
      navigate('/profile')
    },

    onError: (error) => {
      setError(error)
      toast({
        title: '비밀번호 변경 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await api.put('/auth/delete-account', {
          userId: user?.id,
          password: data.password,
        })
        if (!response.data.success) {
          throw new Error(response.data.message || '계정 삭제에 실패했습니다.')
        }
        // 로컬 스토리지에서 사용자 정보 삭제
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        // 사용자 상태 초기화
        setUser(null)
        // 로그인 페이지로 이동
        navigate('/login')
        toast({
          title: '계정 삭제 성공',
          description: '계정이 성공적으로 삭제되었습니다.',
          variant: 'success',
        })
      } catch (error) {
        if (error.response && error.response.data) {
          throw new Error(error.response.data.message || '계정 삭제에 실패했습니다.')
        }
        throw new Error('계정 삭제에 실패했습니다.')
      }
    },
    onError: (error) => {
      setError(error)
      toast({
        title: '계정 삭제 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put('/auth/profile', {
        userId: user?.id,
        full_name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phoneNumber,
      })

      return response.data
    },
    onSuccess: (data) => {
      const userData = data?.data || data?.user || data
      const metadata = userData?.user_metadata
      const updatedUser = {
        ...user, //기존에 쓰던 정보보
        ...userData, // ID, Email 등 기본 정보 복사
        name: userData?.full_name || user?.name,
        phoneNumber: userData?.phone_number || user?.phoneNumber,
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast({
        title: '프로필 업데이트 완료',
        description: '프로필 정보가 성공적으로 업데이트되었습니다.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: '프로필 업데이트 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user?.role])

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordMutation,
        changePasswordMutation,
        deleteAccountMutation,
        updateProfileMutation,
        isAdmin,
        aiDetectionData,
        isDarkMode,
        setIsDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export schemas
export {
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
  deleteAccountSchema,
}
