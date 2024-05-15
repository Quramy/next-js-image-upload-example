"use client";

import { useRef } from "react";

import { getPresignedUrlForUpload, postImage } from "./actions";
import { FileInput } from "./FileInput";

export function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      <FileInput thumbnailWidth={200} ref={fileInputRef} />
      <nav>
        <button type="submit">Upload</button>
      </nav>
    </form>
  );
}
