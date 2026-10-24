# Rebuild brief

**Decision baseline:** 2026-10-10  
**Status:** Agreed product direction; external setup and launch gates remain open.

This brief supersedes older planning assumptions where they conflict. It does
not authorize account creation, paid services, imports, commits, or deployment.

## Purpose and audience

Premium Bells / policandre.ro is a presentational catalogue and portfolio, not
an online store. Primary markets are Romania and Moldova. Visitors should be
able to discover services, inspect models and completed installations, and
contact the business with a useful enquiry. No public prices.

Priority services are policandre, clopote, recondiționare policandre, and bell
automation/electronic systems. Distinguish physical bell actuation, electronic
bell-sound reproduction, and interior/exterior church sound reinforcement.
Some equipment supports more than one function; verify claims per model.
Iconostases, doors, clocks, and related offerings remain in scope for review.

Catalogue models and completed projects are distinct content types, linked to
each other and relevant services. Retain useful reference codes, dimensions,
materials, finishes, and technical specifications without prices.

## Languages and SEO

- Romanian is primary; Romanian and reviewed English content are the launch
  target following the user's updated language requirement.
- Prepare for Greek and additional languages without implementing them now.
- Share media and language-independent technical facts; translate visible copy,
  navigation, image descriptions, and SEO fields. Translation storage strategy
  and locale URL conventions still require a technical design decision.
- Preserve useful Romanian URLs. `/en/` and future `/el/` are proposals, not an
  approved route map. Account for existing nested service routes.
- Publish only ready translations; do not create empty indexed locale pages.
  Use self-canonicals and hreflang for published equivalents.
- SEO starts with URL/content architecture, not a final polish phase. Capture
  Search Console/Analytics baseline before URL changes; map old to new URLs,
  preserve valuable pages, and use relevant permanent redirects.
- Measure qualified enquiries and organic visibility; no ranking guarantees.

The user has Search Console, Analytics, and domain/DNS access. No access or
exports have been supplied yet. Prefer exports or least-privilege invitations;
never request passwords in chat.

## Bespoke but bounded design

Substantially refine the existing identity: real photography, teal accents,
premium ecclesiastical character, clearer hierarchy, and low navigation depth.
Do not reproduce generic template layouts or legacy defects. Establish only a
compact design language: colour, type, spacing, image treatment, navigation,
buttons, cards, dialogs, and galleries. Review homepage, service, and
portfolio/project layouts on mobile and desktop, then refine through the
Clopote implementation. Avoid an elaborate branding exercise or free-form page
builder. Keep animation restrained and respect reduced-motion preferences.

## Editing and CMS acceptance

Sanity Free is the preferred starting point after comparison with Payload.
There will be one administrator initially, possibly two. The key requirement
is easy publishing by a nontechnical business user, including from a phone.
Use task-oriented Romanian labels and controlled page sections.

Before bulk migration, test a minimal project/gallery and editable page on the
user's actual phone:

1. Create a project draft with category, location, and description.
2. Upload 10–20 phone photos; verify actual formats (including HEIC), orientation,
   progress, and understandable recovery from failed uploads.
3. Select a cover, reorder images, and edit captions.
4. Edit page information without changing source code.
5. Publish and verify the site updates; unpublished content stays private.
6. Open/edit a representative roughly 200-image gallery without loading all
   original images at once or making the editor impractical.

Responsive Studio alone is not proof of acceptance. Record actual device,
browser, observations, failures, and user acceptance. Setup requires explicit
authorization, account ownership, and dataset name/visibility confirmation.
Public datasets must contain only information suitable for public access;
hidden UI fields are not a privacy boundary. Keep enquiry/private business data
out of public content documents.

## Budget and operations

Operating budget target: as low as practical, up to approximately USD 20/month
total. Hosting is unresolved. Vercel Pro's reviewed base price alone consumes
that target before taxes, domain costs, GCS archive, or usage overages. Vercel
Hobby is not a commercial production plan. Do not promise a fixed all-in price.
Compare commercial-compatible hosting before provisioning; keep application
architecture portable. Confirm media bytes, traffic, quota alerts, backups,
and recovery before launch. A managed CMS does not replace independent exports.

Pricing references reviewed in discussion on 2026-10-10; recheck before purchase:
[Sanity](https://www.sanity.io/pricing),
[Vercel](https://vercel.com/pricing),
[Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines).

## Content references

- [Clopote catalogue](https://drive.google.com/file/d/1QTlZ1y6UrG0ErkAtvvw63fIb2Rt2uoyI/view).
- [Policandre, iconostases and doors catalogue](https://drive.google.com/file/d/160kBlHa6HhQtk1p3G_3ZbF6xYgh6I7xD/view).
- User-supplied legacy website and catalogue screenshots.
- Read-only legacy repository and existing media inventory.

The Drive PDFs were not accessible through the browsing tool; only supplied
screenshots have been reviewed. Full PDF extraction remains pending direct
attachments or accessible copies. Content can be filled progressively. Check
dated model, warranty, availability, and company claims before publication.
Prices must be absent from text, metadata, images, and downloadable files.
Do not republish original priced PDFs; prepare reviewed price-free derivatives
if downloads are retained. Preserve original sources unchanged.

## Next milestones and gates

1. Consolidate this brief and planning documentation (this milestone).
2. Obtain search baseline exports and draft page/URL inventory; unknown traffic
   is not zero traffic. This can proceed alongside the CMS prototype.
3. With explicit setup approval, validate mobile publishing in a small Sanity
   prototype before building the full production schema set.
4. Review compact design foundations and representative layouts.
5. Build the complete Clopote slice with deterministic migration, translated
   content handling, canonical standalone/modal routes, SEO, and browser tests.
6. Expand, reconcile content/media, and verify launch and rollback readiness.

Unresolved cover and duplicate slugs block their affected imports, not planning.
GCS backup must be confirmed before bulk migration. Legacy repository and GCS
remain read-only regardless of filesystem permissions. Preserve existing work;
do not commit or cut over production without explicit authorization.
