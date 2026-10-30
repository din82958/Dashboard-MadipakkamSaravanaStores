# RPOS-7 Data Analysis & Dashboard Spec — Madipakkam Saravana Stores

Source: `RPOS-7_Data` (1,163 headerless CSV table dumps; 723 empty; ~440 with data, mostly POS config/menus/print templates) + `3030_Current_St_ock_Detail_…csv` (stock report, has headers).
Column names were **inferred from values** and reconciled against totals. Confidence is shown per column.

## 1. Headline numbers (verified)
| Metric | Value |
|---|---|
| Period | 2024-02-13 → 2026-10-24 (969 trading days) |
| Bills | 33,390 (+2 malformed rows, see §5) |
| Net sales | ₹4,58,80,803 (≈ ₹4.59 cr) |
| Avg bill | ≈ ₹1,374 · avg 5.8 items/bill (193,646 lines) |
| Best days | 2025-11-02 (90 bills), 2025-06-15 (87), 2024-06-09 (85) |
| Largest bill | ₹57,525 (2025-09-22) |
| Payment | Essentially all cash (`CA` 33,389; one `WL`). Sale returns: 8 only (₹5,742) |
| Voids | 7,062 void-log entries (7,018 deleted `D`, 44 `C`) across the whole period |
| Monthly run-rate (2026) | ₹12.5 – 17.7 lakh/month, 940–1,325 bills |

**Patterns**: Sun (₹1.0 cr) and Sat (₹93 L) are ~2× any weekday (~₹48–57 L each). Busiest hours 18:00–21:00 (≈ 40% of sales; 19h peak ₹63 L, 5,108 bills); store trades ~10:00–22:00. Sales grew from ~₹14.5 L/month (2024) to ~₹16.5 L/month (2026); Jun, Aug, Nov peaks (festival months).

## 2. Business tables and what each holds
| Table | Rows | What it is | Dashboard use |
|---|---|---|---|
| MED_BILL_HDR | 33,392 | one row/bill | sales, bills, time, tender |
| MED_BILL_DTL | 193,646 | bill lines | item, qty, rate, tax, discount |
| Med_Tender_Dtl | 33,400 | payment per bill (SA=sale, SR=return) | payment/returns |
| MED_STOCK_SALES | 218,083 | stock deduction per sale line (batch OS#/CA#) | stock movement |
| med_item_hdr | 16,137 | item master (name, MRP, cost, EAN, tax) | item names/categories |
| MED_ITEM_DTL | 28,937 | batch master (qty, cost, MRP, expiry) | current stock |
| MED_ITEM_EANCODE | 2,530 | barcode ↔ item (only 2,530 of 16k items have one) | scan coverage |
| Day_item_stk_archive / Day_stk_archive | 177,281 / 1,784 | daily stock snapshots (qty/cost/MRP value) | stock history |
| INV_VOID_HDR / _DTL | 7,062 / 7,285 | cancelled bills/lines | void analysis |
| DELETEDRECORDS, deleted_med_stock_sale | 36,544 / ~1k | audit of deleted rows | audit |
| Med_Barcode_Sticker | 24,541 | barcode labels printed | label history |
| Stock report CSV (parent folder) | 26,785 batch rows | current stock at 2026-10-02 | stock panel |

## 3. Decoded columns (0-based index)
**MED_BILL_HDR** — 0 bill id (high) · 1 bill date (high) · 10 **net bill amount** (high; sum ₹4.588 cr) · 11 payment mode CA/WL (high) · 14 line count (high; sums to DTL rows) · 18 printed bill no (med) · 78 **bill timestamp** (high; use for hour) · 9 discount (med) · 26/98 tax amount (med) · 21 bill series 1/3 (low — 3 = 7,235 bills, meaning unknown, to confirm) · 8 'R'=retail (med).
**MED_BILL_DTL** — 0 bill id (high) · 1 line no (high) · 2 item code (high) · 6 qty (high) · 7 MRP (med) · 9 **line amount** (high; sum ₹4.593 cr vs header ₹4.588 cr) · 11 cost/purchase rate (med) · 13 tax % (high: 0/5/12/18) · 16 discount (med) · 106 barcode/EAN (med).
**Med_Tender_Dtl** — 0 bill id · 1 tender type (1 = cash, 14 = other) · 3 amount · 14 SA/SR · 22 date (high).
**Stock report** — fully headed (72 columns): Item Code, Item Name, Batch No, Expiry, Selling, MRP, Purchase Price, Current Stock, Stock Val on MRP, Sales Tax %, Distributor, etc.
Reconciliation: DTL vs HDR per bill matches for all but 71 bills (0.2%, differences from header-level discounts/round-offs).

## 4. Stock & data-quality findings (stock report, 2026-10-02)
- 26,785 batch rows / 15,537 items. **Net stock 21,379 units** — equals the report's own total (90,790 positive − 69,411 negative ✔).
- **Negative stock: 5,023 batches (19%) / 3,416 items net-negative; −69,411 units; −₹1.29 cr at MRP.** Positive stock is ₹1.83 cr at MRP, so the reported net MRP value (₹53.7 L) is understated by negatives.
- Largest negatives: item 5929 "12" (−1,029), 3701 Battery Rs15 (−1,011), 3150 Spoon Rs5 (−882), 9155 Bowl (−732), Spoon Rs18/12/10 (−599/−582/−535), Tumbler 15 (−555).
- 535 batches are `SU` (migrated/opening) — 533 of them negative (−17,643 units): opening stock never entered, then sold.
- No expired batches with stock; no zero MRP/purchase rows. Tax slabs: 12% (10.7k), 18% (10.1k), 5% (5.4k), 0% (626), one odd 43%.
- Brand is blank/"NA" for ~100% of rows, so brand charts are not usable; use item name and tax slab/HSN.
- Only 2,530 EAN codes for 16,137 items — most items scan via the internal code/printed label.

## 5. Known data issues
1. 2 bill headers (ids 10907, 32080) have unquoted commas in customer address → columns shifted; excluded from totals (₹ value to recover from DTL).
2. 71 bills where line total ≠ header (mostly discounts/round-off).
3. Item names embed price (e.g. "SPOON Rs 5") — different prices create separate items.
4. Negative stock means sales recorded without stock-in; do not use stock qty for profit/COGS without correction.
5. Void count (7,062) is large relative to 33,390 bills — should be reviewed (training/editing vs. cancellation).

## 6. Dashboard spec (to build next)
**Global controls**: day picker, month picker, custom range; "compare with" (previous period / same month last year / any other day or month).
**KPI row**: Net sales · Bills · Avg bill · Units · Items/bill · Discount · Returns · Voids — each with Δ% vs compare period.
**Sales history**: daily bar + 7-day average; weekly and monthly toggles; cumulative line; month-over-month and year-over-year overlay.
**Time-of-day**: sales and bills by hour for selected period; weekday × hour heatmap; hour comparison of two days.
**Day-wise**: sales by weekday; calendar heatmap (daily sales); best/worst days table with bill counts.
**Product**: top/bottom 20 items by qty, sales, estimated margin (MRP/selling vs cost); tax-slab split; price-band split.
**Stock panel**: current stock value (positive only vs net), negative-stock list (sortable), fast movers with low/negative stock, reorder candidates.
**Quality panel**: voids, deleted lines, returns, anomalous bills.
**Build**: Python preprocess → aggregated JSON (daily, hourly, item-daily) → single offline HTML dashboard (Chart.js/ECharts inline), saved in `DashBoard/`. ~3–5 MB.

## 7. Decisions
- **Negative stock**: shown as-is (no clamping to zero); positive-only and net values both displayed.
- **Purchases**: none in use, so no purchase/COGS/margin from real purchase data; margin is only an estimate from item cost fields.
- **"Series 3" (header col 21 / col 168)**: not a separate counter. Bill numbers run continuously across it (6,648 → 6,649 on 2024-11-12). It was the active setting from 2024-02-15 to 2024-11-12 11:43 (7,235 bills, ₹99.0 L); series 1 before (13–14 Feb 2024) and after (from 2024-11-12 16:08). Sales/hour/weekday patterns are the same in both. Its meaning (billing profile/print format/tax setup) cannot be read from the data. Dashboard treats both as one stream, with an optional filter.
- **Origin**: Items and opening stock were imported from Vyapar into GoFrugal RPOS-7 on go-live (2024-02-13; 2,585 items created that day). Vyapar sales history was not imported, so all sales analysis starts 2024-02-13. Negative stock largely stems from imported/opening quantities not matching actual stock (`OS` = opening stock, `IM` = imported, `SU` = migrated); the dashboard shows it as-is and labels it by batch type.
- Still open: recover the 2 malformed bills (10907, 32080)?


## 8. Built (Oct 2026)
The dashboard is now a multi-page app: open `index.html` (see README.md). Categories and brands come from the website feed (`MerchantCenterFeed/primary_feed.tsv`); costs in the POS are formulaic (80%/50% of MRP) so no margin analysis is offered.
