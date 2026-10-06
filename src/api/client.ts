const API = import.meta.env.BASE_URL + "api";
const workspaceKey = "boxaio_demo_workspace";
export function workspaceId() {
  let id = localStorage.getItem(workspaceKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(workspaceKey, id);
  }
  return id;
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (import.meta.env.VITE_DATA_MODE !== 'api') {
    const { staticApi } = await import('./static-demo');
    return staticApi<T>(path, options);
  }
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Demo-Workspace": workspaceId(),
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(15000),
  });
  const body = await response
    .json()
    .catch(() => ({ error: "The backend returned an invalid response." }));
  if (!response.ok) throw Error(body.error || "Backend request failed.");
  return body;
}
export function post<T>(path: string, body: unknown, headers: Record<string, string> = {}) {
  return api<T>(path, { method: "POST", headers, body: JSON.stringify(body) });
}
