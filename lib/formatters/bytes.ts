export const formatBytes = (size?: number | string | null) => {
  if (size === null || size === undefined || size === "") {
    return "Size unavailable";
  }

  const value = typeof size === "string" ? Number(size) : size;
  if (Number.isNaN(value)) {
    return "Size unavailable";
  }
  if (value === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const scaled = value / Math.pow(1024, power);
  return `${scaled.toFixed(scaled >= 10 || power === 0 ? 0 : 1)} ${
    units[power]
  }`;
};
