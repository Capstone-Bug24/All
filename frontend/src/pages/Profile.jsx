import { useState, useEffect } from 'react'
import { useAuth, changePasswordSchema } from '../contexts/AuthContext'
import '../App.css'

function Profile() {
  const { user, updateProfileMutation, changePasswordMutation } = useAuth()

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  })
  const [isEditing, setIsEditing] = useState(false)

  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileData, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingPassword(true)
    setPasswordErrors({})

    try {
      const validatedData = changePasswordSchema.parse(passwordData)
      await changePasswordMutation.mutateAsync(validatedData)
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
      setShowPasswordChange(false)
    } catch (error) {
      if (error.issues) {
        const zodErrors = {}
        error.issues.forEach((issue) => {
          const field = issue.path[0]
          zodErrors[field] = issue.message
        })
        setPasswordErrors(zodErrors)
      } else {
        console.error('Password change error:', error)
      }
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (!user) {
    return <div className="content-body">로딩 중...</div>
  }

  const renderInputField = (label, name, type = 'text') => (
    <div style={{ marginBottom: '20px' }}>
      <label 
        htmlFor={name} 
        style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#333'
        }}
      >
        {label}
      </label>
      <input 
        id={name}
        name={name}
        type={type} 
        value={profileData[name]}
        onChange={handleInputChange}
        style={{ 
          width: '100%', 
          padding: '10px 12px', 
          borderRadius: '6px', 
          border: '1px solid #ddd',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
        disabled={updateProfileMutation.isPending}
      />
    </div>
  );

  return (
    <div className="content-body">
      <h1>👤 개인 정보</h1>
      <p>개인 정보를 확인하고 수정할 수 있습니다.</p>

      <div className="settings-card" style={{ marginTop: '20px' }}>
        <h3>프로필 정보</h3>
        {!isEditing ? (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '16px', margin: '15px 0' }}><strong>이름:</strong> {user.name}</p>
            <p style={{ fontSize: '16px', margin: '15px 0' }}><strong>이메일:</strong> {user.email}</p>
            <p style={{ fontSize: '16px', margin: '15px 0' }}><strong>전화번호:</strong> {user.phoneNumber || '정보 없음'}</p>
            <div className="button-group" style={{ justifyContent: 'flex-start' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-save">
                정보 수정
                </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {renderInputField('이름', 'name')}
            {renderInputField('이메일', 'email', 'email')}
            {renderInputField('전화번호', 'phoneNumber')}
            
            <div className="button-group">
              <button type="submit" className="btn btn-save" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? '저장 중...' : '저장'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                    setIsEditing(false);
                    setProfileData({
                        name: user.name || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                    });
                }} 
                className="btn btn-cancel"
                disabled={updateProfileMutation.isPending}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="settings-card" style={{ marginTop: '20px' }}>
        <h3>비밀번호 변경</h3>
        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="btn btn-danger"
            style={{ marginTop: '10px' }}
          >
            비밀번호 변경
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="currentPassword" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#333'
                }}
              >
                현재 비밀번호
              </label>
              <input 
                id="currentPassword"
                name="currentPassword"
                type="password" 
                placeholder="현재 비밀번호를 입력하세요" 
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '6px', 
                  border: passwordErrors.currentPassword ? '1px solid #ff4d4f' : '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                disabled={isSubmittingPassword}
              />
              {passwordErrors.currentPassword && (
                <span style={{ 
                  display: 'block', 
                  marginTop: '6px', 
                  fontSize: '12px', 
                  color: '#ff4d4f' 
                }}>
                  {passwordErrors.currentPassword}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="newPassword" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#333'
                }}
              >
                새 비밀번호
              </label>
              <input 
                id="newPassword"
                name="newPassword"
                type="password" 
                placeholder="새 비밀번호를 입력하세요 (6자 이상)" 
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '6px', 
                  border: passwordErrors.newPassword ? '1px solid #ff4d4f' : '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                disabled={isSubmittingPassword}
              />
              {passwordErrors.newPassword && (
                <span style={{ 
                  display: 'block', 
                  marginTop: '6px', 
                  fontSize: '12px', 
                  color: '#ff4d4f' 
                }}>
                  {passwordErrors.newPassword}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label 
                htmlFor="confirmNewPassword" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: '#333'
                }}
              >
                새 비밀번호 확인
              </label>
              <input 
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password" 
                placeholder="새 비밀번호를 다시 입력하세요" 
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  borderRadius: '6px', 
                  border: passwordErrors.confirmNewPassword ? '1px solid #ff4d4f' : '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                disabled={isSubmittingPassword}
              />
              {passwordErrors.confirmNewPassword && (
                <span style={{ 
                  display: 'block', 
                  marginTop: '6px', 
                  fontSize: '12px', 
                  color: '#ff4d4f' 
                }}>
                  {passwordErrors.confirmNewPassword}
                </span>
              )}
            </div>

            <div className="button-group">
              <button 
                type="submit"
                className="btn btn-danger"
                disabled={isSubmittingPassword || changePasswordMutation.isPending}
              >
                {isSubmittingPassword || changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false)
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                  })
                  setPasswordErrors({})
                }}
                className="btn btn-cancel"
                disabled={isSubmittingPassword}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile