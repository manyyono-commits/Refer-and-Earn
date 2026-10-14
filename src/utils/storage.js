// Safe wrappers: storage can throw in private mode or when the quota is full.
export const readStorage = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeStorage = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy errors */
  }
};

export const clearByPrefix = (storage, prefix) => {
  try {
    Object.keys(storage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => storage.removeItem(key));
  } catch {
    /* ignore */
  }
};
