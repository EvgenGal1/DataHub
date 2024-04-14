// динамич.стр.с парам.

// тип парам.
type Props = { params: { /* по назв.[п.] */ id: string } };

export default function Post({ params: { id } }: Props) {
  return <div>Post page {id}</div>;
}
