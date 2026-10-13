export const URL_KEY = "timecraft:playlist-url";
export const COLLAPSED_KEY = "timecraft:playlist-collapsed";
export const VOLUME_KEY = "timecraft:playlist-volume";
export const EXPANDED_KEY = "timecraft:playlist-expanded";
export const LIBRARY_KEY = "timecraft:playlist-library";

export type SourceKind = "playlist" | "video";

export type ParsedSource = {
  kind: SourceKind;
  url: string;
  id: string;
};

export type SavedSource = {
  id: string;
  url: string;
  title: string;
  kind: SourceKind;
};
