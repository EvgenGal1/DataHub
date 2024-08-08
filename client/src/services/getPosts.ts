// req/res > posts
export const getAllPosts = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!response.ok) throw new Error("Невозможно получить сообщения.");

  return response.json();
};

export const getPostsBySearch = async (search: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?q=${search}`
  );

  if (!response.ok) throw new Error("Невозможно получить сообщения.");

  return response.json();
};
