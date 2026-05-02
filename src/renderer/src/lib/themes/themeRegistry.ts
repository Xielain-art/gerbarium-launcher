export const THEME_REGISTRY = [
  { id: "violet-base", className: "theme-violet-base", translationKey: "violetBase", fallbackLabel: "Violet Base" },
  { id: "oxide", className: "theme-oxide", translationKey: "oxide", fallbackLabel: "Oxide" },
  { id: "mint-fog", className: "theme-mint-fog", translationKey: "mintFog", fallbackLabel: "Mint Fog" },
  { id: "candy-pop", className: "theme-candy-pop", translationKey: "candyPop", fallbackLabel: "Candy Pop" },
  { id: "sage-paper", className: "theme-sage-paper", translationKey: "sagePaper", fallbackLabel: "Sage Paper" },
  { id: "pop-contrast", className: "theme-pop-contrast", translationKey: "popContrast", fallbackLabel: "Pop Contrast" },
] as const;

export type ThemeId = (typeof THEME_REGISTRY)[number]["id"];

export const THEME_CLASSNAMES = THEME_REGISTRY.map((theme) => theme.className);
