import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'
import { Settings as SettingsIcon, User, Moon, Sun, Bell, Save } from 'lucide-react'
import '../App.css'

function Settings() {
  const { user, isLoading, isDarkMode, setIsDarkMode } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // 설정 상태 관리
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  // 로그인되지 않은 상태에서 Settings에 접근 시 로그인 페이지로 이동
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: '로그인이 필요합니다',
        description: '설정 페이지는 로그인 후 이용 가능합니다.',
        variant: 'destructive',
      })
      navigate('/login')
    }
  }, [isLoading, user, navigate, toast])

  // 로딩 중이거나 리다이렉트 직전에는 간단한 메시지만 표시
  if (isLoading || !user) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-slate-900 text-slate-200">
        <p className="font-bold text-lg">설정 페이지를 불러오는 중입니다...</p>
      </div>
    )
  }

  // 라이트/다크 모드에 따른 동적 클래스 설정
  const baseBg = isDarkMode ? "bg-slate-900" : "bg-slate-50"
  const textColor = isDarkMode ? "text-slate-200" : "text-slate-900"
  const cardBg = isDarkMode ? "bg-slate-800" : "bg-white"
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-200"
  const subTextColor = isDarkMode ? "text-slate-400" : "text-slate-500"
  const primaryBtn = isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" : "bg-blue-500 hover:bg-blue-600 text-white shadow"
  const secondaryBtn = isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
  const dividerColor = isDarkMode ? "#334155" : "#e2e8f0"

  const handleSave = () => {
    toast({
      title: '설정 저장 완료',
      description: '변경된 설정이 성공적으로 저장되었습니다.',
      variant: 'success'
    })
  }

  return (
    <div className={`flex-1 w-full p-8 overflow-y-auto font-sans transition-colors duration-300 ${baseBg} ${textColor}`}>
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-8">
  
        </header>
        
        {/* 개인정보 설정 카드 */}
        <div className={`p-6 rounded-xl border transition-colors duration-300 mb-6 ${cardBg} ${borderColor} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-4" style={{ borderColor: dividerColor }}>
            <User className="w-5 h-5 text-blue-500" />
            개인정보 설정
          </h3>
          <p className={`text-sm mb-6 leading-relaxed ${subTextColor}`}>
            개인정보 확인, 수정 및 비밀번호 변경은 프로필 페이지에서 안전하게 진행할 수 있습니다.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${primaryBtn}`}
          >
            개인정보 페이지로 이동
          </button>
        </div>

        {/* 시스템 설정 옵션 카드 */}
        <div className={`p-6 rounded-xl border transition-colors duration-300 ${cardBg} ${borderColor} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: dividerColor }}>
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            환경 설정
          </h3>
          
          <div className="space-y-6">
            {/* 다크 모드 토글 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-semibold">다크 모드 활성화</div>
                <div className={`text-xs mt-1 ${subTextColor}`}>어두운 테마를 사용하여 눈의 피로를 줄입니다.</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                />
                <div className={`block w-12 h-7 rounded-full transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${isDarkMode ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>

            {/* 알림 토글 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> 알림 받기</div>
                <div className={`text-xs mt-1 ${subTextColor}`}>중요한 시스템 알람 발생 시 데스크톱 알림을 받습니다.</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <div className={`block w-12 h-7 rounded-full transition-colors ${notifications ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${notifications ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>

            {/* 자동 저장 토글 */}
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-semibold flex items-center gap-2"><Save className="w-4 h-4" /> 자동 저장</div>
                <div className={`text-xs mt-1 ${subTextColor}`}>작업 중인 변경 사항을 주기적으로 자동 저장합니다.</div>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                />
                <div className={`block w-12 h-7 rounded-full transition-colors ${autoSave ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${autoSave ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: dividerColor }}>
            <button onClick={handleSave} className={`px-6 py-2.5 rounded-lg font-bold transition-colors ${primaryBtn}`}>
              설정 저장
            </button>
            <button onClick={() => toast({description: '변경 사항이 취소되었습니다.'})} className={`px-6 py-2.5 rounded-lg font-bold transition-colors ${secondaryBtn}`}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
