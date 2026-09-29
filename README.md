# Landed

**The price you see is the price that lands.** Landed is a shop inspired by Amazon: search, compare, buy and track orders. Its main difference is that every price on the site is what you'll actually pay to get the item delivered, in your own currency.

- **Live:** _add the deployed URL here_
- **Demo account:** `demo@landed.shop` / `demo1234`, or press **Continue with demo account** on the sign-in page
- **Test cards:** `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined. Any future expiry date and any CVC work.

---

## Product

Landed covers the core shopping journey from start to finish:

**Home → Search → Results → Product → Cart → Checkout → Confirmation → Orders**

It also has a wishlist, a comparison view, sign-in and sign-up, and an account area for orders, addresses and settings. There are 184 real products across 7 departments.

## Inspiration: what I learned from Amazon

I used amazon.com from Karachi, Pakistan, and went through every flow before writing code. The screenshots aren't in the repo because they include my home address. The biggest problem showed up on every screen:

| Step | What Amazon showed | What it meant |
|---|---|---|
| Search results | **PKR 7,744**, with "PKR 12,426 delivery" in small grey text | The main number was less than half the real cost |
| Product page | **PKR 7,744**, with "PKR 20,927 Shipping & Import Charges" behind a *Details* toggle | The fees were 2.7× the item price |
| Cart | Subtotal **PKR 7,744** | The fees disappeared again |
| Checkout | Order total **$103.48**, with every line showing `--` until a card was chosen | The currency changed, and the total was 3.7× the cart subtotal |

For anyone outside the US, the number Amazon shows as the price isn't what they pay. Sorting "by price" sorts by the wrong number.

Other things I noticed:
- **Search results:** 4 of the first 5 results were sponsored, and the filter sidebar had about 40 groups (Neckline, UV Protection, "Occasion: Baptism").
- **Product page:**
  - Reviews start about five screens down and need a sign-in.
  - The size chart is an image of a height × weight grid, printed twice.
  - Roughly half the page is cross-sell carousels.
- **Cart and checkout:**
  - The cart has an 8-item upsell rail, each item with its own shipping fee.
  - Checkout offered a Pakistani shopper Affirm (ineligible), a US checking account and an OTC Benefits card, but not cash on delivery, which is how most people there pay.
- **Sign-in is good:** it's one field for email or phone. I kept the idea.

## Product decisions

### 1. One number everywhere: the delivered price
You choose the country once. It's detected automatically on the first visit. From then on, every price on the site is the **total delivered cost in that country's currency**. That applies to cards, sorting, the price filter, search suggestions, the product page, the cart, checkout and orders. The item price and fees are still shown, but the main number is the one you'll pay. The place-order button repeats the total ("Place order · PKR 453,710"), and it always matches the cart.

### 2. Shipping per box, not per item
Shipping is priced per box plus a small fee per item, which is how international shipping actually works. The cart shows exactly how much you save by ordering items together ("saves you PKR 11,077 compared with ordering them one at a time"). Amazon's per-listing delivery fee hides this.

### 3. Search results you can scan
- No sponsored results. The page says so.
- **Five filters** that matter: department, delivered price (a slider in your currency), rating, arrival time and brand.
- Sort by **delivered price**, rating, fastest delivery or discount.
- Filters update the URL instantly using the browser's History API, so results change without a server round trip and links can still be shared.

### 4. Product cards answer four questions in order
What is it, is it any good, what will I pay, and when will it arrive. Each card has one discount badge, one price and one delivery line. There are no coupon tags or "bought in past month" lines.

### 5. The product page puts the decision first
- Gallery on the left.
- On the right: price, fee breakdown, size, quantity and buy buttons.
- **Tabs** for overview, specifications and reviews, directly underneath.
- Reviews are open to everyone.
- **Find my size:** enter height and weight and get a size, in place of an image chart. Shoe sizes show US, UK and EU on each button.

### 6. Checkout in four steps, with the total always visible
- **Steps:** address → delivery → payment → review, then confirmation.
- Completed steps collapse into a one-line summary with a *Change* button.
- The order total is always on screen. On mobile it's one tap away in a collapsible summary.
- **Guest checkout:** guest orders move into your account automatically when you sign up or sign in on the same device.
- **Payment options:** cash on delivery is offered for Pakistan, India and the UAE.
- **Failure handling:** a declined card shows a clear error and takes you back to payment, with nothing lost.

### 7. Small things
- **Compare:** tick *Compare* on up to 4 cards to see delivered price, arrival date, rating, warranty and returns side by side. Amazon's version of this is several open tabs.
- **Search box:** suggestions show each product's delivered price, recent searches are remembered, and `/` jumps to search.
- **Undo:** removing something from the cart or wishlist shows a toast with an **Undo** button.

### What I cut, on purpose
Prime, Prime Video, Gift Cards, Registry, Sell, advertising and sponsored placements, the cross-sell carousels, financing and store-card upsells, seller tools, and real payments or tax infrastructure. None of these help someone find something, decide and buy it. The brief rewards a finished core flow over a long feature list.

## Features

- **Home:** hero with a live price receipt, departments, trending, a promo explaining per-box shipping, "recommended for you" (based on the department you last viewed) and recently viewed
- **Search:** Command-style suggestions (products with delivered prices, departments, recent and popular searches), debounced; results page with filters, sort, pagination, active-filter chips, and empty states for no results, invalid search and no filter matches
- **Mobile listing:** filter button and sort side by side, with filters in a bottom sheet
- **Product page:** swipeable gallery on mobile, cross-fading gallery on desktop, delivered-price breakdown with explanatory tooltips, availability, delivery estimate, size picker and size finder, quantity, add to cart / buy now / save, tabs, related products, and a not-found page
- **Cart:** quantity stepper, remove with undo, save for later, free-shipping progress (US), per-box saving, delivery estimate, an empty state, and suggestions to add to the same box
- **Checkout:** step indicator, saved-address picker or a new address form with validation, standard/express delivery with dates, card (test numbers only) or cash on delivery, review, simulated processing, a decline path, and confirmation
- **Accounts:** sign in, sign up, demo account, sign out, account pages protected by a redirect to sign-in, and guest orders claimed on sign-in
- **Account area:** overview, orders (filter tabs, progress through Processing → Shipped → Out for delivery → Delivered, cancel via a confirm dialog, buy again), addresses (add, edit, delete, make default) and settings (profile, shopping country, reset demo data)
- **Wishlist:** heart on every card and product with a small animation and toast, a wishlist page, and move to cart
- **States:** skeletons for every route and for data loaded in the browser; empty states for cart, wishlist, orders, search and missing products; an error page with retry

## Tech stack

- **Next.js 16** (App Router), with 184 product pages generated at build time; **TypeScript**
- **Tailwind CSS v4**, plus **shadcn/ui** (Radix) as the component foundation, with a custom theme (see below)
- **Lucide** icons, **Sonner** toasts, **cmdk** (Command) for search
- **Zustand**, saved to `localStorage`, for the cart, wishlist, accounts and orders
- A small `proxy.ts` (formerly Next.js middleware) reads Vercel's IP-country header, so prices open in the visitor's currency on the first visit

**Design system:**
- Warm stone background, white surfaces and near-black primary buttons.
- One brand green (`#0b6b50`), used almost only for delivered prices and success states, so green consistently means "this is what you pay".
- Font is Manrope. Buttons are 40–48px tall so they're easy to tap.
- shadcn's components are restyled so the site doesn't look like the default shadcn demo.

```
src/
  app/                 routes (home, search, product/[id], cart, checkout, account/*, wishlist, signin, signup)
  components/
    ui/                shadcn/ui primitives (themed)
    layout/            header, footer, logo, ship-to picker, mobile nav
    search/            SearchBox (Command), FilterPanel, SearchView, useFilters
    product/           ProductCard, ProductGrid, ProductGallery, PriceDisplay, BuyBox, ProductTabs, SizePicker, WishlistToggle, CompareTray
    cart/ checkout/ account/ home/ common/
  lib/
    shipping.ts        the delivered-price model (per-box shipping, import duty, FX, delivery dates)
    catalog.ts         products in the brief's schema, departments, related/trending/deals
    search.ts          relevance ranking shared by server results and client suggestions
    store.ts           cart, wishlist, accounts, orders (persisted)
    orders.ts demo.ts  order status over time, seeded demo account
```

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

`scripts/build-catalog.mjs` rebuilds the product snapshot from DummyJSON (images are resized with sharp into `public/img`). You don't need to run it: the snapshot is committed, so the site never depends on a third-party API at runtime.

## Demo

- **Demo account:** `demo@landed.shop` / `demo1234`. It comes with three orders (out for delivery, shipped, delivered) and two saved addresses.
- **Test cards:** `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined. The form only accepts these two numbers, so it can't be mistaken for a real payment form.
- **Countries:** switch between Pakistan, the US, the UK, the UAE and India from the header to see the delivered-price model change.
- **Stored in your browser:** accounts, orders and the wishlist. Settings → *Reset demo data* starts over.

## Deployment

Deployed on Vercel from this repo. **Live URL:** _add it here_

## Honest limitations

- **Estimates:** shipping, import charges and exchange rates come from a fixed table in `lib/shipping.ts`. They're clearly marked as estimates, not quotes.
- **Demo data:**
  - Product data comes from DummyJSON, which has 3 reviews per product, so review counts are small and honest rather than inflated.
  - There are no gaming products in the source data, so there's no gaming department.
- **No backend:** accounts are demo accounts stored in the browser, with passwords hashed using SHA-256. A real store would need a server; the brief allowed a mock.

## How this was built

With Claude Code. Every prompt and final response is in [`.agent-logs/`](.agent-logs/) (see [CAPTURE-TEST.md](CAPTURE-TEST.md)), committed alongside the code it produced. [PLAN.md](PLAN.md) is the first plan, written before the brief changed from "Amazon rebuild" to "your own brand"; it has been left as it was.
