import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchHistoryLogs } from './api';

const ZONE_META = {
  A: 'Zone A (조립 라인)',
  B: 'Zone B (포장 라인)',
  C: 'Zone C (도장 라인)',
  D: 'Zone D (자재 창고)',
  E: 'Zone E (출하장)',
  F: 'Zone F (직원 휴게실)',
  G: 'Zone G (외부/기타)',
  // 백엔드에서 내려오는 추가 구역 매핑
  '기타 구역': 'Zone G (외부/기타)',
  'danger_q2': 'Zone A (조립 라인)',
  'forklift_lane': 'Zone D (자재 창고)',
  'danger_q2, forklift_lane': 'Zone E (출하장)',
};

const EVENT_TYPE_LABEL = {
  no_helmet: '안전모 미착용',
  unauthorized: '무단 침입',
  line_stop: '라인 정지',
  line_fast_speed: '라인 가속',
  overspeed: '제한속도 위반',
  temp_high: '온도 임계값 초과',
  pressure_check: '압력 센서 점검',
  status_recovered: '정상 상태 복구',
  // 백엔드에서 내려오는 추가 이벤트 타입
  GENERAL: '일반 알림',
  ZONE_INTRUSION: '구역 무단 진입',
  CRITICAL_HAZARD: '치명적 위험 감지',
  PROXIMITY_RISK: '근접 위험 감지'
};

const severityFromCode = (code) => {
  switch (code) {
    case 'c':
      return 'critical';
    case 'w':
      return 'warning';
    case 'i':
    default:
      return 'info';
  }
};

/**
 * logs: [[index, id, time, zoneCode, severityCode, eventType, desc], ...] -> UI 객체 배열
 */
export const processHistoryLogsForUI = (rawData) => {
  if (!rawData) return { logs: [], total: 0, page: 1, pageSize: 20 };

  const logsArr = Array.isArray(rawData.logs) ? rawData.logs : [];
  const logs = logsArr.map((row) => {
    const [displayIndex, id, time, zoneCode, sevCode, eventType, desc] = Array.isArray(row) ? row : [];
    return {
      id,
      time: time ?? '-',
      zoneCode: zoneCode ?? '',
      zone: zoneCode ? (ZONE_META[zoneCode] || String(zoneCode)) : '-',
      severity: severityFromCode(sevCode),
      severityCode: sevCode ?? '',
      eventType: eventType ?? '',
      type: EVENT_TYPE_LABEL[eventType] ?? String(eventType ?? '-'),
      desc: desc ?? '-',
    };
  });

  return {
    logs,
    total: Number(rawData.total ?? logs.length),
    page: Number(rawData.page ?? 1),
    pageSize: Number(rawData.pageSize ?? 20),
  };
};

export const HISTORY_FILTER_DEFAULTS = {
  sortBy: 'ts',
  sortOrder: 'desc',
  severity: '',
  zoneCode: '',
  eventType: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 20,
};

export const useHistoryLogsService = (filters) => {
  const { data: rawData, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['historyLogs', filters],
    queryFn: () => fetchHistoryLogs(filters),
    placeholderData: keepPreviousData,
  });

  const uiData = processHistoryLogsForUI(rawData);

  return {
    data: uiData,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
};

export { ZONE_META, EVENT_TYPE_LABEL };
