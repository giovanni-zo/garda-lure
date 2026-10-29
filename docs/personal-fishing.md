# Personal fishing · v10

## My Tackle Box

Each entry identifies an exact catalog profile (including the plastic/rig
combination and size), color key, and quantity. Duplicate entries merge;
editing, removal and undo keep that identity. Optional owned-only ranking
filters the existing practical candidates, preserving rod, reach and depth
constraints. It shows a color actually owned for that exact profile. An empty
or unsuitable box never silently substitutes unowned equipment. Switching
back to all lures is explicit.

The original scenario color recommendation stays intact. When necessary,
`chooseAvailable` prefers its existing alternative, then a nearby available
palette using color and functional family. This is a color-matching heuristic;
it does not claim new catch-probability accuracy or change the lure scores.

The palette grew from 14 to 40 named colorways. Family-specific choices avoid
putting metal finishes on worms. Red heads, chartreuse tails, spots, glitter
and trout stripes are rendered in source-image coordinates. The same selected
color reaches detail images, mounted cutaways, retrieve scenes and PNG cards.
Palette filters are installed as needed rather than prebuilding every
palette/image combination. Existing low-poly assets are reused.

## Catches, cards and earned progress

Catch recording needs a species and date. Length, lure and photo are optional.
Selecting no lure cannot earn a technique milestone. From a lure detail or
owned entry, the chosen profile/color is prefilled. Editing retains identity;
personal bests, species cards and 12 milestones are derived from the current
records and recalculate on deletion or undo. Different plastics on the same
rig count as one technique. No example catches or earned rewards are seeded.

Each catch has an HTML preview and a downloadable 1080 × 1350 PNG. Optional
native sharing uses the generated file; unsupported sharing falls back to a
download. Canceling the native sheet does not report an error. SVG artwork is
rasterized with embedded local PNGs and only the palette filter it needs,
without foreignObject or a rendering service. A record's zone appears on a
shared card only when explicitly enabled.

## Storage and recovery

Versioned metadata uses localStorage (`garda-personal-v1`). Photos use the
separate IndexedDB photo store and are resized/reencoded in the browser,
removing original file metadata. These records are device/browser-local;
there is no account or cross-device sync. No catch/photo data is sent to
GitHub or another service.

Writes validate a complete next snapshot before replacing in-memory state.
Quota failures leave the previous state intact. Concurrent-tab writes are
rejected until reload. Backup JSON includes available photos; missing photos
are omitted from the exported copy without changing the live records.
Restore validates the full schema, imports photos under new IDs, and commits
metadata only after the photo writes succeed. Failure removes the staged
photos, preserving the existing metadata and photographs. A changed state
while a restore is running aborts the restore. Both backup directions have a
100 MB limit. Corrupt saved metadata remains exportable and is not silently
overwritten.

## Validation

`tests/personal.mjs` covers color availability, exact ownership, quantity
merging, reload persistence, storage failure, concurrent writes, validation,
backup round trips, editing/deletion/undo, personal bests and earned progress.
Existing recommendation, Garda scenario and rig guide suites remain in use.
Browser checks use a separate local origin with test-only inventory/catches.
