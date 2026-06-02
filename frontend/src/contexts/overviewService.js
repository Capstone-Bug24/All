import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * 로우(Raw) 데이터를 UI용으로 가공하는 헬퍼 함수
 * 추후 서버에서 내려오는 데이터 구조 변경 시 여기서 대응하여 UI 컴포넌트의 수정을 최소화합니다.
 */
const processDataForUI = (rawData) => {
  if (!rawData) return null;

  // ---- 1) 고정 매핑 테이블 (백엔드에서 id/code만 내려오는 전제) ----
  const SYSTEM_META = {
    1: { name: 'CCTV 카메라 연결', iconType: 'cctv' },
    2: { name: 'IoT 안전 센서', iconType: 'iot' },
    3: { name: 'AI 비전 탐지 모델', iconType: 'ai' },
    4: { name: '백엔드 메인 서버', iconType: 'server' },
  };

  const ZONE_META = {
    A: 'Zone A (조립 라인)',
    B: 'Zone B (포장 라인)',
    C: 'Zone C (도장 라인)',
    D: 'Zone D (자재 창고)',
    E: 'Zone E (출하장)',
    F: 'Zone F (직원 휴게실)',
    G: 'Zone G (외부/기타)',
    
  };

  const EVENT_TYPE_LABEL = {
    no_helmet: '안전모 미착용',
    unauthorized: '무단 침입',
    line_stop: '라인 정지',
    overspeed: '제한속도 위반',
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

  const zoneStatusFromCode = (code) => {
    switch (code) {
      case 'c':
        return 'critical';
      case 'w':
        return 'warning';
      case 's':
      default:
        return 'safe';
    }
  };

  // ---- 2) metrics: [totalAlarms, critical, warning, info, activeWorkers] ----
  const metricsArr = Array.isArray(rawData.metrics) ? rawData.metrics : [];
  const metrics = {
    totalAlarms: Number(metricsArr[0] ?? 0),
    critical: Number(metricsArr[1] ?? 0),
    warning: Number(metricsArr[2] ?? 0),
    info: Number(metricsArr[3] ?? 0),
    activeWorkers: Number(metricsArr[4] ?? 0),
  };

  // ---- 3) health: { "<id>": [statusText, state] } -> systemHealth[] ----
  const health = rawData.health && typeof rawData.health === 'object' ? rawData.health : {};
  const systemHealth = Object.entries(health)
    .map(([idStr, tuple]) => {
      const id = Number(idStr);
      const [statusText, state] = Array.isArray(tuple) ? tuple : [];
      const meta = SYSTEM_META[id] ?? { name: `시스템 ${id}`, iconType: 'server' };
      return {
        id,
        name: meta.name,
        iconType: meta.iconType,
        state: state === 'good' ? 'good' : 'warning',
        status: statusText ?? '-',
      };
    })
    .sort((a, b) => a.id - b.id);

  // ---- 4) env: { temp, hum, gas } -> envData[] ----
  const env = rawData.env && typeof rawData.env === 'object' ? rawData.env : {};
  const temp = Number(env.temp ?? NaN);
  const hum = Number(env.hum ?? NaN);
  const gas = Number(env.gas ?? NaN);

  // 임시 임계값(나중에 백엔드에서 state를 내려주면 그걸 쓰는 걸 권장)
  const tempState = Number.isFinite(temp) && temp >= 30 ? 'warning' : 'good';
  const humState = Number.isFinite(hum) && hum >= 70 ? 'warning' : 'good';
  const gasState = Number.isFinite(gas) && gas >= 0.05 ? 'warning' : 'good';

  const envData = [
    {
      id: 1,
      name: '현장 평균 온도',
      value: Number.isFinite(temp) ? `${temp}°C` : '-',
      state: tempState,
      iconType: 'temp',
    },
    {
      id: 2,
      name: '현장 평균 습도',
      value: Number.isFinite(hum) ? `${hum}%` : '-',
      state: humState,
      iconType: 'humidity',
    },
    {
      id: 3,
      name: '유해가스 (CO)',
      value: Number.isFinite(gas) ? `${gas} ppm` : '-',
      state: gasState,
      iconType: 'gas',
    },
  ];

  // ---- 5) zones: { "<code>": [statusCode, summary] } -> zones[] ----
  const zonesObj = rawData.zones && typeof rawData.zones === 'object' ? rawData.zones : {};
  const allZoneCodes = Object.keys(ZONE_META);
  const zones = allZoneCodes.map((code) => {
    const entry = zonesObj[code];
    const [statusCode, summary] = Array.isArray(entry) ? entry : ['s', '특이사항 없음'];
    return {
      id: code,
      name: ZONE_META[code],
      status: zoneStatusFromCode(statusCode),
      recentAlert: summary ?? '특이사항 없음',
    };
  });

  // ---- 6) alerts: [[id,time,zoneCode,severityCode,eventType,desc], ...] -> recentAlerts[] ----
  const alertsArr = Array.isArray(rawData.alerts) ? rawData.alerts : [];
  const recentAlerts = alertsArr.map((a) => {
    const [id, time, zoneCode, sevCode, eventType, desc] = Array.isArray(a) ? a : [];
    return {
      id,
      time: time ?? '-',
      zoneCode: zoneCode ?? '',
      zone: zoneCode ? (ZONE_META[zoneCode] ? `Zone ${zoneCode}` : String(zoneCode)) : '-',
      severity: severityFromCode(sevCode),
      type: EVENT_TYPE_LABEL[eventType] ?? String(eventType ?? '-'),
      desc: desc ?? '-',
    };
  });

  return {
    metrics,
    systemHealth,
    envData,
    zones,
    recentAlerts,
  };
};

/**
 * Overview 실시간 데이터를 관리하는 커스텀 훅
 * - 초기 로딩: REST API (React Query 사용)
 * - 실시간 업데이트: WebSocket (Socket.io 사용)
 */
export const useOverviewService = () => {
  // 가공된 데이터가 아닌, 서버에서 온 원본(Raw) 데이터를 상태로 관리합니다.
  const [rawDataState, setRawDataState] = useState(null);

  // 웹소켓 연결 및 실시간 업데이트 이벤트 구독 (REST API 초기 데이터 및 더미 데이터 로직 제거)
  useEffect(() => {
    // TODO: 백엔드의 WebSocket 서버 주소와 네임스페이스/채널에 맞게 변경
    const socket = io('http://localhost:4000', {
      transports: ['websocket'],
    });

    // 💡 AI 실시간 탐지 이벤트 리시버(event_reciever.py) 웹소켓 분리 연결이 필요할 경우 아래 주석 해제
    // const aiSocket = io('http://localhost:5002', { transports: ['websocket'] });

    socket.on('connect', () => console.log('✅ Overview 웹소켓 연결 성공'));

    socket.on('overview_update', (newRawData) => {
      console.log('📡 Overview 실시간 데이터 수신:', newRawData);
      // 웹소켓에서 내려온 원본 데이터로 상태를 즉시 덮어쓰기 업데이트
      setRawDataState(newRawData);
    });

    // 💡 AI 비전 탐지 실시간 데이터 (ai_detection) 수신 처리 준비
    socket.on('ai_detection', (aiData) => {
      console.log('📡 AI 비전 탐지 실시간 데이터 수신:', aiData);
      // 필요 시 aiData 기반 상태 업데이트 로직 추가
    });

    socket.on('disconnect', () => console.log('❌ Overview 웹소켓 연결 해제'));

    return () => {
      socket.disconnect(); // 언마운트 시 구독 해제
      // aiSocket.disconnect();
    };
  }, []);

  // rawDataState가 변경될 때마다(웹소켓 이벤트가 들어올 때마다) 화면에 그릴 uiData를 새롭게 계산합니다.
  const uiData = processDataForUI(rawDataState);

  return {
    data: uiData,
    isLoading: !rawDataState,
    isError: false,
  };
};