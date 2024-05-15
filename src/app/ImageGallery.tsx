import Link from "next/link";

import { primsa } from "@/prisma";
import { getSignedURLForGetObject } from "@/s3client";

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
      }))
    )
  );

  return (
    <ul>
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