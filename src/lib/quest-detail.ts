export function formatDurationLabel(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} mp`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds === 0) {
    return `${minutes} perc`;
  }

  return `${minutes} perc ${seconds} mp`;
}

export function resolveLocalAssetPath(
  originalPath: string,
  existingFiles: ReadonlySet<string>
): string {
  if (existingFiles.has(originalPath)) {
    return originalPath;
  }

  const dotIndex = originalPath.lastIndexOf(".");
  const pathWithoutExtension =
    dotIndex === -1 ? originalPath : originalPath.slice(0, dotIndex);
  const supportedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

  for (const extension of supportedExtensions) {
    const candidate = `${pathWithoutExtension}${extension}`;
    if (existingFiles.has(candidate)) {
      return candidate;
    }
  }

  return originalPath;
}
