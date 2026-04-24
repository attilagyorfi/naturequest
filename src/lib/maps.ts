export function buildQuestMapQuery(title: string, locationHint: string | null) {
  const parts = [title, locationHint, "Hungary"].filter(Boolean);
  return parts.join(", ");
}

export function buildGoogleMapsEmbedUrl(
  query: string,
  apiKey: string | undefined
) {
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    maptype: "roadmap",
    language: "hu",
    region: "HU",
  });

  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

export function buildGoogleMapsSearchUrl(query: string) {
  const params = new URLSearchParams({
    api: "1",
    query,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}
