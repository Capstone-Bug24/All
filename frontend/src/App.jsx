import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import './App.css'
import Overview from './pages/Overview'
import LiveMonitor from './pages/LiveMonitor'
import HistoryLogs from './pages/HistoryLogs'
import AlarmSystem from './pages/AlarmSystem'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ZoneDetail from './pages/ZoneDetail'
import { useAuth } from './contexts/AuthContext'

/** 로그인 제외 — 펼친 사이드바 + 상단 제목/시계 표시 */
const SIDEBAR_PAGE_META = {
  '/': { title: 'OVERVIEW', subtitle: '종합 상황판' },
  '/live-monitor': { title: 'LIVE MONITOR', subtitle: '실시간 모니터' },
  '/history-logs': { title: 'HISTORY LOGS', subtitle: '이력 로그' },
  '/alarm-system': { title: 'ALARM SYSTEM', subtitle: '알람 시스템' },
  '/settings': { title: 'SETTINGS', subtitle: '설정' },
  '/profile': { title: 'PROFILE', subtitle: '프로필' },
}

// 로그인하지 않은 사용자를 /login 페이지로 리다이렉트하는 래퍼 컴포넌트
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <div style={{ padding: '20px' }}>로딩 중...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const location = useLocation()
  const { user, logoutMutation } = useAuth()
  const [sidebarClock, setSidebarClock] = useState(() => new Date())

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  let pageMeta = SIDEBAR_PAGE_META[location.pathname]
  
  // 동적 구역(Zone) 라우트에 대한 상단 헤더 메타데이터 처리
  if (!pageMeta && location.pathname.startsWith('/zone/')) {
    const zoneCode = location.pathname.split('/').pop()?.toUpperCase() || 'A';
    pageMeta = { title: `ZONE ${zoneCode}`, subtitle: '구역 상세 정보' };
  }

  const isExpandedSidebar = Boolean(pageMeta)

  useEffect(() => {
    if (!isExpandedSidebar) return
    const id = setInterval(() => setSidebarClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [isExpandedSidebar])

  return (
    <div className={`main-container ${isExpandedSidebar ? 'overview-layout' : ''}`}>
      {/* 1. 왼쪽 사이드바 */}
      <aside className="sidebar">
        <div className="sidebar-logo">Bug24</div>
        {pageMeta && (
          <div className="sidebar-overview-meta">
            <h1 className="sidebar-overview-title">
              {pageMeta.title}{' '}
              <span className="sidebar-overview-subtitle">{pageMeta.subtitle}</span>
            </h1>
            <div className="sidebar-overview-clock">
              <p className="sidebar-overview-clock-label">Current Time</p>
              <p className="sidebar-overview-clock-value">
                {sidebarClock.toLocaleTimeString('en-US', { hour12: false })}
              </p>
            </div>
          </div>
        )}
        <Link to="/" className={`sidebar-icon ${location.pathname === '/' ? 'active' : ''}`}>
          Overview
        </Link>

        <Link to="/live-monitor" className={`sidebar-icon ${location.pathname === '/live-monitor' ? 'active' : ''}`}>
          Live Monitor
        </Link>

        <Link to="/history-logs" className={`sidebar-icon ${location.pathname === '/history-logs' ? 'active' : ''}`}>
          History Logs
        </Link>

        <Link to="/alarm-system" className={`sidebar-icon ${location.pathname === '/alarm-system' ? 'active' : ''}`}>
          Alarm System
        </Link>

        <Link to="/settings" className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`}>
          Settings
        </Link>

      <div className="sidebar-icon" style={{ cursor: 'default', pointerEvents: 'none', color: '#64748b', fontSize: '11px', fontWeight: '800', paddingTop: '24px', paddingBottom: '8px' }}>
        ZONES
      </div>
      <Link to="/zone/A" className={`sidebar-icon ${location.pathname === '/zone/A' ? 'active' : ''}`}>
        Zone A (조립 라인)
      </Link>
      <Link to="/zone/B" className={`sidebar-icon ${location.pathname === '/zone/B' ? 'active' : ''}`}>
        Zone B (포장 라인)
      </Link>
      <Link to="/zone/C" className={`sidebar-icon ${location.pathname === '/zone/C' ? 'active' : ''}`}>
        Zone C (도장 라인)
      </Link>
      <Link to="/zone/D" className={`sidebar-icon ${location.pathname === '/zone/D' ? 'active' : ''}`}>
        Zone D (자재 창고)
      </Link>
      <Link to="/zone/E" className={`sidebar-icon ${location.pathname === '/zone/E' ? 'active' : ''}`}>
        Zone E (출하장)
      </Link>
      <Link to="/zone/F" className={`sidebar-icon ${location.pathname === '/zone/F' ? 'active' : ''}`}>
        Zone F (직원 휴게실)
      </Link>

              {user && (
          <button
            onClick={handleLogout}
            className="sidebar-icon sidebar-logout" 
          >
            로그아웃
          </button>
        )}
      </aside>

      {/* 2. 오른쪽 메인 영역 */}
      <main className="main-content">
        {/* 상단 헤더 (로그인) */}
        <header className="header">
          {!user && (
            <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>
              로그인
            </Link>
          )} 
          {user && (
            <Link to="/profile" className="flex items-center gap-3 text-sm text-slate-400 hover:text-slate-200 transition-colors" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold border border-slate-600 shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="font-bold text-slate-200">{user.name}</span>님 환영합니다
              </div>
            </Link>
          )}
        </header>

        {/* 중앙 컨텐츠 - 라우팅으로 페이지 전환 */}
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route 
            path="/live-monitor" 
            element={
              <ProtectedRoute><LiveMonitor /></ProtectedRoute>
            } 
          />
          <Route 
            path="/history-logs" 
            element={
              <ProtectedRoute><HistoryLogs /></ProtectedRoute>
            } 
          />
          <Route 
            path="/alarm-system" 
            element={
              <ProtectedRoute><AlarmSystem /></ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } 
          />

          {/* 구역 상세 페이지 라우트 추가 */}
          <Route 
            path="/zone/:zoneId" 
            element={
              <ProtectedRoute><ZoneDetail /></ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
