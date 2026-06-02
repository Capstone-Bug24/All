import cv2
import time
import threading
from datetime import datetime
from queue import Queue
from flask import Flask, Response, jsonify  # 💡 jsonify 추가
from flask_cors import CORS                 # 💡 CORS 추가
from supabase import create_client, Client  # 💡 Supabase 추가

app = Flask(__name__)
CORS(app)  # 💡 프론트엔드 브라우저 접근 허용

# --- Configuration ---
BUFFER_SIZE = 30 
frame_queue = Queue(maxsize=BUFFER_SIZE)

# RTSP Camera Source
CAMERA_SOURCE = "rtsp://100.68.95.52:8554/mystream"

# --- Supabase Configuration ---
SUPABASE_URL = "https://hbxposcjxklwspzxfdli.supabase.co"
# 🔴 TODO: 노션에 적혀있는 실키값(ey...)을 아래 따옴표 안에 붙여넣으세요.
SUPABASE_KEY = "YOUR_SUPABASE_ANON_OR_SERVICE_KEY"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_bbox_from_supabase(camera_id):
    """Queries the 'ai_event_logs' table in Supabase to fetch the latest bbox."""
    try:
        response = supabase.table("ai_event_logs") \
            .select("bbox") \
            .eq("camera_id", camera_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return response.data[0]['bbox']
        return None
    except Exception as e:
        print(f"Database error: {e}")
        return None


def frame_producer():
    """Worker thread to capture frames using Producer-Consumer pattern."""
    camera = cv2.VideoCapture(CAMERA_SOURCE)
    
    while True:
        success, frame = camera.read()
        if not success:
            print(f"LOG [Error]: Camera connection lost to {CAMERA_SOURCE}. Retrying in 5 seconds...")
            camera.release()
            time.sleep(5)
            camera = cv2.VideoCapture(CAMERA_SOURCE)
            continue

        if frame_queue.full():
            try:
                frame_queue.get_nowait()
            except:
                pass
        
        frame_queue.put(frame)


def generate_frames():
    """Consumer function with FPS and Timestamp overlay."""
    prev_time = time.time()
    frame_count = 0
    display_fps = 0 

    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            frame_count += 1

            curr_time = time.time()
            time_diff = curr_time - prev_time
            
            if frame_count % 30 == 0:
                if time_diff > 0:
                    display_fps = int(30 / time_diff)
                
                prev_time = curr_time
                print(f"LOG [Performance]: Smoothed FPS: {display_fps}")

            # Draw FPS
            cv2.putText(frame, f"FPS: {display_fps}", (10, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # Draw Timestamp
            current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, current_time_str, (frame.shape[1] - 300, 40), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            time.sleep(0.01)


# --- API Routes ---

@app.route('/video_feed')
def video_feed():
    """Endpoint for continuous live video streaming."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/api/camera/<camera_id>/bbox', methods=['GET'])
def get_camera_bbox(camera_id):
    """Endpoint for the frontend to query the latest bounding box data."""
    try:
        bbox_value = fetch_bbox_from_supabase(camera_id)
        if bbox_value:
            return jsonify({"status": "success", "bbox": bbox_value}), 200
        return jsonify({"status": "error", "message": "No logs found for this camera ID"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    producer_thread = threading.Thread(target=frame_producer, daemon=True)
    producer_thread.start()
    
    app.run(host='0.0.0.0', port=5001, threaded=True)