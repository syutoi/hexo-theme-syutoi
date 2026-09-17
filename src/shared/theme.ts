export const THEME_STORAGE_KEY = 'syutoi.theme';
export type ThemePreference = 'light' | 'dark' | 'auto';
export type ResolvedTheme = Exclude<ThemePreference, 'auto'>;

export function parsePreference(value: string | null | undefined): ThemePreference | undefined {
  return value === 'light' || value === 'dark' || value === 'auto' ? value : undefined;
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  return preference === 'auto' ? (prefersDark ? 'dark' : 'light') : preference;
}

export function nextPreference(preference: ThemePreference): ThemePreference {
  return preference === 'auto' ? 'light' : preference === 'light' ? 'dark' : 'auto';
}

export function readPreference(
  read: (key: string) => string | null,
  fallback: ThemePreference
): ThemePreference {
  try {
    return parsePreference(read(THEME_STORAGE_KEY)) ?? parsePreference(read('theme')) ?? fallback;
  } catch {
    return fallback;
  }
}
