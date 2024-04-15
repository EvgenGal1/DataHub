"use client";

// в парам.err как объ.Err
export default function ErrorWrapper({ error }: { error: Error }) {
  return <h1>ErOrOr!!! ошб. - {error.message}</h1>;
}
