import axios from 'axios';

// 백엔드 API 통신 (Overview, History Logs 등 전체 데이터 수신)
export const apiClient = axios.create({
  // TODO: 실제 백엔드 서버 주소로 변경하세요.
  // 배포 시에는 import.meta.env.VITE_API_URL 등 환경변수 사용을 권장합니다.
  baseURL: 'http://localhost:4000/api',
  timeout: 60000,
});

/** History Logs API 쿼리 파라미터 빌드 (백엔드 연동 시 사용) */
export const buildHistoryQueryParams = (params) => {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query[key] = value;
    }
  });
  return query;
};

/**
 * History Logs 로우 데이터를 백엔드에서 가져오는 API 함수
 * @param {Object} params - sortBy, sortOrder, severity, zoneCode, eventType, dateFrom, dateTo, page, pageSize
 * @returns {Promise<{ logs: Array, total: number, page: number, pageSize: number }>}
 *
 * logs 튜플 포맷:
 * [index, id, time, zoneCode, severityCode(c|w|i), eventType, desc]
 */
export const fetchHistoryLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/history/logs', {
      params: buildHistoryQueryParams(params),
    });
    return response.data;
  } catch (error) {
    console.error('History Logs Fetch 실패, 빈 데이터로 대체합니다:', error);
    // 백엔드 연결 오류 시 테이블 렌더링에 에러가 나지 않도록 빈 구조 반환
    return {
      logs: [],
      total: 0,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };
  }
};
