import Link from "next/link";

export default function Aboutlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="aboutlayout">About_layout</h1>
      <ul>
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
