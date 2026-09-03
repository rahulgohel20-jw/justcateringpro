import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button"; // Use Metronic/Shadcn button
import { Card, CardContent } from "@/components/ui/card";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const CheckInModal = ({ isModalOpen, setIsModalOpen }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setStatus("Uploading...");

    // try {
    //   setLoading(true);
    //   // Send image to backend
    //   const response = await fetch("/api/face-checkin", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ image: imageSrc }),
    //   });

    //   const result = await response.json();
    //   setStatus(result.message || "Success");
    // } catch (err) {
    //   setStatus("Something went wrong. Try again.");
    // } finally {
    //   setLoading(false);
    // }
  };

  const reset = () => {
    setImgSrc(null);
    setStatus("");
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  return (
    <CustomModal
      open={isModalOpen}
      onClose={handleModalClose}
      title="Check In"
      width={460}
      footer={null}
    >
      <CardContent className="flex flex-col items-center gap-4">
        {!imgSrc ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 400,
                height: 300,
                facingMode: "user",
              }}
              className="rounded-md shadow-lg border"
            />
            <Button
              onClick={capture}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              {loading ? "Processing..." : "Scan Face for Check-In"}
            </Button>
          </>
        ) : (
          <>
            <img src={imgSrc} alt="Captured" className="rounded shadow-md" />
            <div className="flex gap-2 w-full">
              <Button onClick={reset} variant="outline" className="w-full">
                Retake
              </Button>
              <Button disabled className="w-full bg-green-600 text-white">
                {status || "Uploading..."}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </CustomModal>
  );
};

export default CheckInModal;
