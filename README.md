# Jujutsu Fight v36 — Modern Roster VFX Overhaul

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


## v36: Modern art VFX overhaul across the full roster
- Adds character-specific vector signature effects for Gojo, Young Gojo, Sukuna/Yuji form, Yuta, Hakari, Toji, Heian Sukuna, and The Strongest of Today.
- Skill charge and active frames gain different shapes by technique: Limitless geometry, crimson slash marks, kinetic Black Flash focus, Rika/speech portals, jackpot roulette arcs, steel speed cuts, healing rings, flame spikes, and domain sigils.
- Adds cleaner character-specific melee trails and more distinct hit, block, guard, parry, and counter impacts.
- Uses Canvas 2D lines, arcs, rings, diamonds, and small event-driven spark bursts. No external libraries, large textures, fullscreen blur, or always-on high-density particles.
- VFX design principles were informed by [Riot's visual-effects guidance](https://www.riotgames.com/vi/artedu/visual-effects) and [League's VFX Style Guide](https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/): value, color, shape, timing, gameplay clarity and low clutter. Performance choices also follow [Epic's VFX optimization guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/vfx-optimization-guide?application_version=4.27) and [Unity's graphics optimization advice](https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/optimizing-graphics-performance), especially reducing overdraw and transparent screen coverage.
- Existing damage, hitboxes, frame data, move costs and cooldowns are unchanged by this visual-only pass.


## v37: optional PixiJS VFX prototype
- Adds a transparent PixiJS 8.22.0 WebGL overlay for selected signature effects and projectiles.
- Keeps the original Canvas 2D gameplay/render path unchanged.
- Uses 1x resolution, small local effects, bounded projectile details, and a small custom GLSL distortion pass when supported.
- Automatically falls back to a lightweight Canvas 2D overlay if the PixiJS CDN, WebGL, or custom filter fails.
- In Training, a small diagnostic label reports the active renderer and recent CPU-side render cost.
- Requires an internet connection to load PixiJS from jsDelivr for the WebGL prototype; gameplay still works if it fails.

Reference: PixiJS 8 documentation on Application initialization, custom filters, and particle rendering; WebGL support is not a guarantee of improved performance on software-rendered or legacy systems.