export const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export function appPath(pathname: string) {
  return pathname === APP_BASE
    ? "/"
    : pathname.startsWith(APP_BASE + "/")
      ? pathname.slice(APP_BASE.length)
      : pathname;
}
