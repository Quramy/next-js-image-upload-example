import Link from "next/link";

import { primsa } from "@/prisma";
import { getSignedURLForGetObject } from "@/s3client";

import styles from "./ImageGallery.module.css";

export async function ImageGallery() {
  const images = await primsa.image.findMany({
    select: {
      objectId: true,
    },
    take: 20,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const imageItems = await Promise.all(
    images.map(({ objectId }) =>
      getSignedURLForGetObject(objectId, "thumbnail").then((url) => ({
        objectId,
        url,
      })),
    ),
  );

  return (
    <ul className={styles.list}>
      {imageItems.map(({ url, objectId }) => (
        <li key={objectId}>
          <Link href={`/image/${objectId}`}>
            <img src={url} alt="" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
