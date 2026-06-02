import { Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AiDetectionComponent from "../contexts/AiDetectionComponent";

function LiveMonitor() {
  const { isDarkMode } = useAuth();

  const themeBg = isDarkMode ? "bg-slate-900" : "bg-slate-50";
  const themeText = isDarkMode ? "text-slate-200" : "text-slate-900";
  const themeCard = isDarkMode ? "bg-slate-800" : "bg-white";
  const themeBorder = isDarkMode ? "border-slate-700" : "border-slate-200";
  const themeSubText = isDarkMode ? "text-slate-400" : "text-slate-500";
  const themeInset = isDarkMode ? "bg-slate-900" : "bg-slate-100";
  const themeMetricCard = isDarkMode
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-slate-200 shadow-sm";

  const metrics = [
    { label: "온도", value: "23.5°C", color: "text-blue-500" },
    { label: "습도", value: "65%", color: "text-emerald-500" },
    { label: "압력", value: "1013 hPa", color: "text-violet-500" },
  ];

  return (
    <div
      className={`flex-1 w-full p-8 overflow-y-auto font-sans self-stretch items-stretch justify-start transition-colors duration-300 ${themeBg} ${themeText}`}
    >
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8"></header>

        {/* 💡 덮어씌운 부분: cameraId props를 명시적으로 전달 */}
        <AiDetectionComponent isDarkMode={isDarkMode} cameraId="cam01" />

        <div
          className={`mt-6 rounded-xl border p-6 transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? "shadow-sm" : ""}`}
        >
          <h3
            className={`text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3 ${isDarkMode ? "text-white border-slate-700" : "text-slate-900 border-slate-200"}`}
          >
            <Activity className="w-5 h-5 text-blue-500" />
            실시간 데이터
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={`p-5 rounded-lg border transition-colors duration-300 ${themeMetricCard}`}
              >
                <div className={`text-sm font-bold mb-2 ${themeSubText}`}>
                  {m.label}
                </div>
                <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                <div className={`text-xs mt-2 ${themeSubText}`}>
                  업데이트: 방금 전
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}

export default LiveMonitor;
