// req/res > posts (доступные, фейк БД)

// получить всё
export const getAllPosts = async () => {
  // const response = await fetch();
  const response = await fetch(
    // ^ общ.доступные url
    // "https://jsonplaceholder.typicode.com/posts"
    // ^ статич.данн.фейк БД
    "api/posts"
  );

  if (!response.ok) throw new Error("Невозможно получить сообщения.");

  return response.json();
};

// поиск
export const getPostsBySearch = async (search: string) => {
  const response = await fetch(
    // ^ общ.доступные url
    // `https://jsonplaceholder.typicode.com/posts?q=${search}`
    // ^ статич.данн.фейк БД на общ.GET
    // `api/posts?q=${search}`
    // ^ статич.данн.фейк БД на отд.URL/п. search + кодир.URI
    `api/posts/search?q=${encodeURIComponent(search)}`
  );

  if (!response.ok) throw new Error("Невозможно получить сообщения.");

  return response.json();
};
