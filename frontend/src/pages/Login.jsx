import { useState } from 'react'
import { useAuth, loginUserSchema, registerUserSchema } from '../contexts/AuthContext'
import '../App.css'

function Login() {
  const { loginMutation, registerMutation } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  // 1. username 제거, email 중심으로 초기화
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    name: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      if (isLoginMode) {
        // 2. 로그인 데이터 매핑 수정 (email 키 사용)
        const loginData = {
          email: formData.email, // username -> email
          password: formData.password
        }
        const validatedData = loginUserSchema.parse(loginData)
        await loginMutation.mutateAsync(validatedData)
        
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          name: ''
        })
      } else {
        const validatedData = registerUserSchema.parse(formData)
        await registerMutation.mutateAsync(validatedData)
        
        setIsLoginMode(true)
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          name: ''
        })
      }
    } catch (error) {
      if (error.issues) {
        const zodErrors = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0]
          zodErrors[field] = issue.message
        })
        setErrors(zodErrors)
      } else {
        console.error('Form error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="content-body">
      <h1>{isLoginMode ? '🔐 로그인' : '📝 회원가입'}</h1>
      <p>{isLoginMode ? '계정에 로그인하세요' : '새 계정을 만드세요'}</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '30px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e1e4e8'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            {/* 3. Label htmlFor 수정 */}
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#333'
              }}
            >
              이메일
            </label>
            <input 
              id="email"
              name="email"
              type="email" 
              placeholder="이메일을 입력하세요" 
              value={formData.email}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: errors.email ? '1px solid #ff4d4f' : '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              disabled={isSubmitting}
            />
            {/* 4. 중복되던 errors.username 출력문 삭제 */}
            {errors.email && (
              <span style={{ 
                display: 'block', 
                marginTop: '6px', 
                fontSize: '12px', 
                color: '#ff4d4f' 
              }}>
                {errors.email}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#333'
              }}
            >
              비밀번호
            </label>
            <input 
              id="password"
              name="password"
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              value={formData.password}
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: errors.password ? '1px solid #ff4d4f' : '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span style={{ 
                display: 'block', 
                marginTop: '6px', 
                fontSize: '12px', 
                color: '#ff4d4f' 
              }}>
                {errors.password}
              </span>
            )}
          </div>

          {!isLoginMode && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="confirmPassword" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}
                >
                  비밀번호 확인
                </label>
                <input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password" 
                  placeholder="비밀번호를 다시 입력하세요" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    borderRadius: '6px', 
                    border: errors.confirmPassword ? '1px solid #ff4d4f' : '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '6px', 
                    fontSize: '12px', 
                    color: '#ff4d4f' 
                  }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label 
                  htmlFor="name" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}
                >
                  이름
                </label>
                <input 
                  id="name"
                  name="name"
                  type="text" 
                  placeholder="이름을 입력하세요" 
                  value={formData.name}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    borderRadius: '6px', 
                    border: errors.name ? '1px solid #ff4d4f' : '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '6px', 
                    fontSize: '12px', 
                    color: '#ff4d4f' 
                  }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="phoneNumber" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}
                >
                  전화번호
                </label>
                <input 
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text" 
                  placeholder="전화번호를 입력하세요" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    borderRadius: '6px', 
                    border: errors.phoneNumber ? '1px solid #ff4d4f' : '1px solid #ddd',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '6px', 
                    fontSize: '12px', 
                    color: '#ff4d4f' 
                  }}>
                    {errors.phoneNumber}
                  </span>
                )}
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="login-btn" 
            style={{ 
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'all 0.2s',
              marginBottom: '12px'
            }}
            disabled={isSubmitting || (isLoginMode ? loginMutation.isPending : registerMutation.isPending)}
          >
            {isSubmitting || (isLoginMode ? loginMutation.isPending : registerMutation.isPending) 
              ? (isLoginMode ? '로그인 중...' : '회원가입 중...') 
              : (isLoginMode ? '로그인' : '회원가입')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode)
              // 5. 모드 전환 시 초기값 수정
              setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                phoneNumber: '',
                name: ''
              })
              setErrors({})
            }}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '6px',
              color: '#666',
              transition: 'all 0.2s'
            }}
            disabled={isSubmitting}
          >
            {isLoginMode ? '회원가입' : '로그인'}으로 전환
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login