import "client-only";

import {
  useRef,
  useImperativeHandle,
  useReducer,
  useState,
  useEffect,
  forwardRef,
  Ref,
} from "react";

type Action =
  | {
      readonly type: "selectBlob";
      readonly payload: {
        file: File;
      };
    }
  | {
      readonly type: "detatch";
      readonly payload: null;
    };

type State = {
  readonly elementVersion: number;
  readonly fileInfo: {
    readonly type: string;
    readonly name: string;
    readonly size: number;
  } | null;
};

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "selectBlob": {
      const { size, name, type } = action.payload.file;
      return {
        ...state,
        fileInfo: { size, name, type },
      };
    }
    case "detatch": {
      return {
        elementVersion: state.elementVersion + 1,
        fileInfo: null,
      };
    }
    default:
      return state;
  }
}

function FileInputBase(
  {
    thumbnailWidth,
    ...inputProps
  }: {
    readonly thumbnailWidth: number;
  } & Omit<
    React.ComponentPropsWithoutRef<"input">,
    "onChange" | "type" | "multiple"
  >,
  ref: Ref<HTMLInputElement | null>,
) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useImperativeHandle(ref, () => fileInputRef.current);

  const [{ elementVersion, fileInfo }, dispatch] = useReducer(reduce, {
    elementVersion: 0,
    fileInfo: null,
  });

  return (
    <div>
      <div>
        <input
          key={elementVersion}
          ref={fileInputRef}
          accept="image/*"
          type="file"
          onChange={async (event) => {
            if (!event.target.files?.length || !canvasRef.current) return;
            const file = event.target.files[0];
            dispatch({ type: "selectBlob", payload: { file } });

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
        <button
          type="button"
          onClick={() => dispatch({ type: "detatch", payload: null })}
        >
          Unselect
        </button>
      </div>
      <div style={{ width: thumbnailWidth }}>
        <canvas ref={canvasRef} />
      </div>
      {fileInfo && (
        <dl>
          <dt>File name</dt>
          <dd>{fileInfo.name}</dd>
          <dt>Type</dt>
          <dd>{fileInfo.type}</dd>
          <dt>Size</dt>
          <dd>{fileInfo.size}</dd>
        </dl>
      )}
    </div>
  );
}

export const FileInput = forwardRef(FileInputBase);
