import type { ContentItem, ContentVariant, DecodeResult } from "./types";

// Placeholder content for solo demo
// In production, these will be replaced with actual watermarked images + real decode results
const DEMO_IMAGES: ContentItem[] = [
  {
    id: "demo-01",
    imageUrl: "/content/images/demo-01.jpg",
    author: "Sarah Chen",
    caption: "Golden hour at the coast",
    uid: 847291,
  },
  {
    id: "demo-02",
    imageUrl: "/content/images/demo-02.jpg",
    author: "Marcus Rivera",
    caption: "Street photography downtown",
    uid: 193847,
  },
  {
    id: "demo-03",
    imageUrl: "/content/images/demo-03.jpg",
    author: "Aisha Patel",
    caption: "Morning light in the studio",
    uid: 572910,
  },
  {
    id: "demo-04",
    imageUrl: "/content/images/demo-04.jpg",
    author: "James Okafor",
    caption: "Architecture at dusk",
    uid: 384712,
  },
];

// Simulated decode results for demo mode
// These will be replaced with real pre-cached results from the codec pipeline
function makeDemoDecodeResult(
  intensity: "light" | "medium" | "heavy",
  uid: number
): DecodeResult {
  const confidenceMap = { light: 0.97, medium: 0.89, heavy: 0.73 };
  return {
    match: true,
    confidence: confidenceMap[intensity] + (Math.random() * 0.05 - 0.025),
    uid,
  };
}

function makeDemoVariants(item: ContentItem): ContentVariant[] {
  const categories = ["crop", "filter", "resize", "screenshot", "convert"] as const;
  const intensities = ["light", "medium", "heavy"] as const;
  const variants: ContentVariant[] = [];

  for (const category of categories) {
    for (const intensity of intensities) {
      variants.push({
        contentId: item.id,
        category,
        intensity,
        // In demo mode, just show the original image (no real manipulation)
        imageUrl: item.imageUrl,
        decodeResult: makeDemoDecodeResult(intensity, item.uid),
      });
    }
  }

  return variants;
}

export function getDemoContent() {
  const variants: Record<string, ContentVariant[]> = {};
  for (const item of DEMO_IMAGES) {
    variants[item.id] = makeDemoVariants(item);
  }
  return { images: DEMO_IMAGES, variants };
}

export function getDemoVariant(
  contentId: string,
  category: string,
  intensity: string
): ContentVariant | undefined {
  const { variants } = getDemoContent();
  const itemVariants = variants[contentId];
  if (!itemVariants) return undefined;
  return itemVariants.find(
    (v) => v.category === category && v.intensity === intensity
  );
}
