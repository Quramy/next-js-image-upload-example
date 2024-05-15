import { getSignedURLForGetObject } from "@/s3client";

async function Page({ params }: { params: { objectId: string } }) {
  const url = await getSignedURLForGetObject(params.objectId, "raw");
  return <img src={url} alt="" />;
}

export default Page;
