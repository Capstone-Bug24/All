import { 
  AlertTriangle, AlertOctagon, Activity, Users, 
  Video, Wifi, Cpu, Server, Map as MapIcon, 
  Thermometer, Wind, Droplets, Info 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOverviewService } from '../contexts/overviewService';

const SYSTEM_ICONS = {
  cctv: Video,
  iot: Wifi,
  ai: Cpu,
  server: Server,
};

const ENV_ICONS = {
  temp: Thermometer,
  humidity: Droplets,
  gas: Wind,
};

function Overview() {
  const { isDarkMode } = useAuth();
  const { data, isLoading, isError } = useOverviewService();
  const navigate = useNavigate();

  const themeBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const themeText = isDarkMode ? 'text-slate-200' : 'text-slate-900';
  const themeCard = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const themeBorder = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const themeSubText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const themeInset = isDarkMode ? 'bg-slate-900' : 'bg-slate-100';
  const themeHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const themeIconBg = isDarkMode ? 'bg-slate-700' : 'bg-slate-100';
  const themeDivider = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const themeTableHead = isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-100 text-slate-500';
  const themeTableBody = isDarkMode ? 'text-slate-300 divide-slate-700/50' : 'text-slate-700 divide-slate-200';
  const themeRowHover = isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-100';

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30"><AlertOctagon className="w-3 h-3" /> CRITICAL</span>;
      case 'warning':
        return <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/30"><AlertTriangle className="w-3 h-3" /> WARNING</span>;
      case 'info':
        return <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30"><Info className="w-3 h-3" /> INFO</span>;
      default:
        return null;
    }
  };

  const getZoneStatusClasses = (status) => {
    if (status === 'critical') {
      return 'border-red-500 bg-red-500/20 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
    }
    if (status === 'warning') {
      return 'border-orange-500 bg-orange-500/10 text-orange-200';
    }
    return isDarkMode
      ? 'border-slate-600 bg-slate-800 text-slate-300'
      : 'border-slate-300 bg-white text-slate-700';
  };

  if (isLoading) {
    return (
      <div className={`flex-1 w-full flex items-center justify-center transition-colors duration-300 ${themeBg} ${themeText}`}>
        <div className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 animate-spin text-blue-500" /> 데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={`flex-1 w-full flex items-center justify-center transition-colors duration-300 ${themeBg} ${themeText}`}>
        <div className="text-xl font-bold text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" /> 데이터를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full p-8 overflow-y-auto font-sans transition-colors duration-300 ${themeBg} ${themeText}`}>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl border shadow-lg relative overflow-hidden transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-sm font-bold uppercase ${themeSubText}`}>금일 총 알람 수</p>
            <Activity className={`w-6 h-6 ${themeSubText}`} />
          </div>
          <h3 className={`text-4xl font-bold mb-2 ${themeHeading}`}>{data.metrics.totalAlarms}</h3>
          <div className="flex gap-3 text-xs font-medium">
            <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">위험 {data.metrics.critical}</span>
            <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">경고 {data.metrics.warning}</span>
            <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">정보 {data.metrics.info}</span>
          </div>
        </div>

        <div className={`p-6 rounded-xl border border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden group transition-colors duration-300 ${themeCard}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-red-400 text-sm font-bold uppercase">치명적 위험 (Critical)</p>
            <AlertOctagon className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-4xl font-bold text-red-500 mb-2">{data.metrics.critical}</h3>
          <p className={`text-xs ${themeSubText}`}>즉각적인 조치가 필요한 알람</p>
        </div>

        <div className={`p-6 rounded-xl border border-orange-900/30 shadow-lg relative overflow-hidden transition-colors duration-300 ${themeCard} ${themeBorder}`}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-orange-400 text-sm font-bold uppercase">경고 (Warning)</p>
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-4xl font-bold text-orange-500 mb-2">{data.metrics.warning}</h3>
          <p className={`text-xs ${themeSubText}`}>규정 위반 및 주의 필요 사항</p>
        </div>

        <div className={`p-6 rounded-xl border shadow-lg relative overflow-hidden transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode && 'shadow-sm'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-blue-400 text-sm font-bold uppercase">현재 작업중인 작업자</p>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className={`text-4xl font-bold mb-2 ${themeHeading}`}>{data.metrics.activeWorkers} <span className={`text-lg font-normal ${themeSubText}`}>명</span></h3>
          <p className={`text-xs ${themeSubText}`}>웨어러블 태그 연동 기준</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <div className={`lg:col-span-2 rounded-xl p-6 shadow-lg flex flex-col border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${themeHeading}`}>
              <MapIcon className="w-5 h-5 text-blue-400" /> 공장 구역별 실시간 위험 지도 (Zone Map)
            </h3>
            <div className={`flex gap-4 text-xs font-medium ${themeSubText}`}>
              <span className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-slate-700 border-slate-500' : 'bg-slate-200 border-slate-400'}`}></span> 정상</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500"></span> 경고</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 border border-red-500 animate-pulse"></span> 위험</span>
            </div>
          </div>
          
          <div className={`flex-1 rounded-lg border p-4 grid grid-cols-2 md:grid-cols-3 gap-4 min-h-[300px] transition-colors duration-300 ${themeInset} ${themeBorder}`}>
            {data.zones.map((zone) => (
              <div key={zone.id} className={`relative p-4 rounded-lg border-2 flex flex-col justify-between transition-colors ${getZoneStatusClasses(zone.status)}`}>
                <div>
                  <h4 className="font-bold mb-1">{zone.name}</h4>
                  <p className="text-xs opacity-80 mt-2 line-clamp-2">{zone.recentAlert}</p>
                </div>
                {zone.status === 'critical' && <AlertOctagon className="absolute top-4 right-4 w-6 h-6 text-red-400" />}
                {zone.status === 'warning' && <AlertTriangle className="absolute top-4 right-4 w-5 h-5 text-orange-400" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          
          <div className={`rounded-xl p-6 shadow-lg border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${themeHeading} ${themeDivider}`}>실시간 시스템 상태</h3>
            <div className="space-y-4">
              {data.systemHealth.map(sys => {
                const Icon = SYSTEM_ICONS[sys.iconType] || Info;
                return (
                  <div key={sys.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${themeIconBg}`}>
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sys.name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${sys.state === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                      {sys.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-lg flex-1 border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${themeHeading} ${themeDivider}`}>환경 센서 (IoT)</h3>
            <div className="space-y-4">
              {data.envData.map(env => {
                const Icon = ENV_ICONS[env.iconType] || Info;
                return (
                  <div key={env.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${themeInset} ${themeBorder}`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${env.state === 'good' ? 'text-blue-400' : 'text-orange-400'}`} />
                      <span className={`text-sm ${themeSubText}`}>{env.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${env.state === 'good' ? themeHeading : 'text-orange-400'}`}>{env.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className={`rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
        <div className={`p-6 border-b flex justify-between items-center ${themeBorder} ${themeCard}`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${themeHeading}`}>
            <AlertTriangle className="w-5 h-5 text-red-500" /> 최근 긴급 이벤트
          </h3>
          <button 
            onClick={() => navigate('/alarm-system')}
            className="px-4 py-2 text-sm font-bold rounded-md bg-blue-500 text-white hover:bg-blue-400 transition-colors shadow-md"
          >
            전체 보기 →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-sm ${themeTableBody}`}>
            <thead className={`uppercase font-bold text-xs ${themeTableHead}`}>
              <tr>
                <th className="px-6 py-4">발생 시간</th>
                <th className="px-6 py-4">심각도</th>
                <th className="px-6 py-4">발생 구역</th>
                <th className="px-6 py-4">이벤트 분류</th>
                <th className="px-6 py-4">상세 내용</th>
                <th className="px-6 py-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
              {data.recentAlerts.map((alert) => (
                <tr key={alert.id} className={`${themeRowHover} transition-colors`}>
                  <td className={`px-6 py-4 font-mono ${themeSubText}`}>{alert.time}</td>
                  <td className="px-6 py-4">{getSeverityBadge(alert.severity)}</td>
                  <td className={`px-6 py-4 font-medium ${themeHeading}`}>{alert.zone}</td>
                  <td className="px-6 py-4">{alert.type}</td>
                  <td className={`px-6 py-4 truncate max-w-xs ${themeSubText}`}>{alert.desc}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => navigate(`/zone/${alert.zoneCode}`)}
                      className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Overview;
