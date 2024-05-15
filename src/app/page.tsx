import Link from "next/link";

export default function Page() {
  return (
    <main>
      <ul>
        <li>
          <Link href="/naive">Naive implementation</Link>
        </li>
      </ul>
    </main>
  );
}
