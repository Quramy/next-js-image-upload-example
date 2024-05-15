import { UploadForm } from "./UploadForm";
import { ImageGallery } from "./ImageGallery";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function Page() {
  return (
    <main className={styles.main}>
      <h3>Add new image</h3>
      <UploadForm />
      <h3>Uploaded images</h3>
      <ImageGallery />
    </main>
  );
}

export default Page;
