import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// 탐지된 객체 종류(type)에 따른 색상 매핑 테이블
const TYPE_COLORS = {
  PERSON: { border: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },    // 파란색
  FORKLIFT: { border: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },  // 주황색
  HELMET: { border: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },     // 초록색
  DEFAULT: { border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" }    // 보라색 (기본값)
};

// cameraId가 없을 때를 대비해 기본값 "cam01"로 설정
function AiDetectionComponent({ cameraId = "cam01", isDarkMode = false }) {
  // 여러 개의 탐지 결과를 담기 위해 초기값을 빈 배열로 설정합니다.
  const [aiDetectionData, setAiDetectionData] = useState([]);

  useEffect(() => {
    // 1. 초기 바운딩 박스 데이터 가져오기 (REST API)
    // 백엔드 라우터 경로에 맞게 /api/auth/bbox 로 요청합니다.
    fetch("http://localhost:4000/api/auth/bbox")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.detections) {
          console.log("📦 초기 BBox 데이터 수신 완료:", data.detections);
          setAiDetectionData(data.detections);
        }
      })
      .catch((error) => console.error("🚨 API Fetch Error:", error));

    // 2. 실시간 바운딩 박스 업데이트 (WebSocket)
    const socket = io("http://localhost:4000");

    socket.on("bbox_update", (data) => {
      // 데이터가 많이 들어올 수 있으므로 로그는 필요 시에만 켜두세요
      // console.log("📡 실시간 BBox 데이터 수신:", data);
      if (data && data.detections) {
        setAiDetectionData(data.detections);
      }
    });

    return () => socket.disconnect();
  }, [cameraId]);

  // Dynamically calculate CSS styles based on the bounding box coordinates
  const getBoxStyle = (bbox_norm, type, isAlert) => {
    if (!bbox_norm) return {};
    
    let x1, y1, x2, y2;

    // 백엔드에서 배열 [xmin, ymin, xmax, ymax] 형태로 들어올 경우
    if (Array.isArray(bbox_norm) && bbox_norm.length >= 4) {
      [x1, y1, x2, y2] = bbox_norm;
    } 
    // 백엔드에서 객체 {x1, y1, x2, y2} 혹은 {xmin, ymin, xmax, ymax} 형태로 들어올 경우
    else if (typeof bbox_norm === "object") {
      x1 = bbox_norm.x1 ?? bbox_norm.xmin ?? bbox_norm.x_min;
      y1 = bbox_norm.y1 ?? bbox_norm.ymin ?? bbox_norm.y_min;
      x2 = bbox_norm.x2 ?? bbox_norm.xmax ?? bbox_norm.x_max;
      y2 = bbox_norm.y2 ?? bbox_norm.ymax ?? bbox_norm.y_max;
    }

    if (x1 === undefined || y1 === undefined) return {};

    // bbox_norm 값(0~1)을 퍼센트(0~100)로 변환
    const left = x1 * 100;
    const top = y1 * 100;
    const width = (x2 - x1) * 100;
    const height = (y2 - y1) * 100;

    // 객체 종류(type)에 맞는 테마 색상 가져오기
    const theme = TYPE_COLORS[type] || TYPE_COLORS.DEFAULT;

    // 알람 상태일 때는 강제로 빨간색으로 덮어씌움
    const color = isAlert ? "#ef4444" : theme.border; 
    const bgColor = isAlert ? "rgba(239, 68, 68, 0.15)" : theme.bg;

    return {
      position: "absolute",
      border: `3px solid ${color}`,
      backgroundColor: bgColor,
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
      pointerEvents: "none",
      boxShadow: isAlert ? "0 0 8px rgba(239, 68, 68, 0.8)" : "none", // 위험 상태면 붉은 그림자 효과 추가
    };
  };

  return (
    <div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
      <h3 style={{ marginBottom: "12px", color: isDarkMode ? "#f8fafc" : "inherit" }}>
        AI Detection Monitor (On-Demand)
      </h3>

      {/* Video Stream and Box Overlay Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <img
          src="http://localhost:5001/video_feed"
          alt="Live Feed"
          style={{ width: "100%", display: "block" }}
        />

        {/* 여러 개의 감지된 객체(detections)를 순회하며 바운딩 박스를 그립니다 */}
        {aiDetectionData &&
          aiDetectionData.map((det, index) => {
            const theme = TYPE_COLORS[det.type] || TYPE_COLORS.DEFAULT;
            const labelBgColor = det.is_alert ? "#ef4444" : theme.border;

            return (
            <div key={det.id || `bbox-${index}`} style={getBoxStyle(det.bbox_norm, det.type, det.is_alert)}>
              <span
                style={{
                  position: "absolute",
                  top: "-25px",
                  left: "-3px",
                  backgroundColor: labelBgColor,
                  color: "#fff",
                  padding: "2px 6px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderRadius: "4px 4px 0 0",
                  textTransform: "uppercase",
                }}
              >
                {det.type}
              </span>
            </div>
            );
          })}
      </div>

      <div
        style={{
          marginTop: "16px",
          backgroundColor: isDarkMode ? "#1e293b" : "#f9f9f9",
          padding: "12px",
          borderRadius: "6px",
        }}
      >
        {aiDetectionData && aiDetectionData.length > 0 ? (
          <p style={{ margin: 0, fontSize: "14px", color: isDarkMode ? "#cbd5e1" : "#333" }}>
            현재 탐지된 객체 수: <strong style={{ color: isDarkMode ? "#fff" : "#000" }}>{aiDetectionData.length}</strong>개
          </p>
        ) : (
          <p style={{ margin: 0, color: isDarkMode ? "#94a3b8" : "#888", fontSize: "14px" }}>
            탐지된 객체가 없거나 데이터를 불러오는 중입니다.
          </p>
        )}
      </div>
    </div>
  );
}

export default AiDetectionComponent;
