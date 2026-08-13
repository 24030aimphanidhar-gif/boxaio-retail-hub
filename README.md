# BOXAIO Retail Hub

BOXAIO Retailer Dashboard – Existing Website Integration

I already have an existing BOXAIO Grocery E-Commerce website in this project.

IMPORTANT — DO NOT CREATE A NEW PROJECT

Modify and extend my existing BOXAIO website.

Do NOT:

Create a separate retailer website

Replace the existing customer website

Remove existing customer functionality

Change the existing customer shopping flow unnecessarily

Create duplicate product/customer systems

Hardcode retailer data

Break any existing pages, navigation, authentication, cart, checkout, orders, location, or product functionality

The new retailer functionality must be integrated into the same BOXAIO website.

1. RETAILER LOGIN AND ROLE

Add a proper user-role system to distinguish between:

Customer

Retailer

Admin

When a user logs in, determine their role.

Customer

If:

role = customer

redirect them to the existing customer/home experience.

Retailer

If:

role = retailer

redirect them to:

/retailer

or the appropriate retailer dashboard route used by the existing project.

Admin

Do not change the existing admin functionality if it already exists.

The retailer must not be able to access admin-only functionality.

2. RETAILER DASHBOARD

Create a professional BOXAIO Retailer Dashboard.

The retailer dashboard should still look like part of the BOXAIO website.

Reuse the existing:

BOXAIO logo

Color palette

Typography

Buttons

Cards

Icons

Header styling

Responsive design

Existing UI components

Do not introduce an unrelated design system.

The dashboard should have:

Header

Show:

BOXAIO logo

Retailer Dashboard / Store name

Search

Notifications

Retailer profile

Logout

Example:

BOXAIO | Retailer Dashboard | 🔔 | Retailer Profile

3. RETAILER SIDEBAR

Create a responsive retailer navigation sidebar.

Sections:

Dashboard

Dashboard

Store Management

Products

Categories

Inventory

Offers & Discounts

Order Management

Orders

Delivery

Returns / Refunds

Business

Sales & Revenue

Customers

Reviews

Store

Store Profile

Store Location

Store Hours

Account

Notifications

Settings

Logout

On desktop, show a sidebar.

On mobile, convert it into a hamburger/drawer navigation.

4. DASHBOARD HOME

The retailer dashboard home should display important business information.

Create summary cards for:

Total Products

Example:
245

Today's Orders

Example:
38

Today's Sales

Example:
₹48,520

Low Stock Products

Example:
12

Pending Orders

Example:
8

Completed Orders

Example:
30

Do NOT permanently hardcode these values.

Create the structure so they can be connected to the actual database/backend.

5. SALES OVERVIEW

Add a sales analytics section.

Display:

Today's sales

Weekly sales

Monthly sales

Total revenue

Provide a clean interactive sales chart.

Allow:

Today | This Week | This Month | This Year

Use the existing project's chart/library if one already exists.

6. RECENT ORDERS

Display recent retailer orders.

Columns:

Order ID

Customer

Date

Products

Amount

Payment Method

Order Status

Action

Example:

#BX10231 | Customer 01 | ₹850 | Paid | Pending

Clicking an order should open a detailed order view.

7. ORDER MANAGEMENT

Create a dedicated retailer Orders page.

Order statuses:

Order Placed

Accepted

Preparing

Ready for Pickup

Picked Up

Delivered

Cancelled

Returned

Allow retailers to update order status according to their permissions.

Example:

Pending → Accept Order

Accepted → Start Preparing

Preparing → Ready

Do not allow invalid status transitions.

8. PRODUCT MANAGEMENT

Create a Products page where retailers can manage their own products.

Show:

Product image

Product name

Category

Price

GST

Stock

Status

Actions

Actions:

Add Product

Edit Product

View Product

Enable/Disable Product

Update Price

Update Stock

Add search and filters:

Search by product name

Category

In Stock

Low Stock

Out of Stock

Active

Inactive

9. ADD PRODUCT

Create an Add Product form.

Fields:

Product Name

Product Description

Category

Subcategory

Brand

Product Images

Selling Price

MRP

Discount

GST

Stock Quantity

Minimum Stock Level

Unit

Weight/Quantity

SKU

Barcode if supported

Product Status

Validation must be implemented.

Do not allow invalid prices or negative stock.

10. INVENTORY MANAGEMENT

Create an Inventory page.

Display:

Product

SKU

Current Stock

Minimum Stock

Maximum Stock

Stock Status

Last Updated

Stock statuses:

In Stock

Normal available quantity.

Low Stock

Quantity is below the configured minimum stock level.

Out of Stock

Quantity is zero.

Highlight low-stock products clearly.

Provide:

Update Stock

functionality.

11. OFFERS AND DISCOUNTS

Create an Offers & Discounts section.

Retailers should be able to view and manage offers that they are permitted to create.

Offer types can include:

Percentage Discount

Flat Discount

Buy X Get Y

Product-specific Offer

Category-specific Offer

Minimum Order Value Offer

Fields:

Offer Name

Offer Type

Discount Value

Applicable Products

Applicable Categories

Minimum Order Value

Start Date

End Date

Usage Limit

Status

Offer status:

Draft

Scheduled

Active

Expired

Disabled

Integrate this with the existing BOXAIO offer system if one already exists.

Do not create a conflicting second offer system.

12. STORE PROFILE

Create a Store Profile page.

Fields:

Store Name

Store Logo

Store Banner

Retailer Name

Phone Number

Email

Store Address

City

State

Pincode

Store Location

GST information

Store Status

Store status:

OPEN

CLOSED

TEMPORARILY UNAVAILABLE

13. STORE HOURS

Allow retailers to configure:

Monday opening/closing

Tuesday opening/closing

Wednesday opening/closing

Thursday opening/closing

Friday opening/closing

Saturday opening/closing

Sunday opening/closing

Allow:

Open 24 Hours

and

Closed

options.

14. STORE LOCATION

Integrate with the existing BOXAIO location functionality.

Do not create a completely separate location system if the project already has one.

Retailers should be able to set:

Store address

Latitude

Longitude

City

State

Pincode

Delivery radius

The retailer's products should be associated with their store/location.

15. PRODUCT AVAILABILITY BY LOCATION

This is very important for BOXAIO.

Different locations may have different:

Products

Stock

Prices

Availability

Offers

Therefore, do NOT make all retailer products globally available.

Products should be associated with the retailer/store/location.

Example:

Retailer A → Vijayawada Store → Products

Retailer B → Hyderabad Store → Products

If the customer selects a location, only products available for that location should be shown.

Integrate this with the existing BOXAIO location system.

16. SALES AND REVENUE

Create a Sales & Revenue page.

Display:

Gross Sales

Discounts

GST

Shipping-related amounts if applicable

Net Sales

Number of Orders

Average Order Value

Provide filters:

Today

Yesterday

This Week

This Month

Custom Date Range

Show appropriate charts and summary cards.

17. CUSTOMER INFORMATION

Create a retailer Customers page.

The retailer should only see customers/orders associated with that retailer according to the application's permissions.

Show:

Customer name

Number of orders

Total purchase value

Last order

Customer status

Do not expose sensitive customer information unnecessarily.

18. REVIEWS

Create a Reviews page.

Display:

Product

Rating

Review

Customer

Date

Status

Allow the retailer to respond to reviews if this is supported by the application's business rules.

19. NOTIFICATIONS

Create retailer notifications for:

New order

Order cancellation

Low stock

Out of stock

New review

Offer expiration

Store approval/rejection

Important BOXAIO announcements

Show unread notification count in the header.

20. RETAILER PROFILE

The retailer profile dropdown should contain:

My Profile

Store Profile

Settings

Notifications

Logout

Show the retailer/store name.

21. SECURITY AND PERMISSIONS

Implement role-based access control.

A retailer must only be able to access:

Their own store

Their own products

Their own inventory

Their own orders

Their own sales

Their permitted offers

Their permitted customer/order information

A retailer must NOT be able to:

View another retailer's inventory

Modify another retailer's products

Modify another retailer's orders

Access admin controls

Modify system-wide settings

Modify other retailers' stores

Do not rely only on frontend hiding. Backend/database authorization must also be considered.

22. RESPONSIVE DESIGN

The retailer dashboard must work properly on:

Desktop

Laptop

Tablet

Mobile

Desktop:

Sidebar + Main Content

Mobile:

Header + Hamburger Menu + Main Content

Tables should become responsive cards or horizontally scroll when required.

23. DATABASE / BACKEND

Before creating duplicate tables or data structures, inspect the existing project.

Reuse existing:

User authentication

Users table

Products table

Categories

Orders

Order items

Inventory

Offers

Locations

Stores

If a required structure does not exist, add the minimum required schema.

Suggested relationships:

User
  ↓
Retailer
  ↓
Store
  ↓
Products
  ↓
Inventory
  ↓
Orders
  ↓
Order Items


and:

Retailer
   ↓
Store
   ↓
Location


Do not duplicate existing tables unnecessarily.

24. EXISTING CUSTOMER WEBSITE MUST CONTINUE WORKING

After implementing the retailer system, verify that these existing customer functions still work:

Homepage

Navigation

Search

Product browsing

Product details

Categories

Cart

Wishlist

Checkout

Payment selection

Orders

Location selection

Product availability

Existing offers

Existing authentication

Do not remove or replace these features.

25. MAIN WEBSITE INTEGRATION

The retailer must access the system through the existing BOXAIO website.

The desired flow is:

BOXAIO MAIN WEBSITE
        ↓
       Login
        ↓
   Identify Role
     ↙       ↘
Customer     Retailer
   ↓            ↓
Customer     Retailer
Experience   Dashboard


Do not create a separate domain or separate website.

The retailer dashboard should be another protected section of the existing BOXAIO application.

26. UI DESIGN

Use the screenshots/reference design language I provided as inspiration.

The retailer dashboard should have:

Modern grocery/e-commerce appearance

Clean cards

Rounded corners

Professional spacing

BOXAIO branding

Clear status badges

Attractive charts

Consistent icons

Good typography

Responsive layout

Professional hover effects

Loading states

Empty states

Error states

Confirmation dialogs

Do not overuse animations.

Prioritize usability and fast navigation.

27. IMPORTANT IMPLEMENTATION RULE

Before making changes:

Inspect the existing project structure.

Identify the current framework.

Identify the current authentication system.

Identify the existing database/data structures.

Identify the current product/order/location systems.

Reuse existing components wherever possible.

Do not replace working functionality.

Add the retailer functionality incrementally.

Test existing customer functionality after every major change.

If something already exists in the project, extend it instead of creating a duplicate version.

28. FINAL RESULT

After implementation, I should have one BOXAIO website containing:

Customer Experience

BOXAIO
 ↓
Home
 ↓
Shop
 ↓
Products
 ↓
Cart
 ↓
Checkout
 ↓
Orders


Retailer Experience

BOXAIO
 ↓
Retailer Login
 ↓
Retailer Dashboard
 ├── Products
 ├── Inventory
 ├── Orders
 ├── Offers
 ├── Sales
 ├── Customers
 ├── Reviews
 ├── Store Profile
 ├── Store Location
 ├── Store Hours
 ├── Notifications
 └── Settings


Build this as a production-ready retailer module inside my existing BOXAIO application, not as a separate application.

Before finishing, test navigation, authentication/role routing, responsive layout, product management, inventory, order management, and the existing customer shopping flow.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7530cb13-e490-4735-bb8a-70d836957ac7).

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
