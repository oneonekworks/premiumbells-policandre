# Backlog

Parked tasks with ready-to-use prompts. Move an item to the migration status
change log when it is done.

## Studio: make form tabs and primary actions stand out (parked 2026-10-25)

**Why:** in the deployed Studio (<https://premiumbells.sanity.studio>) the
project form's section tabs ("All fields", "1. Informații", "2. Fotografii",
"3. Video și detalii", "4. SEO") and primary actions such as Publish are faint
and easy to miss in Sanity's minimal design, especially on a phone.

**Prompt:**

> In the standalone Sanity Studio `../studio-premiumbells` (Sanity 6.20,
> `@sanity/ui` 4, deployed with `npx sanity deploy` to premiumbells.sanity.studio;
> host and app ID are in `sanity.cli.ts`), make the document form tabs and
> primary actions easier to see, using only supported Studio APIs:
>
> 1. Add an icon to every field group (`groups[].icon`, `FieldGroupDefinition`
>    in `@sanity/types`) in `schemaTypes/project.ts`, and add groups with icons
>    where useful in `workCategory` and `portfolioPage`. Use `@sanity/icons`
>    per-icon imports (e.g. `@sanity/icons/InfoOutline`, `Images`, `Play`,
>    `Search`) consistent with the existing schema icons.
> 2. Add a brand theme in `sanity.config.ts` with `buildLegacyTheme` from
>    `sanity` (confirm its signature in `node_modules/sanity/lib/*.d.ts` first),
>    using the website tokens from `../rbells_policandre/app/globals.css`:
>    primary/brand teal `#0f6b63` (dark `#0e3a36`), ink `#16201f`, paper
>    `#fbfaf6`, gold `#b38b4d` for focus if supported. Check contrast in both
>    light and dark Studio modes and that the selected tab, the Publish button,
>    validation markers (red), and the language filter remain clear.
> 3. Check whether the automatic "All fields" tab can be hidden through a
>    supported option; keep it if not (it helps find validation errors).
>
> Constraints: no custom CSS or DOM overrides of Sanity internals (class names
> are unstable and the Studio auto-updates); keep all labels Romanian; do not
> change field names or data. Run `npm run typecheck`, `npm run lint`,
> `npm test`, and `npm run build`, then redeploy and ask the user to review on
> desktop and phone (signing in is required, so the user verifies visually).
> Record the change in `../rbells_policandre/docs/migration-status.md` and
> remove this item from `docs/backlog.md`.
