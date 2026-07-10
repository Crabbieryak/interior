"use client";

import { useState, useRef } from "react";

export default function TestPage() {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File captured:", file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      console.log("Image URL created:", url);
    }
    e.target.value = '';
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">📸 Camera Test</h1>
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        ref={fileInputRef}
        className="hidden"
        id="test-camera"
      />

      <button
        onClick={triggerCamera}
        className="bg-black text-white px-6 py-3 rounded-lg w-full text-lg"
      >
        Open Camera
      </button>

      {image && (
        <div className="mt-4">
          <img src={image} alt="Captured" className="w-full rounded-lg" />
          <p className="text-sm text-green-600 mt-2">✅ Image captured successfully!</p>
        </div>
      )}
    </div>
  );
}