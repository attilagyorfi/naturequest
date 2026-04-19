# NatureQuest MVP Core Loop Design

Date: 2026-04-19
Status: Approved for implementation planning

## Context

The supplied product documents define NatureQuest as a gamified educational adventure platform for Hungarian children aged 10-16. The controlling scope document is `naturequest_build_spec_v1.docx`, which states that it overrides contradictions in earlier documents.

The current application is a Next.js 16.2.4 / React 19.2.4 app with Auth.js credentials auth, Prisma/PostgreSQL, seeded quests, quest listing/detail pages, quest completion, and a dashboard shell. The NatureQuest gameplay loop is not yet cohesive: the root page is still the default Next.js page, onboarding and character selection are missing, the dashboard is incomplete, the quest detail page is a content view rather than a player, and several Hungarian strings are visibly encoding-damaged.

This design focuses on the first playable MVP loop:

Register or log in -> complete onboarding -> choose a character class -> see a personalized dashboard -> start a recommended quest -> complete a short quest player flow -> receive XP/reward feedback -> return to dashboard.

## Goals

- Give a new user a coherent first-session experience within 2-3 minutes.
- Align the app with the MVP build spec's core loop without attempting the full platform data model.
- Keep implementation scoped to the existing app architecture.
- Replace affected broken Hungarian UI copy in the touched NatureQuest surfaces.
- Preserve Next.js 16 route conventions, especially async `params` in dynamic routes and route handlers.

## Non-Goals

- No full `Character`, `World`, `Zone`, `InventoryItem`, or `ItemDefinition` platform model in this slice.
- No GPS quests, social features, parent dashboard, admin content editor, or three-minigame system.
- No complete visual redesign of every surface.
- No monetization or email verification workflow.
- No unrelated module or project work.

## Recommended Approach

Use an experience-first vertical slice with a small data-model extension.

The existing `User`, `Profile`, `Quest`, `QuestStep`, `UserQuestProgress`, `Badge`, and `AchievementLog` models already support most of the first loop. Add only the profile fields needed to represent onboarding state:

- `characterName`
- `characterClass`
- `avatarPreset`
- `onboardingCompletedAt`

This keeps the MVP loop real and persistent while avoiding a large schema migration before the gameplay hypothesis is testable.

## User Flow

1. `/` becomes the NatureQuest gateway.
   - Authenticated users are sent toward `/dashboard`.
   - Guests see the NatureQuest premise and clear login/register actions.

2. Registration and login remain simple.
   - Registration creates the user and profile as today.
   - After login, users without completed onboarding are directed to `/onboarding`.

3. `/onboarding` introduces the player.
   - The user confirms a character name.
   - The user chooses one of three MVP classes: `hunter`, `explorer`, `chronicler`.
   - The user chooses one of six avatar presets.
   - On submit, the profile stores the character fields and completion timestamp.

4. `/dashboard` becomes the play hub.
   - If unauthenticated: redirect to `/login`.
   - If onboarding is incomplete: redirect to `/onboarding`.
   - Show character name, class, user points, level, completed quest count, badges, and recent activity.
   - Pick a recommended quest from the first published quest not yet completed.
   - The primary action is "Folytasd a kalandot" / start recommended quest.

5. `/quests` remains a browsable quest list.
   - Fix duplicated header content and broken Hungarian copy.
   - Show completion status when the user is signed in.

6. `/quests/[slug]` becomes a lightweight quest player.
   - Keep server-side quest loading.
   - Present quest steps as a guided sequence instead of a static list.
   - Include a simple multiple-choice checkpoint. For this slice, use a small hard-coded quiz map keyed by quest slug when the database does not yet contain structured questions.
   - Successful completion POSTs to `/api/quests/[slug]/complete`.
   - Reward feedback shows XP, total points, level, already-completed state, and newly awarded badges.

## Architecture

### Routes

- `app/page.tsx`: NatureQuest gateway.
- `app/onboarding/page.tsx`: server guarded onboarding entry.
- `app/dashboard/page.tsx`: personalized play hub.
- `app/quests/page.tsx`: quest catalog cleanup.
- `app/quests/[slug]/page.tsx`: quest player shell.
- `app/api/onboarding/route.ts`: persist onboarding choice.
- `app/api/quests/[slug]/complete/route.ts`: keep and polish existing completion behavior.

### Components

- `src/components/onboarding-form.tsx`: client form for class/avatar choice.
- `src/components/quest-player.tsx`: client guided quest flow and completion call.
- `src/components/reward-panel.tsx`: reusable reward state display.
- Existing auth forms stay in place, with touched Hungarian text fixed.

### Server and Data Access

- Use `auth()` in server routes/pages for session checks.
- Keep Prisma queries close to pages for this slice unless repeated logic becomes meaningful.
- Completion logic remains centralized in `src/lib/quest-completion.ts`.
- The onboarding endpoint validates input with Zod and only updates the current authenticated user's profile.

### Data Model

Extend `Profile` with nullable fields:

```prisma
characterName String?
characterClass String?
avatarPreset Int?
onboardingCompletedAt DateTime?
```

The accepted class values are validated in application code:

- `hunter`
- `explorer`
- `chronicler`

This avoids introducing an enum migration until the broader character system is built.

## Error Handling

- Unauthenticated protected pages redirect to `/login`.
- API mutations return 401 when there is no session.
- Invalid onboarding payload returns 400 with a Hungarian user-facing message.
- Missing user/profile after auth redirects to login or returns 404/500 depending on context.
- If there is no recommended quest, the dashboard shows a friendly empty state.
- Completing an already completed quest is treated as a successful, idempotent state, not an error.

## UX Direction

Use the MVP document and UX document as tone guides:

- "Storybook meets Premium Game", but keep this slice practical and readable.
- One dominant action per screen.
- Support short sessions: first XP should be reachable quickly.
- Avoid punitive language. Wrong quiz answers are learning moments.
- Use Hungarian copy as the default.
- Keep mobile layout usable from the start.

## Testing and Verification

Run at minimum:

- `corepack pnpm run lint`
- `corepack pnpm run build`
- `corepack pnpm run test:naturequest`

Manual verification:

- Guest opens `/` and can navigate to login/register.
- New user can register and log in.
- User without onboarding is redirected to `/onboarding`.
- User completes onboarding and lands on `/dashboard`.
- Dashboard shows character state and a recommended quest.
- User can open the quest player and complete the quest.
- Reward panel shows points/level and already-completed behavior on repeat completion.
- Existing NatureQuest tests continue passing.

## Implementation Boundaries

Do not rewrite unrelated files.
Do not refactor the entire visual system.
Do not introduce a separate backend service.
Do not stage or commit existing unrelated working tree changes when committing this design document.
