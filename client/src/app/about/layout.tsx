import Link from "next/link";

export default function Aboutlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("5.00 Aboutlayout ", 5.0);
  return (
    <div>
      <h1 className="block text-center">About_layout</h1>
      <ul className="list-disc ml-5">
        <li>
          <Link href="/about/">About</Link>
        </li>
        <li>
          <Link href="/about/contacts">Contacts</Link>
        </li>
        <li>
          <Link href="/about/team">Team</Link>
        </li>
      </ul>
      {children}
    </div>
  );
}
