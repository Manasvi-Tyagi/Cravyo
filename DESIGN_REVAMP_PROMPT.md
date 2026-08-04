# Cravyo — Complete UI/UX Revamp Brief

Design a complete, professional, implementation-ready UI/UX revamp for **Cravyo**, a mobile-first food discovery and ordering application.

Do not invent new product functionality. Every screen, control, state, label, data field, and interaction in the proposed design must map to functionality described in this brief. If a familiar food-delivery feature is not described here, do not include it.

Do not prescribe or select a color palette, font family, illustration style, photography style, logo redesign, or brand identity direction. Those decisions will be handled separately. Concentrate on product structure, layout, visual hierarchy, component behavior, responsive behavior, interaction design, accessibility, and complete screen states.

## 1. Product summary

Cravyo combines short-form vertical food videos with food ordering.

Customers can:

- Discover dishes through a vertical reel feed.
- Search available dishes.
- Like and unlike dishes.
- Save and unsave dishes.
- Read comments while signed out.
- Add, edit, delete, like, and unlike comments while authenticated.
- Visit a merchant's public store profile.
- Add products to a cart.
- Change cart quantities and remove products.
- Provide a delivery address and place an order.
- View their orders.
- Cancel eligible orders.

Merchants can:

- Register and sign in separately from customers.
- View their merchant home screen.
- Create a food product by uploading a video and entering product information.
- View their public profile and product grid.
- View incoming orders.
- Update supported order statuses.
- Add, edit, delete, like, and unlike comments.

The primary customer journey is:

```text
Discover a food reel
→ inspect the dish and merchant
→ like, save, or comment
→ add the dish to the cart
→ review the cart
→ enter a delivery address
→ place an order
→ view or cancel the order
```

The primary merchant journey is:

```text
Register or sign in
→ enter the merchant home area
→ upload a food product
→ review the public merchant profile
→ view incoming orders
→ update an order's status
```

## 2. Existing technical boundaries

The interface will be implemented in an existing application using:

- React
- React Router
- Axios
- Vite
- Custom CSS
- Express APIs
- Cookie-based authentication
- MongoDB application data
- Optional MySQL-backed authentication
- ImageKit-hosted product videos

The design must be practical to build with normal React components and CSS. Avoid effects or layouts that require a specialized native application environment.

The system currently supports two authenticated roles:

- `customer`
- `merchant`

Older interface wording may refer to a merchant as a “food partner.” Treat “merchant” and “food partner” as the same role. Use one consistent user-facing term throughout the proposed design and identify that terminology decision in the handoff.

## 3. Existing application routes

Design only for these existing routes and their supported states:

### Customer and public routes

```text
/
/search
/saved
/cart
/orders
/store/:id
```

### Customer authentication

```text
/user/login
/user/register
```

### Merchant authentication and operations

```text
/food-partner/login
/food-partner/register
/food-partner/home
/food-partner/:id
/create-food
/merchant/orders
```

Do not add routes for checkout, order details, settings, notifications, ratings, reviews, direct messages, payment methods, delivery tracking maps, coupons, support, password recovery, or restaurant editing because they are not currently supported as standalone application flows.

## 4. Design objective

Create a cohesive professional interface that makes the reel feed the distinctive center of the customer experience while ensuring that transactional screens remain clear and dependable.

The design should solve these structural goals:

- Make food discovery immediate and immersive.
- Keep dish identity, merchant identity, price, and ordering actions legible over video.
- Make customer and merchant areas clearly distinguishable without creating two unrelated products.
- Keep all primary mobile actions reachable with one hand.
- Make authentication requirements and API failures understandable.
- Ensure the cart and order interfaces prioritize comprehension over decoration.
- Create reusable layouts and components instead of treating every page as an isolated mockup.
- Scale deliberately from mobile to tablet and desktop.

Do not copy the exact structure of Instagram, TikTok, or an existing food-delivery product. Cravyo should have its own coherent interaction model.

## 5. Responsive layout requirements

Design mobile-first and demonstrate behavior at these approximate widths:

- Small mobile: 360 px
- Primary mobile: 390 px
- Large mobile: 430 px
- Tablet: 768 px
- Desktop: 1280–1440 px

Define:

- Page gutters at each breakpoint.
- Maximum content widths.
- Sticky and fixed regions.
- Safe-area treatment for mobile devices.
- Bottom-navigation clearance.
- Modal and bottom-sheet sizing.
- Responsive product grids.
- Reel behavior on wide screens.
- How mobile navigation adapts on desktop.

Do not simply stretch mobile screens to desktop width. On wide screens, maintain controlled reading widths and use available space to improve hierarchy without introducing unsupported panels or data.

## 6. Customer navigation

The customer application needs persistent navigation to exactly these destinations:

1. Home
2. Search
3. Saved
4. Cart
5. Profile/Orders destination

Current behavior of the fifth item:

- If authenticated, it opens Orders and may display the customer's first name.
- If unauthenticated, it opens Customer Login and displays a login label.

Navigation requirements:

- Clearly communicate the current route.
- Use text labels alongside icons.
- Remain legible over the reel screen.
- Respect mobile safe areas.
- Avoid covering reel actions or page content.
- Support keyboard focus and screen readers.
- Define its desktop adaptation.

Do not add notification, location, wallet, or account-settings destinations.

## 7. Home reel feed

The `/` route is the main customer discovery experience.

### Available product information

Each product can supply:

- Product video
- Product name
- Product description
- Product price
- Like count
- Save count
- Comment count
- Merchant name
- Merchant restaurant name
- Merchant image, when available
- Merchant identifier used to open the public store

### Existing reel behavior

- Products appear in a vertical scrolling list.
- Scrolling snaps between reels.
- The active video plays automatically.
- Videos outside the active viewport pause.
- Videos are muted and looped.
- A reel can be opened directly from Search by its product identifier.

### Required reel controls

- Like/unlike
- Open comments
- Save/unsave
- Add to cart
- Visit the merchant's store

### Design requirements

- Keep the video as the dominant element.
- Protect all text and controls from unpredictable video backgrounds.
- Establish a clear hierarchy between product name, description, price, merchant, ordering action, and social actions.
- Place controls within comfortable thumb reach.
- Show counts with their related actions.
- Provide immediate feedback after adding to cart.
- Provide understandable feedback when an action requires authentication.
- Prevent navigation from overlapping important reel content.
- Account for long product names and descriptions.
- Account for missing merchant images.
- Define video-loading and video-failure presentation.
- Define the experience when the feed is empty or cannot load.
- Include focus, pressed, disabled, and loading behavior for relevant controls.

Do not add sharing, ratings, delivery estimates, distance, cuisine tags, dietary tags, discount badges, sponsored labels, audio controls, following, or recommendation explanations. Those features are not currently available.

## 8. Search screen

The `/search` route searches existing food products.

### Existing behavior

- Search requests are debounced.
- Search is performed by the backend.
- Search currently matches product name and description.
- An empty query shows the available product feed.
- Results are presented as a video grid.
- Selecting a result opens the corresponding reel on the Home screen.

### Required screen contents

- Search input
- Search icon
- Clear-input affordance
- Loading state
- Product result grid
- No-results state
- Request-failure state
- Customer navigation

### Product tile information

- Video preview
- Product name
- An indication that the tile opens a video reel

Design the grid for mobile, tablet, and desktop. Handle long names, missing video previews, loading transitions, keyboard focus, and touch feedback.

Do not add recent searches, suggested searches, categories, filters, cuisine search, restaurant-name search, price filters, location search, voice search, or search-result sorting. They are not currently supported.

## 9. Public merchant store

The `/store/:id` route displays a public merchant profile.

The older `/food-partner/:id` route may reach the same profile experience.

### Available information

- Merchant name
- Restaurant name
- Merchant image, when available
- Address, when available
- Merchant's products
- Product videos
- Product names
- Product prices

### Design requirements

- Create a clear merchant identity section.
- Show available merchant information without reserving conspicuous empty space for missing fields.
- Present products in a responsive video grid.
- Make each product tile visually connected to the reel-based experience.
- Handle missing images gracefully.
- Include loading, empty-product, not-found, and request-failure states.
- Maintain a clear path back to customer discovery.
- Define mobile and desktop layouts.

Do not include ratings, reviews, opening hours, delivery times, fees, minimum orders, maps, phone actions, social links, menus separate from uploaded products, follow controls, or merchant saving. These are not currently supported.

## 10. Saved products

The `/saved` route shows products saved by the authenticated customer.

### Supported actions

- View saved products.
- Open a merchant's public store.
- Like or unlike a product.
- Remove a product from Saved.
- Open comments.
- Add a product to the cart where the current implementation exposes that action.
- Return to discovery when there are no saved products.

### Design requirements

- Clearly identify the page.
- Keep product video, name, merchant, price, and supported actions legible.
- Provide loading, empty, unauthenticated, and request-failure states.
- Ensure removing a saved product gives immediate feedback.
- Design responsive mobile and desktop arrangements.
- Reuse product and reel action patterns from Home where appropriate.

Do not add saved collections, folders, sharing, bulk management, reminders, or sorting controls.

## 11. Cart

The `/cart` route is available to authenticated customers.

### Available cart information and actions

- Product name
- Unit price
- Quantity
- Line total
- Cart total
- Increase quantity
- Decrease quantity
- Remove product
- Delivery address input
- Place order

### Design requirements

- Make quantity and pricing relationships immediately understandable.
- Provide clear quantity controls with adequate touch targets.
- Distinguish removing an item from decreasing its quantity.
- Present the cart total prominently.
- Make the delivery-address requirement clear before order placement.
- Define button states when the cart is empty, the address is missing, an order is being submitted, or a request fails.
- Provide an empty-cart state with a path back to Home.
- Handle long product names and large quantities.
- Design a useful wide-screen layout without adding unsupported pricing sections.

Do not add promo codes, delivery fees, taxes, discounts, tips, payment selection, delivery scheduling, item notes, restaurant grouping controls, or a separate checkout route.

## 12. Customer orders

The `/orders` route displays the authenticated customer's orders.

### Available order information

- Merchant information
- Ordered products
- Product quantity
- Product price
- Order total
- Delivery address
- Creation date
- Current status

### Supported statuses

- `PLACED`
- `PREPARING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

### Supported customer action

- Cancel an eligible order.

### Design requirements

- Present orders as an understandable history on one route.
- Make active and completed/cancelled statuses easy to scan without introducing unsupported filters.
- Show product quantities and totals clearly.
- Show the delivery address without dominating the card.
- Show cancellation only where the system permits it.
- Require clear confirmation before cancellation.
- Define loading, empty, unauthenticated, request-failure, cancellation-in-progress, and cancellation-failure states.
- Ensure every status is understandable without relying only on visual styling.

Do not add an order-detail route, map tracking, rider information, support chat, reorder, invoice download, ratings, refunds, payment status, or estimated arrival time.

## 13. Customer authentication

Design these screens:

- `/user/login`
- `/user/register`

### Customer login fields

- Email
- Password

### Customer registration fields

- Name
- Email
- Password

### Supported navigation

- Login to registration
- Registration to login
- Return to the application

### Required states

- Default
- Field validation
- Invalid credentials
- Existing-account conflict
- Submission in progress
- API failure
- Successful authentication and redirection

Include password visibility behavior only if it can be implemented as a local input control without changing backend functionality.

Do not add social authentication, phone authentication, one-time passwords, password recovery, confirm-password backend validation, terms checkboxes, onboarding questions, or profile-image upload.

## 14. Comments

Comments are opened from product reels and supported product presentations.

Design them as:

- A bottom sheet on mobile.
- A suitably constrained modal or side panel on larger screens.

### Public behavior

- Signed-out users can read comments.

### Authenticated behavior

Both customers and merchants can:

- Add comments.
- Like and unlike comments.
- Edit their own comments.
- Delete their own comments.

### Available comment information

- Author name
- Author image, when available
- Customer or merchant role
- Comment text
- Creation time
- Like count
- Whether the current account liked the comment
- Whether the current account owns the comment

### Design requirements

- Clearly identify merchant comments without making them dominate the discussion.
- Keep editing inline within the comment experience.
- Show edit and delete only for the comment owner.
- Confirm deletion.
- Keep the composer accessible when the keyboard opens.
- Provide loading, empty, request-failure, posting, editing, and unauthenticated-action states.
- Handle missing authors, missing avatars, long names, long comments, and the maximum supported comment length of 500 characters.
- Include appropriate focus management and dialog semantics.
- Make close behavior obvious.

Do not add replies, threads, mentions, reporting, moderation menus, pinned comments, image comments, sorting, or comment sharing.

## 15. Merchant authentication

Design these screens:

- `/food-partner/login`
- `/food-partner/register`

### Merchant login fields

- Email
- Password

### Merchant registration fields

- Name
- Restaurant name
- Phone
- Address
- Email
- Password

### Required states

- Default
- Field validation
- Invalid credentials
- Existing-account conflict
- Submission in progress
- API failure
- Successful authentication and redirection

The interface must make it unmistakable that this is merchant access rather than customer access while retaining the same overall product system.

Do not add document verification, business hours, bank details, tax information, multiple locations, social authentication, password recovery, or restaurant-image upload during registration.

## 16. Merchant home

The `/food-partner/home` route is the authenticated merchant's operational home.

Design only around information and actions currently represented in the application:

- Merchant or restaurant identity
- Merchant's uploaded food products
- Navigation to create a product
- Navigation to merchant orders
- Navigation to the merchant profile
- Merchant logout where currently exposed

### Design requirements

- Make creating a food product prominent.
- Present existing products as a responsive video grid or list.
- Provide loading, no-products, unauthenticated, and request-failure states.
- Provide clear routes to orders and profile.
- Keep the interface useful on mobile and desktop.

Do not add analytics, revenue, sales charts, performance trends, inventory, reviews, notifications, business settings, staff management, advertising, or summary metrics that the system does not provide.

## 17. Create food product

The `/create-food` route lets an authenticated merchant upload a product.

### Supported inputs

- Video file
- Product name
- Description
- Price

### Existing processing behavior

- The video is selected from the user's device.
- The backend accepts an upload of up to 50 MB.
- The backend compresses the video.
- The compressed video is uploaded to ImageKit.
- A product is created for the authenticated merchant.

### Design requirements

- Clearly communicate the video requirement and 50 MB limit before submission.
- Show the selected video's preview.
- Allow the local selection to be replaced before submission.
- Provide validation for required name, price, and video fields.
- Provide upload/processing progress communication without claiming an exact percentage unless the implementation supplies one.
- Distinguish uploading, backend processing, success, and failure.
- Prevent repeated submissions.
- Preserve entered information when a recoverable request fails.
- Design mobile and desktop layouts.

Do not add image uploads, categories, dietary tags, ingredients, cuisine, availability, stock, preparation time, discounts, variants, sizes, add-ons, thumbnails, scheduled publishing, or draft products.

## 18. Merchant profile

The `/food-partner/:id` route uses the merchant profile experience.

Use the same supported merchant information and product grid described for the public store. Clearly account for whether this route is reached by the merchant versus a customer, but do not introduce editing controls unless the existing route already exposes that exact action.

Supported information remains limited to:

- Merchant name
- Restaurant name
- Merchant image, when available
- Address, when available
- Uploaded products
- Product videos, names, and prices

## 19. Merchant orders

The `/merchant/orders` route shows orders containing the authenticated merchant's products.

### Available information

- Customer name
- Customer email
- Delivery address
- Ordered products
- Quantities
- Product prices
- Order total
- Creation date
- Current order status

### Supported merchant action

- Change the order to a valid supported status.

Supported statuses are:

- `PLACED`
- `PREPARING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

### Design requirements

- Make each order easy to scan.
- Make the current status unmistakable.
- Make valid next actions clear.
- Disable or hide invalid transitions based on current application behavior.
- Confirm consequential status changes where appropriate.
- Provide loading, empty, unauthenticated, request-failure, update-in-progress, and update-failure states.
- Handle long customer names, long addresses, multiple items, and large quantities.
- Design mobile cards and an appropriate wide-screen presentation using the same available data.

Do not add merchant filtering, search, analytics, printing, rider assignment, delivery maps, customer messaging, refunds, payment management, or export tools.

## 20. Reusable component system

Create an implementation-ready component inventory derived only from the supported product.

At minimum, specify reusable components for:

- Customer navigation
- Merchant navigation
- Page header
- Back action
- Primary action button
- Secondary action button
- Destructive action button
- Icon action button
- Loading button
- Text input
- Password input
- Search input
- Text area
- Video uploader
- Video preview
- Product reel
- Reel action group
- Product grid tile
- Merchant identity block
- Saved-product presentation
- Cart item
- Quantity control
- Cart summary
- Order card
- Order status indicator
- Comment sheet/modal
- Comment row
- Comment composer
- Inline comment editor
- Confirmation dialog
- Authentication-required message
- Loading skeleton
- Empty state
- Inline error
- Page-level error
- Transient success/error feedback

For every relevant component, define:

- Content structure
- Size and spacing relationships
- Default state
- Hover state where applicable
- Keyboard-focus state
- Pressed state
- Disabled state
- Loading state
- Error state
- Mobile behavior
- Desktop behavior
- Accessibility requirements

Do not prescribe colors or fonts in the component specifications.

## 21. Interaction requirements

Define implementation-ready interaction details for:

- Reel scroll snapping
- Active-video playback
- Like/unlike feedback
- Save/unsave feedback
- Add-to-cart feedback
- Opening and closing comments
- Comment submission
- Inline comment editing
- Comment deletion confirmation
- Search debounce and result loading
- Opening a selected search result in the reel feed
- Cart quantity changes
- Product removal
- Order placement
- Customer order cancellation
- Merchant order-status updates
- Authentication submission and redirection
- Video selection and upload processing

Use restrained motion and specify timing relationships only where helpful to implementation. Include a reduced-motion behavior. Do not make the design dependent on decorative animation.

## 22. Accessibility requirements

Target WCAG AA behavior.

The design must include:

- Keyboard-operable controls.
- Visible focus states.
- Meaningful control labels.
- Sufficient text and control contrast, without prescribing exact colors.
- Minimum practical touch targets.
- Dialog focus management.
- Escape-to-close behavior on desktop.
- Screen-reader labels for icon-only controls.
- Status text that does not rely exclusively on color.
- Announcements for important asynchronous results.
- Reduced-motion behavior.
- Support for browser zoom and increased text size.
- Sensible reading and focus order.
- Form errors connected to their fields.
- Disabled controls that communicate why an action is unavailable.
- Safe handling of mobile keyboards and device insets.

## 23. Required application states

For every applicable screen, design only the states the existing system can encounter:

- Initial loading
- Successful data display
- Empty data
- Request failure
- Unauthenticated access
- Expired authentication
- Submission in progress
- Disabled action
- Successful mutation feedback
- Failed mutation feedback

Specific cases to cover:

- Empty reel feed
- Failed video load
- Empty search results
- Empty merchant product grid
- Empty Saved page
- Empty cart
- Missing delivery address
- Empty customer order history
- Empty merchant order list
- No comments
- Missing profile image
- Product upload failure
- Product processing state
- Order cancellation failure
- Merchant status-update failure

Do not invent offline synchronization, drafts, background uploads, retry queues, or cached offline ordering.

## 24. Content requirements

Use concise, realistic sample content to demonstrate layout behavior. Sample data is permitted only to represent fields the system already supports.

Example product content:

- Butter Chicken Bowl — ₹329
- Truffle Mushroom Pizza — ₹449
- Korean Crispy Chicken — ₹299
- Mango Cheesecake — ₹229
- Paneer Tikka Wrap — ₹199
- Spicy Ramen — ₹279

Example merchant content:

- Ember & Spice
- Seoul Street Kitchen
- The Crust Society
- Bombay Bowl Co.
- Sweet Theory

Example interface copy:

- “Added to cart”
- “Saved”
- “No saved dishes yet”
- “Discover something worth craving”
- “Enter a delivery address to place your order”
- “Sign in to join the conversation”
- “No products uploaded yet”
- “Your order was cancelled”
- “The order status could not be updated”

Do not use sample ratings, discounts, delivery times, fees, nutritional data, location distances, payment information, or other unsupported values.

## 25. Required deliverables

Produce a complete design specification containing:

1. A concise UX rationale based on the supported Cravyo workflows.
2. An application information architecture using only the listed routes.
3. A customer and merchant navigation model.
4. High-fidelity mobile designs for every listed route.
5. Representative tablet adaptations.
6. Representative desktop adaptations.
7. A reusable component inventory.
8. Component anatomy and state specifications.
9. Layout measurements and spacing relationships.
10. Responsive rules.
11. Interaction specifications.
12. Loading, empty, error, unauthenticated, and success states.
13. Accessibility annotations.
14. A screen-to-component mapping.
15. A prioritized implementation sequence for the existing React application.
16. Developer handoff notes identifying reusable patterns and route-specific behavior.

Required screens:

- Home reel feed
- Search
- Public merchant store
- Saved products
- Cart
- Customer orders
- Customer login
- Customer registration
- Comments sheet/modal
- Merchant login
- Merchant registration
- Merchant home
- Create food product
- Merchant profile
- Merchant orders

## 26. Final quality audit

Before presenting the result, verify that:

- Every displayed field exists in this brief.
- Every interactive control maps to a supported action.
- Every proposed destination maps to an existing route.
- No unsupported food-delivery features were introduced.
- Customer and merchant roles remain distinct.
- The reel feed remains the principal discovery experience.
- Cart and order information is easy to understand.
- Mobile controls are reachable and do not overlap content.
- Long text and missing media are handled.
- Loading, empty, error, and unauthenticated states are included.
- Tablet and desktop layouts are intentional rather than stretched mobile screens.
- Components are practical to implement in React and custom CSS.
- Accessibility behavior is explicitly documented.
- No color palette or font family is prescribed.

Do not respond with only general recommendations. Produce the complete professional interface design, all listed screens, reusable components, interaction behavior, responsive specifications, state designs, and developer-ready annotations while remaining strictly within the supported Cravyo feature set.
