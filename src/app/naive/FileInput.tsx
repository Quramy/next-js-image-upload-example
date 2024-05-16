import "client-only";

import { useRef, useImperativeHandle, useState, forwardRef, Ref } from "react";

import style from "./FileInput.module.css";

function FileInputBase(
  {
    thumbnailWidth,
    onChange,
    ...inputProps
  }: {
    readonly thumbnailWidth: number;
  } & Omit<React.ComponentPropsWithoutRef<"input">, "type" | "multiple">,
  ref: Ref<HTMLInputElement | null>,
) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useImperativeHandle(ref, () => fileInputRef.current);

  const [fileMetadata, updateFileMetadata] = useState<Pick<
    File,
    "size" | "name" | "type"
  > | null>(null);

  return (
    <div>
      <div>
        <input
          ref={fileInputRef}
          accept="image/*"
          type="file"
          onChange={async (event) => {
            onChange?.(event);
            if (!event.target.files?.length || !canvasRef.current) return;
            const file = event.target.files[0];
            const { name, size, type } = file;
            updateFileMetadata({ name, size, type });

            // Draw thumbnail preview
            const image = await createImageBitmap(file, {
              resizeWidth: thumbnailWidth,
              resizeQuality: "high",
            });
            const canvasElem = canvasRef.current;
            const canvasCtx = canvasElem.getContext("2d");
            canvasCtx?.clearRect(0, 0, canvasElem.width, canvasElem.height);
            canvasElem.width = image.width;
            canvasElem.height = image.height;
            canvasCtx?.drawImage(image, 0, 0);
            image.close();
          }}
          {...inputProps}
        />
      </div>
      <div className={style.preview}>
        <div>
          <canvas ref={canvasRef} />
        </div>
        {fileMetadata && (
          <dl>
            <dt>File name</dt>
            <dd>{fileMetadata.name}</dd>
            <dt>Type</dt>
            <dd>{fileMetadata.type}</dd>
            <dt>Size</dt>
            <dd>{fileMetadata.size}</dd>
          </dl>
        )}
      </div>
    </div>
  );
}

export const FileInput = forwardRef(FileInputBase);
