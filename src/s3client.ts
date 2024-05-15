import { S3 } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const bucketName = process.env.IMAGE_BUCKET_NAME;

function getS3Client() {
  const client = new S3({
    region: process.env.IMAGE_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.IMAGE_BUCKET_ACCESS_KEY_ID!,
      secretAccessKey: process.env.IMAGE_BUCKET_SECRET_ACCESS_KEY!,
    },
    endpoint: process.env.IMAGE_BUCKET_EP!,
    forcePathStyle: true,
  });

  return client;
}

export async function ensureObjectExistence(objectId: string) {
  const s3client = getS3Client();
  try {
    const res = await s3client.headObject({
      Bucket: bucketName,
      Key: `images/${objectId}/raw`,
    });
    return res.ContentLength != null;
  } catch {
    return false;
  }
}

export async function getObject(objectId: string) {
  const s3client = getS3Client();
  const res = await s3client.getObject({
    Bucket: bucketName,
    Key: `images/${objectId}/raw`,
  });
  if (!res.Body) throw new Error("no object");
  return res.Body.transformToByteArray();
}

export async function putThumbnail(objectId: string, buf: Buffer) {
  const s3client = getS3Client();
  await s3client.putObject({
    Bucket: bucketName,
    Key: `images/${objectId}/thumbnail`,
    Body: buf,
    ContentType: "image/webp",
  });
}

export async function getSignedURLForGetObject(
  objectId: string,
  type: "thumbnail" | "raw" = "thumbnail"
) {
  const s3client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `images/${objectId}/${type}`,
  });

  const url = await getSignedUrl(s3client, command, {
    expiresIn: 600,
  });

  return url;
}

export async function getSignedURLForPutObject(objectId: string) {
  const s3client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `images/${objectId}/raw`,
  });

  const url = await getSignedUrl(s3client, command, {
    expiresIn: 60,
  });

  return url;
}
