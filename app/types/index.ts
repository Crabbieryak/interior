// types/index.ts
export type RoomStyle = "Modern" | "Minimalist" | "Scandinavian" | "Industrial" | "Traditional" | "Mediterranean" | "Bohemian";
export type InstallationSurface = "Floor" | "Wall" | "Ceiling" | "Countertop" | "Backsplash";
export type RoomType = "Living Room" | "Bathroom" | "Kitchen" | "Bedroom" | "Office" | "Entryway";

export interface GenerateRequest {
  image: string;
  roomType: RoomType;
  roomStyle: RoomStyle;
  installationSurface: InstallationSurface;
}

export interface GenerateResponse {
  output: string;
  note?: string;
  error?: string;
}