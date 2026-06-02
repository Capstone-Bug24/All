import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Settings as SettingsIcon, Save, Camera, Wifi, Thermometer, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOverviewService } from '../contexts/overviewService';
import { useToast } from '../hooks/use-toast';
import '../App.css';

const ZONE_NAMES = {
  A: 'Zone A (조립 라인)',
  B: 'Zone B (포장 라인)',
  C: 'Zone C (도장 라인)',
  D: 'Zone D (자재 창고)',
  E: 'Zone E (출하장)',
  F: 'Zone F (직원 휴게실)',
};

function ZoneDetail() {
  const { zoneId } = useParams();
  const { isDarkMode } = useAuth();
  const { data, isLoading } = useOverviewService();
  const { toast } = useToast();

  // 구역별 임시 설정 상태 (추후 백엔드 API 연동 가능)
  const [settings, setSettings] = useState({
    cctvEnabled: true,
    iotEnabled: true,
    tempThreshold: 30,
  });

  const zoneCode = zoneId?.toUpperCase() || 'A';
  const zoneName = ZONE_NAMES[zoneCode] || `Zone ${zoneCode}`;
  const zoneInfo = data?.zones?.find(z => z.id === zoneCode);

  // 테마 변수 (Settings.jsx 참고)
  const baseBg = isDarkMode ? "bg-slate-900" : "bg-slate-50";
  const textColor = isDarkMode ? "text-slate-200" : "text-slate-900";
  const cardBg = isDarkMode ? "bg-slate-800" : "bg-white";
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-200";
  const subTextColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const primaryBtn = isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" : "bg-blue-500 hover:bg-blue-600 text-white shadow";
  const dividerColor = isDarkMode ? "#334155" : "#e2e8f0";

  const handleSave = () => {
    toast({
      title: '구역 설정 저장 완료',
      description: `${zoneName}의 설정이 성공적으로 저장되었습니다.`,
      variant: 'success'
    });
  };

  if (isLoading) {
    return (
      <div className={`flex-1 w-full flex items-center justify-center transition-colors duration-300 ${baseBg} ${textColor}`}>
        <div className="flex-1 flex items-center justify-center gap-2 text-xl font-bold">
          <Activity className="w-6 h-6 animate-spin text-blue-500" /> 데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full p-8 overflow-y-auto font-sans transition-colors duration-300 ${baseBg} ${textColor}`}>
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{zoneName} 상세 정보</h1>
          <p className={subTextColor}>해당 구역의 실시간 환경 상태를 확인하고 설정을 변경할 수 있습니다.</p>
        </header>

        {/* 구역 정보 카드 */}
        <div className={`p-6 rounded-xl border transition-colors duration-300 mb-6 ${cardBg} ${borderColor} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-4" style={{ borderColor: dividerColor }}>
            <ShieldCheck className={`w-5 h-5 ${zoneInfo?.status === 'critical' ? 'text-red-500' : zoneInfo?.status === 'warning' ? 'text-orange-500' : 'text-emerald-500'}`} />
            현재 구역 상태
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-sm mb-1 ${subTextColor}`}>상태</p>
              <p className="text-xl font-bold">
                {zoneInfo?.status === 'critical' ? <span className="text-red-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> 위험 (Critical)</span> :
                 zoneInfo?.status === 'warning' ? <span className="text-orange-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> 경고 (Warning)</span> :
                 <span className="text-emerald-500 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> 정상 (Normal)</span>}
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-sm mb-1 ${subTextColor}`}>최근 특이사항</p>
              <p className={`font-medium ${zoneInfo?.status !== 'safe' ? 'text-orange-400' : ''}`}>{zoneInfo?.recentAlert || '특이사항 없음'}</p>
            </div>
          </div>
        </div>

        {/* 설정 카드 */}
        <div className={`p-6 rounded-xl border transition-colors duration-300 ${cardBg} ${borderColor} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: dividerColor }}>
            <SettingsIcon className="w-5 h-5 text-blue-500" />
            구역 환경 설정
          </h3>

          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> CCTV 연동 활성화</div>
                <div className={`text-xs mt-1 ${subTextColor}`}>이 구역의 실시간 CCTV 스트리밍을 제어합니다.</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.cctvEnabled} onChange={(e) => setSettings({...settings, cctvEnabled: e.target.checked})} />
                <div className={`block w-12 h-7 rounded-full transition-colors ${settings.cctvEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${settings.cctvEnabled ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="font-semibold flex items-center gap-2"><Wifi className="w-4 h-4" /> IoT 센서 데이터 수집</div>
                <div className={`text-xs mt-1 ${subTextColor}`}>환경 센서(온도, 습도 등)의 데이터를 수집합니다.</div>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={settings.iotEnabled} onChange={(e) => setSettings({...settings, iotEnabled: e.target.checked})} />
                <div className={`block w-12 h-7 rounded-full transition-colors ${settings.iotEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${settings.iotEnabled ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>

            <div className="pt-4 border-t" style={{ borderColor: dividerColor }}>
              <label className="block mb-2 font-semibold flex items-center gap-2"><Thermometer className="w-4 h-4" /> 온도 경고 임계값 (°C)</label>
              <div className={`text-xs mb-4 ${subTextColor}`}>해당 구역의 온도가 이 값을 초과하면 경고 알람이 발생합니다.</div>
              <div className="flex items-center gap-4">
                <input type="range" min="10" max="60" value={settings.tempThreshold} onChange={(e) => setSettings({...settings, tempThreshold: parseInt(e.target.value)})} className="flex-1 accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                <span className="font-bold w-12 text-right">{settings.tempThreshold}°C</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: dividerColor }}>
            <button onClick={handleSave} className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors ${primaryBtn}`}>
              <Save className="w-4 h-4" />
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZoneDetail;