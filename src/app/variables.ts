const rawPublicPath = process.env.PUBLIC_URL || "/";

const normalizePublicPath = (path: string) => {
  if (path === "/") {
    return "/";
  }

  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  return trimmedPath ? `/${trimmedPath}` : "/";
};

// Browser location paths are URI-encoded, so the router basename needs to use
// the encoded representation as well for non-ASCII subpaths.
export const PUBLIC_PATH = encodeURI(normalizePublicPath(rawPublicPath));
export const SPARQL_ENDPOINT = process.env.REACT_APP_SPARQL_ENDPOINT;
export const SINGLE_VOCABULARY_MODE =
  process.env.REACT_APP_SINGLE_VOCABULARY_MODE;
