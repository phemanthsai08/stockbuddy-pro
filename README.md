# StockBuddy Pro

STOCKNOVA — FINAL PRODUCTION-QUALITY BUILD

You are the lead frontend engineer, UI/UX designer, and product architect.

Build StockNova, a professional Smart Warehouse Management System for a college project demonstration.

This must be a REAL WORKING APPLICATION, not a static UI mockup.

CORE TECHNOLOGY

Use:

- HTML5

- CSS3

- JavaScript

- LocalStorage for persistent browser data

- Chart.js or another lightweight chart library if required

Keep the application lightweight and reliable.

All important functionality must be implemented in actual source code.

Do NOT create fake buttons, fake forms, or hard-coded dashboard numbers.

---

PRODUCT IDENTITY

Application name:

STOCKNOVA

Subtitle:

Smart Warehouse Management System

Create a professional logo/icon using a simple warehouse + box concept.

Visual style:

- Modern enterprise SaaS

- Clean

- Professional

- Premium

- Responsive

- Easy to understand

- Suitable for a college project presentation

Avoid excessive gradients, unnecessary animations, and clutter.

---

APPLICATION STRUCTURE

Create these sections:

1. Dashboard

2. Inventory

3. Stock In

4. Stock Out

5. Alerts

6. Reports

Use a responsive sidebar navigation.

On desktop:

- Sidebar on the left

- Top header

- Main content area

On mobile:

- Collapsible navigation

- Responsive cards

- Responsive tables

---

DASHBOARD

Create a highly polished dashboard.

At the top display:

Good morning, Warehouse Manager

and a small summary of today's warehouse activity.

Create KPI cards:

1. Total Products

2. Total Stock Units

3. Low Stock Items

4. Out of Stock

5. Stock In Today

6. Stock Out Today

7. Inventory Value

Every KPI must be calculated from the actual stored data.

Do NOT hard-code these numbers.

DASHBOARD CHARTS

Create:

Inventory by Category

Bar or doughnut chart.

Stock Movement

Line/bar chart showing stock-in vs stock-out.

Stock Status

Chart showing:

- Healthy Stock

- Low Stock

- Out of Stock

Charts must update when inventory changes.

RECENT ACTIVITY

Create a professional transaction table:

Product | Type | Quantity | Date | Reference | Status

Use badges:

Stock In

Stock Out

LOW STOCK PANEL

Show the most important low-stock products.

Example:

⚠️ Wireless Mouse

Current: 8

Minimum: 20

Location: A-12

Include a "View Inventory" button.

---

INVENTORY

Create a professional inventory management page.

Table columns:

- SKU

- Product

- Category

- Quantity

- Minimum Stock

- Location

- Unit Price

- Status

- Actions

Status must automatically calculate.

Rules:

If quantity === 0:

OUT OF STOCK

If quantity <= minimumStock:

LOW STOCK

Otherwise:

IN STOCK

INVENTORY FEATURES

Implement:

- Search

- Category filter

- Status filter

- Sorting

- Add Product

- Edit Product

- Delete Product

- View Product

Use professional modal forms.

Product fields:

- Product Name

- SKU

- Category

- Quantity

- Minimum Stock

- Warehouse Location

- Unit Price

- Supplier

Validate all required fields.

Prevent duplicate SKUs.

Ask for confirmation before deleting.

---

STOCK IN

Create a dedicated Stock In page.

Form:

Product

Quantity

Supplier

Date

Reference Number

Notes

When submitted:

1. Validate input.

2. Find the product.

3. Increase inventory quantity.

4. Create a transaction.

5. Save data to LocalStorage.

6. Update dashboard.

7. Update charts.

8. Update alerts.

9. Show success notification.

Example:

Current stock = 100

Stock In = 25

New stock = 125

---

STOCK OUT

Create a dedicated Stock Out page.

Fields:

Product

Quantity

Destination/Customer

Date

Order/Reference Number

Notes

When submitted:

1. Validate input.

2. Check available stock.

3. Prevent negative inventory.

4. Decrease inventory.

5. Create transaction.

6. Save to LocalStorage.

7. Update dashboard.

8. Update charts.

9. Update alerts.

10. Show success notification.

Example:

Current stock = 100

Stock Out = 30

New stock = 70

If Stock Out = 150:

Reject the transaction and display:

"Insufficient stock available."

---

ALERT SYSTEM

Create an Alerts page.

Automatically detect:

LOW STOCK

quantity <= minimumStock

OUT OF STOCK

quantity === 0

Show:

- Product

- SKU

- Current quantity

- Minimum quantity

- Location

- Alert severity

Provide clear visual distinction between low-stock and out-of-stock products.

Dashboard alert counts must update automatically.

---

REPORTS

Create a clean Reports page.

Include:

- Inventory Summary

- Stock Movement

- Category Analysis

- Low Stock Report

- Inventory Value

Allow filtering by:

- Date

- Category

- Status

If practical, add:

Export CSV

The exported CSV must contain actual inventory/transaction data.

---

LOCAL STORAGE DATABASE

Use LocalStorage as the application's persistence layer.

Store:

products

transactions

settings

Use structured JSON.

Create reusable functions such as:

saveData()

loadData()

addProduct()

updateProduct()

deleteProduct()

stockIn()

stockOut()

calculateDashboard()

calculateStockStatus()

getLowStockItems()

Do not duplicate business logic across multiple pages.

---

INITIAL SAMPLE DATA

On first launch only, populate realistic sample data.

Create approximately 12–15 products.

Categories:

- Electronics

- Office Supplies

- Packaging

- Hardware

- Safety Equipment

Include realistic:

SKU

Product name

Quantity

Minimum stock

Location

Price

Supplier

Also create several sample transactions so charts and recent activity look realistic.

Do not overwrite user data after the first launch.

---

SEARCH AND FILTERING

Inventory search must work instantly.

Search by:

- Product name

- SKU

- Category

- Location

Filters:

- Category

- Stock status

Allow filters to work together.

---

NOTIFICATIONS

Implement toast notifications.

Examples:

✅ Product added successfully

✅ Stock updated successfully

✅ Stock In recorded

✅ Stock Out recorded

❌ Insufficient stock

❌ Duplicate SKU

❌ Required field missing

Notifications should be clear but not intrusive.

---

ERROR HANDLING

Handle:

- Empty forms

- Invalid quantities

- Negative quantities

- Duplicate SKUs

- Missing products

- Insufficient stock

- Invalid prices

- Corrupted LocalStorage data

The application should never crash because of invalid user input.

---

UI/UX QUALITY

Make this look like a real SaaS product.

Use:

- Consistent typography

- Consistent spacing

- Professional icons

- Rounded cards

- Clean tables

- Clear hierarchy

- Hover states

- Focus states

- Empty states

- Confirmation dialogs

- Toast notifications

Use a restrained professional color system.

Use color meaning consistently:

Green = healthy/success

Yellow/amber = warning

Red = critical/error

Blue/neutral = information

Do not overuse colors.

---

RESPONSIVENESS

The application must work properly at:

Desktop

Tablet

Mobile

Tables should remain usable on small screens.

Cards should automatically resize.

Sidebar should collapse on mobile.

---

ACCESSIBILITY

Use:

- Semantic HTML

- Proper labels

- Keyboard-accessible buttons

- Visible focus states

- Good text contrast

- Descriptive button labels

---

SOURCE CODE QUALITY

This requirement is extremely important.

Generate clean, editable, understandable source code.

Organize the project logically.

Separate:

UI

Business logic

Storage logic

Chart logic

Utility functions

Use meaningful names.

Avoid:

- Massive duplicated code

- Unused code

- Fake functionality

- Hard-coded statistics

- Unnecessary dependencies

- Obfuscated code

Every major feature must be implemented in the source code.

---

IMPORTANT DEMONSTRATION FLOW

The following scenario MUST work perfectly:

1. Open Dashboard.

2. Show inventory statistics.

3. Open Inventory.

4. Add a new product.

5. Product appears immediately.

6. Open Stock In.

7. Add 50 units.

8. Inventory quantity increases by 50.

9. Dashboard statistics update.

10. Open Stock Out.

11. Remove 20 units.

12. Inventory quantity decreases by 20.

13. Dashboard updates again.

14. Reduce a product below its minimum stock.

15. Low-stock alert appears automatically.

16. Refresh the browser.

17. Data remains saved.

This is the most important end-to-end test.

---

DEMO DATA

Make the initial dashboard visually impressive.

Use realistic example products such as:

Wireless Mouse

Mechanical Keyboard

USB-C Cable

Packing Tape

Cardboard Box

Safety Gloves

Barcode Labels

Office Paper

LED Monitor

Power Adapter

Storage Container

Bubble Wrap

Network Cable

Safety Helmet

Printer Cartridge

Use different quantities and minimum stock values so the alerts and charts are meaningful.

---

PERFORMANCE

Keep the application fast.

Do not add unnecessary libraries.

Do not make unnecessary network requests.

The application should work even without an internet connection after required assets are loaded.

---

FINAL QUALITY CHECK

Before considering the project complete, test:

[ ] Dashboard loads

[ ] Inventory loads

[ ] Add product works

[ ] Edit product works

[ ] Delete product works

[ ] Search works

[ ] Filters work

[ ] Stock In works

[ ] Stock Out works

[ ] Negative stock is prevented

[ ] Low-stock detection works

[ ] Dashboard statistics update

[ ] Charts update

[ ] LocalStorage persists data

[ ] Refresh does not erase data

[ ] Responsive layout works

[ ] Notifications work

[ ] No major console errors

[ ] All navigation buttons work

Fix any discovered problems before finishing.

---

FINAL INSTRUCTION

Prioritize FUNCTIONALITY first and VISUAL POLISH second.

Do not stop after generating the UI.

Do not create a prototype where buttons only look functional.

Build a complete working MVP.

The final application should feel like a real warehouse product that could be presented confidently as:

STOCKNOVA

Smart Warehouse Management System

After implementation, provide a clear explanation of the project structure and identify where the main source-code files and business logic are located.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3ffb134-c061-4533-8eb2-07f76f2d4ba6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
