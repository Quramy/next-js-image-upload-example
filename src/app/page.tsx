export const dynamic = "force-dynamic";
export const revalidate = 0;

import { UploadForm } from "./UploadForm";
import { ImageGallery } from "./ImageGallery";

async function Page() {
  return (
    <>
      <UploadForm />
      <ImageGallery />
    </>
  );
}

export default Page;
