# Change log

## Batch 1 (CHANGES_1, batch 1 + global)
- G1: section fade-and-rise on enter; smooth anchor scrolling; gentle scroll-snap (proximity) to section starts. All off under reduced motion. Native CSS, no Lenis.
- G2: not done. No image converter is available on this machine; photos are still the original JPG/PNG.
- 01 Hero: founder photo enlarged (42vw to the right edge, full hero height, left-edge mask fade). Lead set on three lines with a Gunmetal highlight; paragraph in full Ivory. (CHANGES_3 later says to ignore the lead/highlight/paragraph changes; the hero text is replaced in Batch 3.)
- 02 Problem: architecture photo replaced by a block-stacking toy (Matter.js, vendored in vendor/). "Add a block" / "Try again" buttons; static fallen pile with no JS or reduced motion. Pull line moved under the toy on two lines, "Changing" in Noto Sans Display italic.
- 04 Role: workspace photo ~45vw, multiply-blended with feathered edges, sticky on desktop. "Tasks vs. outcomes." as a heading with Task / Outcome cards. "Isn't that an executive assistant?" as a flip card.
- 06 Kasim: new H2 "Meet Kasim Aslam, Pareto Talent's CEO."; old H2 as a subheading; portrait on Ivory with a bottom fade; closing line on four lines with "trusted with real ownership," highlighted.
- 07 Questions: H2 on three lines; six flashcards (two columns, equal height); italic HIRE in answers 1 and 4.
- 08 Extras: four flip cards with the pill on both faces. (CHANGES_3 says this section is deleted in Batch 3.)

## Batch 2 (CHANGES_1, batch 2, with the CHANGES_3 section A override)
- 03 The Shift: section is now Prussian Blue with Ivory text and lines; top hairline removed (and the hairline above 04, which no longer follows an Ivory section).
- 03 The Shift: interactive delegation ring. Drag the dot (mouse or touch) or use the arrow keys (role="slider"). Stage panel beside the ring cross-fades between stages. Stage 2 → 3 is heavy: the dot follows at a third of the pointer speed, springs back to stage 2 if released before 85% of that arc, and snaps in past it, closing the ring with a short pulse. Keyboard: 3 presses to stage 2, 7 more to stage 3. No JS / reduced motion: the original static three-column diagram.
- 03 The Shift: closing paragraphs widened to 900px and set at 20px.
- 05 Selection: the highlighted dot pulses (2.4s ring, static under reduced motion); dots within ~60px of the pointer or finger brighten and grow. Still exactly 1,000 dots.
- 05 Selection: sourcing paragraph at 1.35rem, max-width 880px.
- 05 Selection: line-art flytrap scene (fly circles, lands, jaws snap once) plays when scrolled into view; then "Open the flytrap" appears; it reveals the flytrap card, and only then the benchmark paragraph fades in. Reduced motion: no animation, button shown at once. No JS: final scene, card and benchmark all visible.
- 05 Selection: the pinned HIRE stepper was NOT built (CHANGES_3 override). The seven steps remain the original list until Batch 3.

## Fix after Batch 2: flytrap timing
- The flytrap scene now sits paused on its first frame (jaws open, fly off to the side) from the first paint. Before, the closed final scene briefly showed until the script ran.
- It plays once, from the beginning, only when at least 60% of the scene is visible (IntersectionObserver, threshold 0.6, plus an explicit ratio check). Scrolling away and back does not replay it.
- "Open the flytrap" appears only after the jaws have closed. Reduced motion and no-JS behaviour unchanged.

## Batch 3 (CHANGES_3, sections C1–C12 + E)
- Page order is now 01 Hero · 02 Kasim and Ivan · 03 Problem · 04 Shift · 05 Selection · 06 Role · 07 Calculator · 08 SOP Lab · 09 Delegation Mastermind · 10 What founders say · 11 Guarantees · 12 Questions · 13 Final CTA. Numerals renumbered; nav: The Role, Selection, Calculator, SOP Lab, Questions.
- C1 Hero: new eyebrow, two-line H1 (second line Teal), new paragraph, primary + outline buttons, stat strip with source line, VA vs. Right Hand comparison cards (Lucide x / check). The Batch 1 three-line lead is gone. H1 size reduced to clamp(3rem, 5.4vw, 5rem) to fit the longer copy.
- C2: Kasim section moved to 02; Ivan Bunin block + source line added before the closing line.
- C4 Selection: click-to-inspect HIRE explorer (tablist, 7 steps + the flytrap; arrow keys move, Enter/Space select); the original ordered list is the no-JS version. Flytrap animation unchanged. Source line added. A hairline now separates 04 and 05 (both dark).
- C5 Role: "Where each of you spends your time" split (Illustrative) after the Tasks vs. outcomes cards.
- C6 Calculator (new, id="calculator"): two sliders, live bars, leverage projection, optional monthly support cost (net value, return multiple, payback), live CTA label. No-JS shows the defaults ($6,300 / $327,600).
- C7 SOP Lab (new, id="sop-lab"): local starter-SOP generator with Markdown copy; four example playbooks as tabs (all four stacked without JS). Built only from the text in CHANGES_3; no objectives or frequencies were invented for the four playbooks.
- C8 Delegation Mastermind, C9 What founders say (three verbatim quotes), C10 Guarantees (word for word): new sections.
- C11 FAQ answer 6 replaced.
- C12 Final CTA: new eyebrow, H2, subline, chips; footer gained the homework line.
- Concept extras section deleted (HTML and CSS).
- E: ASSET_SOURCES.md has a Content sources table and the compression note.

## Batch 4 (layout, colour and component changes)
- Hero: the hand edits to the H1 and paragraph were found only in the browser-saved copy ("The Right Hand Program — Student Concept.html"), not in index.html. They were copied into index.html verbatim. No other hero change.
- New order: 01 Hero · 02 Problem · 03 Shift · 04 Selection · 05 Role · 06 Calculator · 07 SOP Lab · 08 Delegation Mastermind · 09 Kasim and Ivan · 10 What founders say · 11 Guarantees · 12 Questions · 13 Final CTA. Numerals renumbered; nav reordered to follow the page (Selection, The Role, Calculator, SOP Lab, Questions). Hairlines only between consecutive same-colour sections.
- 09 Kasim and Ivan: H2 is now "Meet Kasim Aslam, the CEO."; subheading and the rest unchanged.
- 03 Shift: wider container (1280px), larger ring (540px) and stage text, wider closing paragraphs.
- 04 Selection: explorer panel sized to its content; flytrap removed from the explorer (list ends at step 7; the no-JS list already had 7). Benchmark paragraph widened (980px) and centred, same 16px size.
- 04 Flytrap: pressing "Open the flytrap" now also plays a slow release (about 3.2s): the jaws open and the fly flies out and off past the right edge, then the scene rests with the jaws open. First animation, 60% trigger and "benchmark after card" unchanged. Reduced motion: card only.
- 06 Calculator: wider section and intro (980px); calculator made more compact (smaller padding, values and gaps).
- 07 SOP Lab: Prussian Blue version with Ivory text; tabs, panels, chips, checklist, input and generator restyled for dark (lowest measured contrast 9.1:1).
- 08 Delegation Mastermind: Ivory background.
- 10 What founders say: three founder-name tabs, one quote at a time (first open), arrow keys; no-JS shows all three.
- 11 Guarantees: Prussian Blue flip cards (title on the front, text on the back), all three the same height; no-JS and reduced motion show title and text together.
- 12 Questions: accordion with plus/minus buttons (aria-expanded), any number open; no-JS shows all answers.
- Footer: removed the "This is homework…" line; main disclaimer unchanged.

## Lead form (final CTA, #book)
- Added the HighLevel form embed (practice account) in an Ivory card (1px hairline, 4px radius) under the H2 and subline, with the label "Request your matching call".
- Iframe given an explicit height of 774px (the embed's height:100% would collapse it). Once HighLevel's script loads it resizes the iframe to fit the form (about 822px desktop, 851px at 320px).
- Small line under the form: "Student concept form. Submissions go to my practice HighLevel account, not to Pareto Talent." Pricing note and chips kept; footer disclaimer unchanged.
- Removed the "Book your matching call" button inside #book (it linked to #book itself). All other booking buttons still point to #book and now land on the form.
- If the form script (link.msgsndr.com) is blocked, the iframe is hidden and a text message explains how to load the form, instead of an empty box.
- Note: this adds the page's first external resources (form iframe + script) and its first form, by request; earlier rules said no forms or external links.

## Lead form in a modal
- Every "Book your matching call" button (nav, hero, final CTA) and the calculator's "Reclaim my … hours / week" button now open the HighLevel form in a native <dialog> modal instead of scrolling to #book. Same iframe embed, same Ivory card, label and practice-account line. Close button, Esc, backdrop click; focus stays in the modal and returns to the button that opened it. Prussian Blue backdrop at 85% opacity. The modal scrolls inside itself on small screens (checked at 320px). The iframe and embed script load only on first open; the text fallback still shows if the script is blocked. The final CTA keeps its heading, subline and pricing note, with one button instead of the embedded form. Without JS, the buttons go to #book and the final button opens the HighLevel form page in a new tab.
