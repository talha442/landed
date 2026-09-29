# Plan: Amazon rebuild

Written before any product code, from a walkthrough of amazon.com on 2026-09-29.
I went through it from Karachi: sign-in, the homepage, a search for "fitness clothing",
one product (an INTO THE AM t-shirt), the cart and checkout. The screenshots are in `research/`.

## What I found

**1. You don't see the real price until the last step, and it's in a different currency.**
This is the biggest problem, and it shows up in every screenshot.

| Step | What Amazon shows | What it means |
|---|---|---|
| Search results | **PKR 7,744**, then in small grey text "PKR 12,426 delivery" | The headline number is under half the real cost |
| Product page | **PKR 7,744**, then "PKR 20,927 Shipping & Import Charges" behind a "Details" toggle | Fees are 2.7x the item price |
| Cart | Subtotal **PKR 7,744** | Fees vanish again |
| Checkout | Order total **$103.48**, every line shows "--" until you choose a payment method | Now in USD. ≈ PKR 28,700, or 3.7x the cart subtotal |

For anyone outside the US, the price Amazon shows as the price is not what they pay.
Sorting by "price" sorts by the wrong number.

**2. Search results are mostly ads.** 4 of the first 5 results are Sponsored, and
there are more sponsored rows mixed in further down. The filter sidebar has about
40 groups (Neckline, UV Protection, "Occasion: Baptism"...), so the ones people use
(price, rating, delivery date) are hard to find.

**3. The product page hides what you need to decide.**
- **Reviews** start about 5 screens down, and you can't read them unless you're signed in.
- **The size chart** is a huge height × weight image grid, printed twice.
- **Variants:** 16 colour packs, each with its own price, spread over 3 pages of swatches.
- **Everything else:** about half the page is cross-sells, like "Customers also viewed",
  "Similar brands", "Climate Pledge", "Featured items" and a Prime Video promo.

**4. Cart and checkout** have little in them but are wrapped in upsells. The cart's
right rail shows 8 "Styling ideas", each with its own shipping fee. Checkout offers a
Pakistani shopper Affirm (ineligible), a US checking account, an Amazon Store Card
and an OTC Benefits card.

**5. Sign-in is good.** It's one field for email or phone, then Continue. I'm keeping that.

## The one big change: show the total cost, in one currency, everywhere

Pick where it ships to once, in the header. From then on, every price in the app
is the **delivered total** in that country's currency: search cards, sorting, filters,
the product page, the cart and checkout. The item price and the fees are still shown,
but the headline number is the one you'll pay.

- **Shipping is per shipment, not per item,** and the cart says so. The first item
  pays the base fee, and each extra item adds a small amount. Amazon's per-item
  "PKR 12,426 delivery" on each result hides the fact that buying two things together
  costs much less than buying them separately.
- **"Lowest total cost"** is a sort option in its own right.
- **No "--" in checkout.** The total is visible from the first screen and never
  changes currency.

Fees are **estimates from a published table per destination**, not live customs
quotes, and the UI says so.

## Other changes

- **No sponsored results.** Results are ranked by relevance, and that's all they are.
- **Five filters, not forty:** department, total price, rating, delivered by,
  and brand. These are the filters shoppers actually use.
- **Product page, in order:** gallery → price breakdown → buy box → key specs →
  reviews. Reviews go on the page and don't need a sign-in.
- **A size finder, not a size chart:** for clothing and shoes, enter your height and
  weight and get a size.
- **Guest checkout:** you only need to sign in to see your order history. Checkout is
  one page (address, delivery speed, payment, review) with the total always showing.

## Deliberately cut

These are real features, but none of them helps someone find a thing, decide and buy it:

- Prime Video, Registry, Gift Cards, Sell, Coupons, the language switcher
- All sponsored placements and brand ad banners
- The 5+ cross-sell carousels on the product page, and the cart's upsell rail
- Financing and store-card upsells at checkout
- Real payments: checkout uses a clearly marked test card. Taking money isn't what's being judged.
- Real accounts: they're stored in your browser. The live link has to work for
  someone who isn't signed in, so nothing depends on a backend login.

## Build order

Deploy early, then ship in thin vertical slices so the live link always works.

1. **Data:** 194 real products from DummyJSON (images, ratings, reviews), saved into the repo
2. **Layout:** header with search, ship-to selector, cart count
3. **Search results:** total-cost cards, 5 filters, sort
4. **Product page:** gallery, cost breakdown, buy box, specs, reviews
5. **Cart:** quantities, save for later, shipment-bundling breakdown
6. **One-page checkout, order confirmation, orders list**
7. **Sign-in / create account:** email first, like Amazon
8. **Homepage**
9. **Stretch:** size finder, compare tray, recently viewed

## Stack

Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel. Product pages are
generated at build time from the saved data. Cart, orders and accounts live in the
browser (localStorage), so there's no server state to break.
