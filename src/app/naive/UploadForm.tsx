"use client";

import { useState, useEffect, Fragment, type ChangeEvent } from "react";
import { useFormState as useActionState } from "react-dom";

import { getPresignedUrlForUpload, createImage } from "./actions";
import { FileInput } from "./FileInput";

export function UploadForm() {
  const [{ errorMessages, latestUploadedObjectId }, createImageAction] =
    useActionState(createImage, {
      succeeded: true,
      latestUploadedObjectId: undefined,
      errorMessages: [],
    });

  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length !== 1) return;
    const body = event.target.files[0];
    const { objectId, presignedURL } = await getPresignedUrlForUpload();
    await fetch(presignedURL, { method: "PUT", body });
    setGeneratedId(objectId);
  };

  useEffect(() => {
    setGeneratedId(null);
  }, [latestUploadedObjectId]);

  return (
    <form action={createImageAction}>
      {errorMessages.length > 0 && (
        <div role="alert">
          {errorMessages.map((msg) => (
            <p>{msg}</p>
          ))}
        </div>
      )}
      <Fragment key={latestUploadedObjectId ?? "initial"}>
        <FileInput
          name={generatedId ? undefined : "imageFile"}
          thumbnailWidth={200}
          onChange={handleFileChange}
        />
        {generatedId && (
          <input type="hidden" name="generatedId" value={generatedId} />
        )}
      </Fragment>
      <nav>
        <button type="submit" disabled={!generatedId}>
          Submit
        </button>
      </nav>
    </form>
  );
}
