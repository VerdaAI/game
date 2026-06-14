# Verda Game — Protect or Pirate

Viral browser game demonstrating Verda's watermarking. Players pick Protector or Pirate roles.

## Stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS 3 + tailwindcss-animate
- PartyKit for multiplayer (TBD)
- Supabase for leaderboard (TBD)

## Design System
- Matches enterprise portal style (clean, engaging, dark theme)
- Colors: amber primary (#FFA62B), dark background (#17191A)
- Fonts: Urbanist (display), Host Grotesk (body)
- Use `font-display` for headings, default body font for text
- Protector color: amber (#FFA62B), Pirate color: purple (#C084FC)

## Conventions
- Components in `src/components/game/` for game-specific, `src/components/ui/` for shared
- Game logic in `src/lib/game/`
- All content images in `public/content/images/`
- Pre-cached decode results alongside content as JSON

## Content Pipeline
- Source images from `landing/public/demo/images_placeholder/`
- Watermark via enterprise comply API
- Generate variants with Sharp.js
- Decode all variants, use results to determine which manipulations appear in-game
