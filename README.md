## 💡 Motivation & Problem Statement

Standard watch-party implementations rely solely on broadcasting `play` and `pause` events over WebSockets. Over a 2-hour movie, minor variations in network latency, browser rendering speeds, and client buffering inevitably cause viewers to drift out of sync. 

**SyncStream** solves this by decoupling media delivery from state synchronization—streaming adaptive video chunks via HTTP Live Streaming (HLS) while maintaining a lightweight WebSocket heartbeat to detect and correct client clock drift without jarring video stutters.

---

## ✨ Key Features

* **Adaptive Bitrate Streaming:** Powered by `HLS.js` to dynamically adjust video quality based on client bandwidth.
* **Sub-Second State Sync:** Real-time broadcasting of `PLAY`, `PAUSE`, and `SEEK` events across isolated Socket.io rooms.
* **Two-Tier Clock-Drift Correction:** 
  * **Soft Sync (0.2s – 1.5s drift):** Temporarily adjusts `video.playbackRate` (`1.05x` or `0.95x`) to smoothly catch up without interrupting playback.
  * **Hard Sync (>1.5s drift):** Executes a direct timestamp seek (`video.currentTime`) for immediate alignment.
* **Infinite Loop Prevention:** Client-side state guards prevent remote socket triggers from re-emitting redundant events back to the server.
* **Mid-Stream Join & Presence:** Automatically syncs late joiners to the host's exact timestamp and tracks active room participants alongside live chat.

---

## 🏗️ System Architecture

```text
+-------------------+       HLS Video Chunks (.m3u8 / .ts)       +-------------------+

|                   | <----------------------------------------- |                   |
|   Client A (Host) |                                            |   Media Storage   |
|  (React + HLS.js) |       WebSocket Heartbeat & Events         |   (CDN / S3)      |
|                   | <========================================> |                   |
+-------------------+                                            +-------------------+
                                          ||
                                          \/
                               +----------------------+

                               |   Node.js + Express  |
                               |   Socket.io Server   |
                               |  (Room State & Sync) |
                               +----------------------+
                                          /\
                                          ||
+-------------------+                     ||                     +-------------------+

|                   | <===================++===================> |                   |
|  Client B (Guest) |       WebSocket Sync & Chat Events         |   Media Storage   |
|  (React + HLS.js) | <----------------------------------------- |   (CDN / S3)      |
+-------------------+       HLS Video Chunks (.m3u8 / .ts)       +-------------------+
```

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, HLS.js
* **Backend:** Node.js, Express, Socket.io
* **Media Pipeline:** FFmpeg (for transcoding `.mp4` sources into `.m3u8` playlists and `.ts` segments)
* **Deployment:** [e.g., Vercel (Frontend), Render / Railway (WebSocket Server)]

---

## 🚀 Getting Started

### Prerequisites
* Node.js (`v18+`)
* npm or yarn
* *(Optional)* FFmpeg installed locally if transcoding custom video files

### Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com[your-username]/[repo-name].git
   cd Low Latency
   ```

2. **Install & start the WebSocket server**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Install & start the React client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Test synchronization**
   Open `http://localhost:5173` in two separate browser windows, create a room, and copy the Room URL into the second window.

---

## 🧠 Engineering Challenges & Tradeoffs

* **Playback Rate vs. Hard Seeking:** Constantly snapping `video.currentTime` creates a jarring user experience whenever minor network jitter occurs. Implementing a proportional `playbackRate` adjustment keeps audio/video smooth while resolving minor drift within seconds.
* **Decoupling Media from Control:** Routing video bytes through the Node.js server would create an immediate I/O bottleneck. By serving static `.ts` segments separately via HTTP and keeping WebSockets strictly for lightweight JSON payloads (`< 1 KB`), the server easily handles high concurrency.

---

## 🗺️ Roadmap & Future Improvements

- [ ] **Automated Host Migration:** Reassign host privileges automatically if the room creator disconnects.
- [ ] **WebRTC Voice/Video Chat:** Add peer-to-peer spatial audio reactions alongside text chat.
- [ ] **Automated FFmpeg Upload Pipeline:** Allow users to upload raw `.mp4` files that transcode asynchronously via worker queues.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
