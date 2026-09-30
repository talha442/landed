import type { Metadata } from "next";
import { Check } from "lucide-react";
import { DisplayPrefsForm } from "@/components/a11y/DisplayPrefsForm";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Display settings and how Landed meets WCAG 2.2 AA.",
};

const PRACTICES = [
  { title: "Keyboard first", body: "Everything works without a mouse: the department menu (arrow keys, Esc), search suggestions, filters, the size finder, checkout and every dialog. A skip link jumps past the header, and press / to focus search." },
  { title: "Screen readers", body: "Real headings on every page, labelled landmarks and controls, form errors announced and linked to their fields, and live updates for search results, cart quantities and toasts." },
  { title: "Visible focus", body: "A clear focus ring on everything you can reach, which never hides under the sticky header." },
  { title: "Colour and contrast", body: "Text meets 4.5:1. Nothing relies on colour alone: discounts, stock, order status and the best value in comparisons all say so in words." },
  { title: "Touch targets", body: "Buttons are 40–48px tall; checkboxes, radios, sliders and small icon buttons have at least 24px of target." },
  { title: "Motion", body: "Animations are short and only show changes of state. They switch off if your system asks for reduced motion, or with the setting above." },
  { title: "Zoom and reflow", body: "Works at 200% zoom and on 320px-wide screens without sideways scrolling." },
  { title: "Forgiving forms", body: "Autocomplete on address and sign-in fields, paste allowed in passwords, no puzzles, and every destructive action (remove, cancel, delete) is confirmed or can be undone." },
];

export default function AccessibilityPage() {
  return (
    <div className="container-page max-w-4xl py-10">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Accessibility</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Landed aims to meet <strong className="font-semibold text-foreground">WCAG 2.2 level AA</strong>. Adjust the display below; your choices are saved in
        this browser and apply on every page.
      </p>

      <section aria-labelledby="display-h" className="mt-10">
        <h2 id="display-h" className="text-xl font-bold">
          Display settings
        </h2>
        <div className="mt-4">
          <DisplayPrefsForm />
        </div>
      </section>

      <section aria-labelledby="practices-h" className="mt-14">
        <h2 id="practices-h" className="text-xl font-bold">
          What we do
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {PRACTICES.map((p) => (
            <li key={p.title} className="rounded-2xl border bg-card p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <Check className="size-4 text-brand" aria-hidden /> {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="testing-h" className="mt-14">
        <h2 id="testing-h" className="text-xl font-bold">
          How it&apos;s tested
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every main page and interactive state (mega menu, search suggestions, filter sheet, dialogs, checkout) is scanned with axe-core against WCAG 2.2 A and
          AA rules at desktop and phone widths, and the full shopping flow is run by keyboard. One known exception comes from the menu library: while a department panel is open, Radix adds a
          visually hidden element that immediately passes keyboard focus into the panel. axe reports it because it is focusable but hidden; it is never announced.
        </p>
      </section>
    </div>
  );
}
