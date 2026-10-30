# Madipakkam Saravana Stores – Sales Dashboard

Open **index.html** in Edge or Chrome (double-click). No server or internet needed (the Inter font loads online if available).

Pages (left menu): Overview · Sales Trends · Time Patterns · Bills & Baskets · Products · Categories & Brands · Stock Health · Exceptions & Audit · Data Catalogue.
The period filter (Day / Month / Range, compare with previous / last year / any other) follows you between pages.

## Brand logos for products
Product photos: put `CODE.jpg` into `../MadipakkamSaravanaStores-Website/images/products/` — they appear automatically in the product drawer and tables.
Brand logos: drop `milton.png`, `prestige.png`, `butterfly.png`, `cello.png`, `mithra.png`, `premier.png`, `preethi.png`, `vidiem.png`, `crompton.png` … (lower-case brand name) into `assets/brands/`. Until then each brand shows a red monogram badge.

## Refreshing the data
1. Export fresh RPOS-7 CSVs to `RPOS-7_Data/` and the stock report to the project folder (update the file name in `_build/prep.py`).
2. `python _build/prep.py` (rebuilds `assets/data.js`), then `python _build/gen.py` if page scripts changed.

## Notes
Categories come from the website / Google Merchant feed (`MerchantCenterFeed/primary_feed.tsv`); items not on the feed are classified from their names and tagged "inferred". See the Data Catalogue page for every caveat.

## Look & feel
Google-style light/dark theme (toggle top-right). On phones the menu becomes a bottom bar (Overview, Sales, Products, Stock, More) and the period filters sit behind the filter button. Add `?theme=dark` or `?theme=light` to any page address to force a theme.

## Sign-in
Every page asks for a sign-in first.  Username **9444577336**, password **9344**. "Keep me signed in" remembers the device for 30 days; the **Sign out** button is at the bottom of the left menu. After 5 wrong tries the form locks for 30 seconds.

To change the credentials: pick a new username and password, compute the hash with the `_hash('sss|USERNAME|PASSWORD|madipakkam')` function in `assets/app.js` (run it in a browser console on any page) and replace `AUTH_OK` at the top of the sign-in section.

**Limits:** this is a simple front-door check that runs in the browser — it stops casual viewers, but it is *not* real security. The sales data sits in `assets/data.js` and a technical person can open it directly. If the folder is ever put on the internet or shared outside the shop, use proper hosting with real authentication (for example a password-protected site on your web host).

## Bank & Cash Flow, product rates
- **Bank page:** built from the 66 IDFC FIRST Bank PDFs in `BankStatement/`. To refresh after downloading new statements: `python _build/bank_parse.py` then `python _build/bank_prep.py`. Needs poppler's `pdftotext`. `_build/bank_txns.json` holds every parsed transaction (private - keep it out of anything you share).
- **Products** are grouped using the website's own name-cleaning rules (`MadipakkamSaravanaStores-Website/tools/build_catalogue.py`), so "Spoon Rs 12 / Rs 18 / Rs 25" is one product with three rates. Re-run `python _build/prep.py` after the website tools change.
