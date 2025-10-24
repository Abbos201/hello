import { useRef, useEffect, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Kamerani ishga tushirish
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => { videoRef.current.srcObject = stream; })
      .catch(err => console.error("Camera error:", err));

    // Har 5 soniyada rasm yuborish
    const interval = setInterval(() => {
      captureAndSend();
    }, 1000); // 5000 ms = 5 soniya

    return () => clearInterval(interval);
  }, []);

  const captureAndSend = async () => {
    if (sending || !videoRef.current) return;
    setSending(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg"));
      const formData = new FormData();
      formData.append("photo", blob, "auto_frame.jpg");

      const res = await fetch("/api/send-photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Auto send response:", data);
    } catch (err) {
      console.error("Error sending auto photo:", err);
    }

    setSending(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Avtomatik Kamera Bot</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "400px" }} />
      <p>{sending ? "Yuborilmoqda..." : "Har 5 soniyada rasm yuboriladi"}</p>
    </div>
  );
}
