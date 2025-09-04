export type ModuleStatus = "active" | "coming-soon";

export interface AppModule {
  title: string;
  slug: string;
  description: string;
  image: string; // card image
  hero: string;  // hero image (WebP)
  status: ModuleStatus;
}
