# TSM Governed Automation Portfolio

Open index.html to begin the 16-step, read-only guided presentation. All required scripts and styles are included in assets. No installation, login, backend or runtime service is required. Keep the complete folder together. Publish only this folder's contents if separately authorized; no deployment has been performed.

Use NEXT and BACK or the left/right arrow keys. The timer is optional and starts only when clicked. Every step includes WHAT TO SAY. transcript.html contains all 16 steps and needs neither JavaScript nor audio. Technical Q&A opens separately without leaving the current step.

## What is demonstrated

- IMPLEMENTED LOCAL: browser navigation, timing, captions, optional speech, and deterministic synthetic technician guidance.
- SIMULATED SCENARIO: industrial input, risk, strategy, executive decision support and ticket context diagrams.
- PROTOTYPE WALKTHROUGH: Temporal orchestration, human review, mock publication and a synthetic receipt pattern. No workflow is started or signaled.
- ARCHITECTURE / SIMULATION: identity, document review, human approval and audit requirements. No documents, decisions or trusted audit records are created.

All figures are scripted examples, not measured financial results. No current enterprise data, customer documents, private memberships, credentials, provider endpoints or development tools are included. No fresh AI inference occurs. This is an independent portfolio and implies no enterprise sponsorship, access, endorsement or deployment. Production release remains ON HOLD.

## Optional ChromeOS narration

1. Read the English voice selector. If empty, click REFRESH VOICES and check installed English text-to-speech voices in the operating system's accessibility/speech settings.
2. LOCAL means the browser reports the voice as local. Voices labeled MAY USE NETWORK require manual selection and explicit consent before any speech. Consent is not saved and applies only to the selected voice in this page session.
3. Click TEST VOICE to check clarity and accent. The preferred en-US feminine-sounding voice is a name-based heuristic; the operating system supplies the actual voice. Voice availability differs by device.
4. Click PLAY NARRATED DEMO. Narration advances only after the current script finishes. PAUSE, RESUME, STOP, REPLAY, RESTART, MUTE and MANUAL MODE remain available. Eight minutes is a target, never a cutoff.
5. If audio is unavailable, use BACK/NEXT and read WHAT TO SAY or the text transcript.

Browser speech may be handled by an OS network service only after explicit consent to a network-capable voice. No external TTS API is integrated. External page requests remain blocked by its content security policy; local poster images and videos are allowed, and browser/OS speech operates separately. Native ChromeOS audio, native mobile layout and screen-reader acceptance still require a real-device check.

## Static hosting

The folder can be served as ordinary static HTML, JavaScript and CSS with relative paths. No server-side application, special rewrites or environment variables are required. Prefer HTTPS and preserve the page's restrictive content security policy. Disable directory listing, analytics injection and third-party scripts. Do not combine this folder with platform source or private documents. Static-host headers and actual browser rendering must be verified after an authorized preview; no hosted URL is claimed here.

## Recorded pilot demos

The home page includes Construction BPO and ServiceNow L1 recordings copied unchanged from `~/wt-hc-legal/html/demo/v2/`, with posters extracted at 12 seconds, two-sentence captions and inline native playback controls. Both are synthetic local walkthroughs; the Healthcare card links to the November 17 verified synthetic workflow and Presenter Companion; its replacement recording remains pending. “Request a pilot” opens an email to torreyw94@tsmatter.com. The public website is https://tsmatter.com (served from `docs/`).

Chromium verification at 1280 and 390 px: 37 checks passed, including real playback advancement for both videos at each width, posters, no horizontal overflow, placeholder limits and existing next-step navigation. Both layouts were visually inspected; zero page errors, console/CSP errors or external asset requests.

## Pilot apps portfolio

The public pilot pages (marketing page, one-page summary and narrated demo for each app) are published with the website at `docs/portfolio/` (https://tsmatter.com/portfolio/). Internal tools (presenter scripts, operating manuals, weekly report, capacity planner, scorecard) are kept private and are not in this repository.


## Healthcare workflow update — November 17, 2026

Status: **Synthetic workflow verified; pilot acceptance pending.** The Healthcare and Office Manager entries, summaries, home/catalog captions, [Presenter Companion](docs/portfolio/healthcare-presenter.html) and [readiness record](docs/portfolio/healthcare-readiness.html) reflect the user-run browser acceptance reviewed in ChatGPT after PR #91 / Fly v3828. Synthetic fixture values are Billing $340 and combined $22,420. The accepted artifact is `tsm-client-package-1794942277839.json`; its bytes and the hosted cleanup backup are not in this repository. See the readiness record for attribution and remaining gaps.

The new Healthcare companion contains only public-safe synthetic presentation guidance. It does not replace or publish the original private presenter scripts, operations manuals or internal planning tools, which remain unavailable here. The existing Healthcare videos/posters are retained unchanged and labeled earlier standalone walkthroughs; they are not recordings of the accepted OM export journey. Replacement capture and timed captions remain pending. No portfolio publication/deployment is performed by this local update.

### Local validation for this update

`node scripts/verify-healthcare-portfolio.cjs` runs local-only checks with Playwright (available through Node module resolution). Set `PORTFOLIO_CHROME` when using an existing Chromium executable and `PORTFOLIO_EVIDENCE_DIR` to choose the screenshot/result directory. No app state is written and live browser acceptance is not re-run.

November 17 validation: **1,404 checks passed** across 10 pages × 1280/390 px × light/dark mode (40 rendered layouts). All checked local links/anchors resolved, no horizontal overflow or uncaught page errors occurred, and existing inline CSS matched source commit `368150ec`. Six actual local portfolio screenshots were captured; desktop Healthcare and mobile Companion captures were visually reviewed. The released Billing, OM Portal and Executive links each returned HTTP 200 (link reachability only, not a signed-in acceptance check). The supplied GitHub Pages URL redirects to `https://tsmatter.com/`, consistent with `docs/CNAME`; Pages serves `main:/docs`.

The automated checks and local portfolio captures are independent of the attributed November 17 user-run app acceptance. Existing videos/posters are byte-unchanged. Fresh signed-in workflow screenshots, a replacement end-to-end recording and synchronized captions still need capture; the original private presenter files were not accessible. The public-safe Healthcare Companion and readiness pages here are newly added and do not claim to update those private files.
