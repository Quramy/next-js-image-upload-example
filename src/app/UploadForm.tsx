"use client";

import { useRef, useState } from "react";

import { getPresignedUrlForUpload, postImage } from "./actions";

export function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [elementVersion, updateElementVersion] = useState(0);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!fileInputRef.current?.files?.length) return;
        const file = fileInputRef.current.files[0];
        const { objectId, presignedURL } = await getPresignedUrlForUpload();
        await fetch(presignedURL, {
          method: "PUT",
          body: file,
        });
        await postImage({ objectId });
      }}
    >
      <div>
        <div>
          <input
            key={elementVersion}
            type="file"
            ref={fileInputRef}
            onChange={async (event) => {
              if (!event.target.files?.length || !canvasRef.current) return;
              const file = event.target.files[0];
              const image = await createImageBitmap(file, {
                resizeWidth: 200,
                resizeQuality: "high",
              });
              const canvasElem = canvasRef.current;
              const canvasCtx = canvasElem.getContext("2d");
              canvasElem.width = image.width;
              canvasElem.height = image.height;
              canvasCtx?.clearRect(0, 0, image.width, image.height);
              canvasCtx?.drawImage(image, 0, 0);
              image.close();
            }}
          />
          <button
            type="button"
            onClick={() => updateElementVersion(elementVersion + 1)}
          >
            Unselect
          </button>
        </div>
        <div style={{ width: 200 }}>
          <canvas key={`canvas_${elementVersion}`} ref={canvasRef} />
        </div>
      </div>
      <nav>
        <button type="submit">Upload</button>
      </nav>
    </form>
  );
}
