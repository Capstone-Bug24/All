import { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { useOverviewService } from '../contexts/overviewService';
import { apiClient } from '../contexts/api';
import '../App.css';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

function AlarmSystem() {
  // 웹소켓과 연동된 Overview 상태 데이터 사용
  const { data, isLoading } = useOverviewService();
  const { toast } = useToast();
  const { isDarkMode } = useAuth();

  // 동적 테마 변수
  const themeBg = isDarkMode ? "bg-slate-900" : "bg-slate-50";
  const themeText = isDarkMode ? "text-slate-200" : "text-slate-900";
  const themeCard = isDarkMode ? "bg-slate-800" : "bg-white";
  const themeBorder = isDarkMode ? "border-slate-700" : "border-slate-200";
  const themeSubText = isDarkMode ? "text-slate-400" : "text-slate-500";
  
  // 조치 완료된 알람 ID를 임시 저장하여 즉시 숨김 처리 (Optimistic UI)
  const [resolvedIds, setResolvedIds] = useState([]);

  // 백엔드의 웹소켓(Socket.IO) 주소로 연결하여 조치 완료 이벤트 수신
  useEffect(() => {
    // 백엔드의 웹소켓(Socket.IO) 주소로 연결
    const socket = io("http://localhost:4000");

    // 서버에서 보낸 'alert_resolved' 이벤트 수신
    socket.on("alert_resolved", (data) => {
      console.log("알람 조치 완료 확인, ID:", data.id);
      // 화면에서 해당 알람 카드를 지우는 로직 실행
      // 이미 존재하는 resolvedIds 배열에 ID를 추가하여 화면에서 즉시 필터링되게 합니다.
      setResolvedIds((prev) => [...prev, data.id]);
    });

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []);

  // 조치 완료 버튼 이벤트
  const handleResolve = async (id) => {
    try {
      // 1. 백엔드로 위험도를 'info'로 변경 혹은 조치 완료하는 API 전송
      await apiClient.put(`/alarms/${id}/resolve`);
      
      // 2. 화면에서 즉시 제거
      setResolvedIds((prev) => [...prev, id]);
      
      toast({
        title: '조치 완료',
        description: '해당 알람이 성공적으로 조치 처리되었습니다.',
        variant: 'success',
      });
    } catch (error) {
      console.error('알람 조치 처리 실패:', error);
      toast({
        title: '조치 완료 실패',
        description: '알람 조치 처리에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  // 활성 알람 목록 필터 (Critical 또는 Warning 상태이면서 조치되지 않은 알람만 표시)
  const activeAlarms = data
    ? data.recentAlerts.filter(
        (alarm) =>
          (alarm.severity === 'critical' || alarm.severity === 'warning') &&
          !resolvedIds.includes(alarm.id)
      )
    : [];

  return (
    <div className={`flex-1 w-full p-8 overflow-y-auto font-sans self-stretch items-stretch justify-start transition-colors duration-300 ${themeBg} ${themeText}`}>
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8">
        
        </header>

        <div className={`rounded-xl shadow-lg p-6 border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4 ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-900 border-slate-200'}`}>
            <AlertTriangle className="w-5 h-5 text-red-500" />
            활성 알람 (경고/위험)
          </h3>

          {isLoading ? (
            <div className={themeSubText}>데이터를 불러오는 중...</div>
          ) : activeAlarms.length > 0 ? (
            <div className="space-y-4">
              {activeAlarms.map((alarm) => {
                const isCritical = alarm.severity === 'critical';
                const bgColor = isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30';
                const textColor = isCritical ? 'text-red-400' : 'text-orange-400';
                const badgeColor = isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-orange-500';
                const Icon = isCritical ? AlertOctagon : AlertTriangle;

                return (
                  <div key={alarm.id} className={`border rounded-lg p-5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${bgColor} ${!isDarkMode ? 'border-transparent' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`text-lg font-bold flex items-center gap-2 ${textColor}`}>
                          <Icon className="w-5 h-5" />
                          {alarm.type}
                        </div>
                        <span className={`text-white px-2 py-0.5 rounded text-xs font-bold ${badgeColor}`}>
                          {isCritical ? '긴급' : '경고'}
                        </span>
                      </div>
                      <div className={`text-sm mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><span className="text-slate-500 mr-2">위치:</span> {alarm.zone}</div>
                      <div className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><span className="text-slate-500 mr-2">발생 시간:</span> {alarm.time}</div>
                      <div className={`p-3 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700 shadow-sm'}`}>
                        <strong className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mr-2`}>상세:</strong> {alarm.desc}
                      </div>
                    </div>

                    {/* 조치 완료 버튼 */}
                    <button 
                      onClick={() => handleResolve(alarm.id)} 
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition-colors whitespace-nowrap"
                    >
                      ✅ 조치 완료
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-8 rounded-lg border border-dashed text-center ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-300 text-slate-500'}`}>
              현재 조치가 필요한 활성 알람이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlarmSystem
