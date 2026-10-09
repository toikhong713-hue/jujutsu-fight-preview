# Jujutsu Fight v32 — Full-Cast Character Polish

Built from the complete v31 project, preserving the surface traversal and Maximum Output: Blue fixes.

## Included fixes
- **Surface traversal:** characters settle farther inside roof/branch platforms after climbing; brief held-Up suppression prevents unwanted immediate re-jumps.
- **Young Gojo, Maximum Output: Blue:** restores the custom stationary orb, attraction behavior, damage resolution, and fluid blue VFX.
- **Heian Sukuna, Kamutoke:** treats the move as a weapon attack rather than a generic guard, runs its intended action window, resolves its hit, and renders a visible lightning strike.
- **Sukuna / Yuji form:** separates their idle/guard silhouettes and identity details so the Yuji form does not inherit Sukuna-only face marks and pose cues.
- **Young Gojo and Toji:** adds clearer idle and guard silhouettes to better distinguish their combat stances.

The other characters, moves, and modes are retained. This is a targeted polish pass for confirmed problems, not a claim that every move has been visually playtested in a browser.

## Run
Keep the folder structure intact and open `index.html` in a modern browser.

## V33: Gojo Awakening + Hollow Purple polish
- Adds a short Limitless Awakening visual accent.
- Awakening strengthens Gojo's Blue pull, Red impact, and Hollow Purple while preserving costs/cooldowns.
- Adds converging Blue/Red charge orbs, spatial wake, and stronger Purple impact VFX using Canvas 2D.
- Keeps Young Gojo's Maximum Output: Blue and surface-traversal patches intact.

## V34: Character-specific locomotion + Heian Sukuna skill 7
- Replaces the shared generic WALK pose with distinct idle stances and gait profiles for Gojo, Young Gojo, Sukuna/Yuji form, Yuta, Hakari, Toji, Heian Sukuna, and The Strongest of Today.
- Character identity remains separated: calm Limitless movement, lighter Young Gojo footwork, Sukuna's prowling stride, Yuji's compact boxing step, Yuta's guarded sword stance, Hakari's loose bounce, Toji's forward predator sprint, Heian Sukuna's heavier four-arm stride, and The Strongest's restrained glide.
- Rebuilds Heian Sukuna's Skill 5 (P1 key 7 / P2 numpad 9, Hiten) into a weapon-draw, chamber, diagonal cross-cut, reverse sweep, follow-through, and recovery sequence instead of a single overhead slam.
- Also gives World-Cutting Slash (key 0 / P2 numpad slash) a clearer multi-phase four-arm spatial gesture and horizontal release pose.
- Adds lightweight Canvas 2D slash accents on Hiten's existing active frames. Existing damage, active windows, cost, cooldown and projectile logic are not changed.
- All effects remain vector/Canvas 2D; no external libraries or image assets added.

## v35: Anime clutch combat
- Perfect Guard now opens a timed follow-up counter window.
- The first attack during that window gains a modest damage boost and crisp impact effects.
- At 25% HP or lower, one stronger comeback counter can trigger every five seconds.
- Effects are event-driven and use the existing Canvas particle pool to limit load.