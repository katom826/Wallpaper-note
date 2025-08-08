"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import html2canvas from "html2canvas";
import Dialog from "@/components/Dialog";
import ColorButton from "@/components/ColorButton";

export default function Home() {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>(
    undefined
  );
  const [textColor, setTextColor] = useState<string | undefined>(undefined);
  const captureRef = useRef<HTMLDivElement>(null);
  const captureDialogRef = useRef<HTMLDialogElement>(null);
  const colorDialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // todo アクセスした端末の解像度を自動で最初に反映したい
    // indexedDBに保存した下敷き画像があれば、反映する機能をつけたい
  }, []);

  // 画像化
  const handleCaptureAsImage = async () => {
    if (!captureRef.current) return;

    setIsCapturing(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const canvas = await html2canvas(captureRef.current);
    const imgData = canvas.toDataURL("image/png");
    setImgSrc(imgData);

    setIsCapturing(false);

    captureDialogRef.current?.showModal();
  };

  // 背景色設定
  const handleSetBackgroundColor = () => {
    colorDialogRef.current?.showModal();
  };

  // 下敷き設定
  const handleSetBackdrop = () => {
    // todo indexdDBに下敷き画像を保存する機能をつける

    if (backdrop) {
      setBackdrop(null);
    } else {
      fileInputRef.current?.click();
    }
  };

  // 下敷きアップロード時
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBackdrop(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 解像度変更
  const handleSetResolution = () => {
    alert("解像度変更");
  };

  return (
    <main className="flex flex-col h-screen bg-white dark:bg-black">
      <div className="flex-grow flex justify-center p-5">
        <div
          ref={captureRef}
          className={`flex flex-col gap-4 justify-around aspect-[9/19.5] p-5 ${
            isCapturing ? "" : "border-2 border-gray-700 shadow-md rounded-lg"
          }`}
          style={{
            backgroundColor: backgroundColor,
            backgroundImage: isCapturing
              ? undefined
              : backdrop
              ? `url(${backdrop})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <input
            type="text"
            className={`w-full p-1 text-center ${
              isCapturing
                ? ""
                : "border-2 border-blue-400 focus:border-blue-500 focus:outline-none rounded-lg shadow-md"
            } ${textColor}`}
            style={{ fontSize: "1.1rem" }}
            placeholder="メモを入力してください"
          />
        </div>
      </div>

      <div className="h-15 flex justify-around gap-2 m-3">
        <Button onClick={handleSetResolution}>解像度</Button>
        <Button onClick={handleSetBackdrop}>下敷き</Button>
        <Button onClick={handleSetBackgroundColor}>背景色</Button>
        <Button onClick={handleCaptureAsImage} variant="primary">
          画像化
        </Button>
      </div>

      <Dialog ref={captureDialogRef}>
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt="キャプチャ画像"
              className="shadow-lg rounded-lg"
            />
            <p className="text-center text-blue-600">
              画像を長押しして保存してください
            </p>
          </>
        ) : (
          <p>画像を読み込み中です</p>
        )}
      </Dialog>

      <Dialog ref={colorDialogRef}>
        <ColorButton
          backgroundColor="bg-white hover:bg-gray-100 active:bg-gray-200"
          textColor="text-black"
          onClick={() => {
            setBackgroundColor("white");
            setTextColor("text-black");
            colorDialogRef.current?.close();
          }}
        ></ColorButton>
        <ColorButton
          backgroundColor="bg-black"
          textColor="text-white"
          onClick={() => {
            setBackgroundColor("black");
            setTextColor("text-white");
            colorDialogRef.current?.close();
          }}
        ></ColorButton>
        <ColorButton
          backgroundColor="bg-red-500"
          textColor="text-white"
          onClick={() => {
            setBackgroundColor("#ef4444");
            setTextColor("text-white");
            colorDialogRef.current?.close();
          }}
        ></ColorButton>
      </Dialog>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </main>
  );
}
