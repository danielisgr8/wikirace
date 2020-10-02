const getWikiTitle = async (page: string): Promise<string> => {
  const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=wikitext&formatversion=2&format=json&origin=*`,);
  return (await response.json()).parse.title;
};

const isSessionPath = () => ["/", "/end"].every(path => window.location.pathname !== path);

export { getWikiTitle, isSessionPath };
