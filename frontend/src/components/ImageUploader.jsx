import { useRef, useState } from "react";

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function ImageUploader({ onFileSelected }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  };

  return (
    <div
      className={`uploader ${dragging ? "dragging" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      role="button"
      tabIndex={0}
    >
      <div className="uploader-icon"><IconCamera /></div>
      <div className="uploader-title">Drop a photo here, or click to browse</div>
      <div className="uploader-sub">We will find products with a similar color and style</div>
      <div className="upload-btn">Select image</div>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
