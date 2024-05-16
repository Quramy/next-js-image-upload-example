"use server";

import uuid from "short-uuid";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { primsa } from "@/prisma";
import {
  getImageObject,
  getSignedURLForPutObject,
  putImageObject,
  ensureObjectExistence,
} from "@/s3client";

async function createThumbnail(
  objectId: string,
  inputBuf: Buffer | ArrayBuffer,
) {
  const outputBuf = await sharp(inputBuf)
    .rotate()
    .resize(200)
    .webp()
    .toBuffer();
  await putImageObject(objectId, "thumbnail", "image/webp", outputBuf);
}

export async function getPresignedUrlForUpload() {
  const objectId = uuid.generate();
  const url = await getSignedURLForPutObject(objectId);

  return {
    objectId,
    presignedURL: url,
  };
}

export type CreateImageState = {
  readonly succeeded: boolean;
  readonly errorMessages: string[];
  readonly latestUploadedObjectId: string | undefined;
};

export async function createImage(
  prevState: CreateImageState,
  formData: FormData,
): Promise<CreateImageState> {
  const generatedId = formData.get("generatedId") as string | null;

  let objectId: string;
  if (!generatedId) {
    const imageFile = formData.get("imageFile") as File | null;
    if (!imageFile || !imageFile.size) {
      return {
        ...prevState,
        succeeded: false,
        errorMessages: ["Select file."],
      };
    }

    objectId = uuid.generate();
    const inputBuf = new Buffer(await imageFile.arrayBuffer());

    await Promise.all([
      putImageObject(objectId, "raw", imageFile.type, inputBuf),
      createThumbnail(objectId, inputBuf),
    ]);
  } else {
    objectId = generatedId;
    const existence = await ensureObjectExistence(objectId);
    if (!existence) {
      return {
        ...prevState,
        succeeded: false,
        errorMessages: ["Something went wrong."],
      };
    }

    const inputBuf = await getImageObject(objectId);
    await createThumbnail(objectId, inputBuf);
  }

  await primsa.image.create({
    data: {
      objectId,
    },
  });

  revalidatePath("/naive");

  return {
    succeeded: true,
    latestUploadedObjectId: objectId,
    errorMessages: [],
  };
}
