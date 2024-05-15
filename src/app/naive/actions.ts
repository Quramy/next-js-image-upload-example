"use server";

import uuid from "short-uuid";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { primsa } from "@/prisma";
import {
  getObject,
  getSignedURLForPutObject,
  putThumbnail,
  ensureObjectExistence,
} from "@/s3client";

export async function getPresignedUrlForUpload() {
  const objectId = uuid.generate();
  const url = await getSignedURLForPutObject(objectId);

  return {
    objectId,
    presignedURL: url,
  };
}

export async function postImage({ objectId }: { readonly objectId: string }) {
  const existence = await ensureObjectExistence(objectId);
  if (!existence) {
    return {
      succeeded: false,
    };
  }

  const inputBuf = await getObject(objectId);
  const outputBuf = await sharp(inputBuf)
    .rotate()
    .resize(200)
    .webp()
    .toBuffer();
  await putThumbnail(objectId, outputBuf);

  await primsa.image.create({
    data: {
      objectId,
    },
  });

  revalidatePath("/");
  return redirect("/");
}
