# TSM Executive Guided Demo — prerecorded portfolio

Open index.html with the complete assets folder alongside it. This static, read-only portfolio includes sixteen synthetic presentation steps, the exact WHAT TO SAY captions, a separate technical Q&A and a text transcript. It needs no backend, login, OS speech voice, cloud TTS service or application-provider connection.

## Playback

Click PLAY NARRATED DEMO explicitly. The single persistent HTML audio element plays the MP3 for the displayed step. It advances only after the current clip ends. PAUSE and RESUME preserve position; STOP rewinds the current clip. REPLAY repeats it, RESTART returns to Step 1, and MUTE changes sound without replaying.

BACK, NEXT, arrow-key navigation and MANUAL MODE stop audio. Changing a step never automatically starts the newly selected clip. WHAT TO SAY and manual navigation remain available if playback is blocked or a file is missing. Click RETRY PLAY after checking browser/site audio settings, or continue manually. A hidden tab or open technical Q&A pauses playback and requires an explicit resume.

The player controls are accessible buttons around a persistent HTMLAudioElement; it does not depend on browser speechSynthesis. Captions are complete per-step scripts, not word-level timed subtitles. The transcript works without JavaScript and links directly to each MP3.

The sixteen clips contain approximately 4 minutes 20 seconds of speech. The eight-minute presentation budget includes presenter pauses and discussion; it is a target, not an audio-duration guarantee. Narration is never cut off to force a duration. The elapsed clock counts actual playback time and excludes loading, buffering and pauses. Presentation progress is not an operational completion or audit record.

## Demonstration boundaries

IMPLEMENTED LOCAL means working browser navigation, timing and deterministic synthetic technician guidance. SIMULATED SCENARIO means scripted industrial and ticket examples. PROTOTYPE WALKTHROUGH means orchestration contract diagrams, not an observed workflow execution. ARCHITECTURE / SIMULATION describes governance, human approval and audit requirements, not actual authorizations or receipts.

All demonstration data is synthetic. Financial figures are illustrative assumptions, not measured losses, savings, predictions or ROI. No fresh AI inference occurs during playback. No operational actions, private documents, enterprise sponsorship or system access are implied. Production release remains ON HOLD.

## Audio provenance

All clips use the same locally generated Piper LJSpeech Medium voice, fixed synthesis settings and MP3 encoding. Step 1 is the approved original audio, reused without re-encoding. The other fifteen clips were synthesized from the unchanged captions. The voice creator identifies the model as US English female speech; listener assessment of pronunciation and naturalness is separate from technical file verification. See NARRATION-LICENSE.md.

## Static hosting

Keep every relative asset path intact. Only this folder belongs on a static host; do not publish tools, models, generation inputs, WAV masters, evidence or the platform repository. Serve HTML, JavaScript, CSS and MP3 with their correct content types. MP3 requests are same-site static media requests. The page permits media-src 'self' and retains connect-src 'none'. No analytics, external fonts, provider calls or remote TTS should be added.

No publication has been performed by this preparation. Native ChromeOS Guest audio, desktop/mobile rendering, assistive technology and target-host acceptance remain separate checks before a polished public review. Manual text mode remains available without audio.
