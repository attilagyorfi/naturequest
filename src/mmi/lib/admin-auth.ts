const ADMIN_EMAIL =
  process.env.MMI_ADMIN_EMAIL ?? "adobeallapps.mmernoki@gmail.com";
const ADMIN_PASSWORD = process.env.MMI_ADMIN_PASSWORD ?? "Szigmax355";

export function isAuthorized(request: Request): boolean {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(authorization.slice("Basic ".length), "base64").toString(
    "utf8",
  );
  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return false;
  }

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  return username === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
