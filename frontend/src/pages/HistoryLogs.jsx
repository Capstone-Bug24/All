import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  useHistoryLogsService,
  HISTORY_FILTER_DEFAULTS,
  ZONE_META,
  EVENT_TYPE_LABEL,
} from '../contexts/historyService';

const SEVERITY_OPTIONS = [
  { value: '', label: '전체 심각도' },
  { value: 'c', label: 'Critical' },
  { value: 'w', label: 'Warning' },
  { value: 'i', label: 'Info' },
];

const ZONE_OPTIONS = [
  { value: '', label: '전체 구역' },
  ...Object.entries(ZONE_META).map(([code, name]) => ({
    value: code,
    label: `${code} — ${name}`,
  })),
];

const EVENT_OPTIONS = [
  { value: '', label: '전체 이벤트' },
  ...Object.entries(EVENT_TYPE_LABEL).map(([code, label]) => ({
    value: code,
    label,
  })),
];

function SortHeader({ column, label, sortBy, sortOrder, onToggle, isDarkMode }) {
  const isActive = sortBy === column;
  return (
    <th className="px-4 py-2">
      <button
        type="button"
        onClick={() => onToggle(column)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md uppercase font-bold text-xs transition-all shadow-sm border whitespace-nowrap
          ${isDarkMode 
            ? isActive 
              ? 'bg-slate-800 text-blue-400 border-slate-600 hover:bg-slate-700' 
              : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700 hover:text-slate-200'
            : isActive
              ? 'bg-white text-blue-600 border-slate-300 hover:bg-slate-50'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-700'
          }`}
      >
        <span>{label}</span>
        <span className="flex items-center justify-center w-4 h-4 ml-1 flex-shrink-0">
          {isActive ? (
            <span className="text-sm font-black normal-case leading-none">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-50" />
          )}
        </span>
      </button>
    </th>
  );
}

function HistoryLogs() {
  const { isDarkMode } = useAuth();
  const [filters, setFilters] = useState({ ...HISTORY_FILTER_DEFAULTS });
  const { data, isLoading, isError, isFetching } = useHistoryLogsService(filters);

  const themeBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const themeText = isDarkMode ? 'text-slate-200' : 'text-slate-900';
  const themeCard = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const themeBorder = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const themeSubText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const themeInset = isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100';
  const themeHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const themeRowHover = isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-100';
  const themeTableText = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const themeCellMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const themeCellStrong = isDarkMode ? 'text-white' : 'text-slate-900';

  const pageShellClass = `flex-1 w-full p-8 overflow-y-auto font-sans self-stretch items-stretch justify-start transition-colors duration-300 ${themeBg} ${themeText}`;

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  }, []);

  const toggleSort = (column) => {
    setFilters((prev) => {
      if (prev.sortBy === column) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
          page: 1,
        };
      }
      return { ...prev, sortBy: column, sortOrder: 'desc', page: 1 };
    });
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / filters.pageSize));

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">
            <AlertOctagon className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold border border-orange-500/30">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'info':
        return (
          <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
      default:
        return null;
    }
  };

  const selectBg = isDarkMode ? '#0f172a' : '#ffffff';
  const selectBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const selectColor = isDarkMode ? '#e2e8f0' : '#0f172a';
  const pageBtnBg = isDarkMode ? '#1e293b' : '#f1f5f9';
  const pageBtnHover = isDarkMode ? '#334155' : '#e2e8f0';

  if (isLoading && !data?.logs?.length) {
    return (
      <div className={pageShellClass}>
        <div className="flex-1 flex items-center justify-center gap-2 text-xl font-bold">
          <Activity className="w-6 h-6 animate-spin text-blue-500" />
          데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={pageShellClass}>
        <div className="flex-1 flex items-center justify-center gap-2 text-xl font-bold text-red-400">
          <AlertTriangle className="w-6 h-6" />
          이력 로그를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-8">
        </header>

        <div className={`rounded-xl shadow-lg mb-6 p-6 border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <h3 className={`text-sm font-bold uppercase mb-4 ${themeSubText}`}>필터</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              심각도
              <select
                value={filters.severity}
                onChange={(e) => updateFilter('severity', e.target.value)}
                className="history-select"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-sev'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              구역
              <select
                value={filters.zoneCode}
                onChange={(e) => updateFilter('zoneCode', e.target.value)}
                className="history-select"
              >
                {ZONE_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-zone'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              이벤트 유형
              <select
                value={filters.eventType}
                onChange={(e) => updateFilter('eventType', e.target.value)}
                className="history-select"
              >
                {EVENT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all-event'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              시작일
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="history-select"
              />
            </label>

            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              종료일
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="history-select"
              />
            </label>

            <label className={`flex flex-col gap-1 text-xs ${themeSubText}`}>
              페이지당 개수
              <select
                value={filters.pageSize}
                onChange={(e) => updateFilter('pageSize', Number(e.target.value))}
                className="history-select"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}건
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={`mt-4 flex items-center justify-between text-xs ${themeSubText}`}>
            <span>
              총 {data.total}건
              {isFetching && (
                <span className="ml-2 text-blue-400 inline-flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" /> 갱신 중
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setFilters({ ...HISTORY_FILTER_DEFAULTS })}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm border
                ${isDarkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              필터 초기화
            </button>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg overflow-hidden border transition-colors duration-300 ${themeCard} ${themeBorder} ${!isDarkMode ? 'shadow-sm' : ''}`}>
          <div className={`p-6 border-b ${themeBorder}`}>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${themeHeading}`}>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              기록 목록
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full min-w-[900px] text-left text-sm table-fixed ${themeTableText}`}>
              <colgroup>
                <col style={{ width: '8%' }} />  {/* ID */}
                <col style={{ width: '16%' }} /> {/* 발생 시간 */}
                <col style={{ width: '14%' }} /> {/* 심각도 */}
                <col style={{ width: '16%' }} /> {/* 발생 구역 */}
                <col style={{ width: '16%' }} /> {/* 이벤트 분류 */}
                <col style={{ width: '30%' }} /> {/* 상세 내용 */}
              </colgroup>
              <thead className={`${themeInset} ${themeSubText}`}>
                <tr>
                  <th className="px-4 py-4 text-xs font-bold uppercase">ID</th>
                  <SortHeader column="ts" label="발생 시간" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onToggle={toggleSort} isDarkMode={isDarkMode} />
                  <SortHeader column="severity" label="심각도" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onToggle={toggleSort} isDarkMode={isDarkMode} />
                  <SortHeader column="zone" label="발생 구역" sortBy={filters.sortBy} sortOrder={filters.sortOrder} onToggle={toggleSort} isDarkMode={isDarkMode} />
                  <th className="px-4 py-4 text-xs font-bold uppercase">이벤트 분류</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase">상세 내용</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
                {data.logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-12 text-center ${themeSubText}`}>
                      조건에 맞는 기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.logs.map((log) => (
                    <tr key={log.id} className={`${themeRowHover} transition-colors`}>
                      <td className={`px-4 py-4 font-mono ${themeCellMuted} truncate`}>{log.id}</td>
                      <td className={`px-4 py-4 font-mono ${themeCellMuted} truncate`}>{log.time}</td>
                      <td className="px-4 py-4">{getSeverityBadge(log.severity)}</td>
                      <td className={`px-4 py-4 font-medium ${themeCellStrong} truncate`}>{log.zone}</td>
                      <td className="px-4 py-4 truncate">{log.type}</td>
                      <td className={`px-4 py-4 truncate ${themeCellMuted}`} title={log.desc}>{log.desc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={`px-6 py-4 border-t flex items-center justify-between ${themeBorder}`}>
            <span className={`text-sm ${themeSubText}`}>
              {data.total > 0
                ? `${(filters.page - 1) * filters.pageSize + 1}–${Math.min(filters.page * filters.pageSize, data.total)} / ${data.total}`
                : '0건'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => updateFilter('page', filters.page - 1)}
                className="history-page-btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-sm px-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {filters.page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() => updateFilter('page', filters.page + 1)}
                className="history-page-btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .history-select {
          background-color: ${selectBg};
          border: 1px solid ${selectBorder};
          border-radius: 6px;
          padding: 8px 12px;
          color: ${selectColor};
          font-size: 14px;
        }
        .history-select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .history-page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 6px;
          background-color: ${pageBtnBg};
          border: 1px solid ${selectBorder};
          color: ${selectColor};
          transition: background-color 0.15s;
        }
        .history-page-btn:hover:not(:disabled) {
          background-color: ${pageBtnHover};
        }
        .history-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default HistoryLogs;
