// The name a guest typed last time on this device, so claiming three things
// means typing it once. Per-device convenience only: storage can be blocked
// (private mode, cleared site data), so every access is guarded and the app
// works the same without it. Browser only.
const NAME_KEY = "potluck:name";

export function readSavedName(): string {
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveName(name: string) {
  try {
    window.localStorage.setItem(NAME_KEY, name.trim());
  } catch {
    // Storage unavailable; nothing to do.
  }
}
