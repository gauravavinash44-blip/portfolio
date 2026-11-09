Static web build of github.com/gauravavinash44-blip/drop-mode at commit 099a278e02147b5d455819dcbd7703f2c407edbe (built with `expo export --platform web`, repackaged by a script: relative paths, assets flattened into a/, unused icon fonts dropped). Do not edit by hand; rebuild from the source repo.

Audio (post-step after repackaging):
- Every audio module in s/index-*.js resolves through `window.__RS_SRC__("<name>.<md5>.mp3")`, defined in index.html.
- The six tracks of the main demo flow (all-black, bairan, aari-aari, didi-sher-e-baloch, jaiye-sajana, bandhu-2) play from same-origin clips in m/: VBR MP3 (~100 kbps), 0:00 to 40 s past the track's first Resonance moment (P1 in src/data/songs.ts), so playing from the top and starting at the moment both work with the app's own timings. All Black runs 0:00 to 1:00. 4.6 MB in total. A clip ends early, so the app moves to the next track; the P2/P3 moments of these six fall past the clip end.
- All other tracks stream their full masters from the hosted build of the same commit (drop-mode.vercel.app, or gauravavinash44-blip.github.io/drop-mode on GitHub Pages). Hosts that block outside media get no sound for those.
- The clips are cut from the masters already published in the public drop-mode repo (assets/audio). They are commercial recordings: fine for a personal, non-commercial portfolio demo in practice, but they are not licensed for redistribution.

Bridge (post-step, rs-bridge.js, loaded by index.html before the bundle; the bundle stays untouched):
- Follows the app's audio element and its player state (read from the app's React context) and posts `rs-now-playing` to the portfolio page (window.parent, same origin only). Takes `rs-control` back (play, pause, next, prev, seek). The board's Resonance card uses this as a mini player.
- Sets the Media Session (title, artist, artwork, position, play/pause/next/prev/seek) for OS media controls.
- Hosts that block outside resources: a cover that fails becomes a generated cover (gradient from the title, initials); a song that can't stream shows a short note and skips to the next song in the queue that can play here (the clips in m/), or settles to paused. Never a stuck "playing" at 0:00.
- Reads the song list from Metro module 1039 (SONGS) for cover titles; after a rebuild, check that id (it falls back to untitled covers if it moves).
