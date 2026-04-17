# Module 13 — Video Script
# "Three Challenging Concepts in RocketApp"
# Target length: 7–9 minutes

---

## INTRO (~30 seconds)

Hi, I'm Charles, and this is my walkthrough of three concepts I found most
challenging while building Module 13 of RocketApp — a food delivery app built
with React Native, Expo Router, and a Java Spring Boot backend.

The three concepts I'll cover are:
1. The account selection screen for dual-role users
2. The account management screens with role-specific API endpoints
3. The order confirmation modal with multi-state UI and notification preferences

Let's jump in.

---

## CONCEPT 1 — Account Selection Screen (~2.5 minutes)

### What it is
RocketApp allows a single user account to hold both a customer role and a courier
role at the same time. Most apps lock you into one role, but this one doesn't.
So when someone who has both roles signs in, the app needs to ask: which role do
you want to use right now?

That's what the account selection screen does. It shows two cards — Customer and
Courier — and routes you into the right part of the app based on your choice.

### Where to look
[Open `client/app/(auth)/account-selection.tsx`]

This is the screen itself. It's pretty simple visually — two big cards. When you
tap one, it calls `setActiveRole` from the auth context, then uses
`router.replace` to navigate to the appropriate tab layout.

The key word there is `replace`, not `push`. Push adds a screen on top of the
stack, so you could press Back and return. Replace swaps the current screen out
entirely. That's important here — once you've selected a role, you shouldn't be
able to hit Back and land on the selection screen again mid-session.

### The real challenge — the auth guard
[Open `client/app/_layout.tsx`, lines 27–37]

This is where the complexity actually lives. The auth guard is a `useEffect`
that runs whenever `isSignedIn`, `isLoading`, `customerId`, `courierId`, or
`activeRole` changes.

There are three valid paths:
- Customer only → go straight to the restaurant tabs
- Courier only → go straight to the courier tabs
- Both roles, but no active role chosen yet → show the selection screen

Getting the condition `isDualRole && activeRole === null` right was tricky
because the state values don't all arrive at the same time. `isLoading` starts
as `true` to prevent any redirect firing before AsyncStorage has finished loading
the saved session. If you miss that gate, the app redirects to login on every
cold start — even with a valid token — because `isSignedIn` is still false when
the effect first runs.

That interplay between `isLoading` and the role logic is what made this the most
architecturally challenging piece.

---

## CONCEPT 2 — Account Management Screens (~2.5 minutes)

### What it is
Both customers and couriers have an Account tab where they can see and update
their role-specific email address and phone number. The primary login email is
displayed as read-only — it's the one they use to log in and can't be changed
here. The role email and phone are editable and save back to the database.

### The first challenge — API endpoint conventions
[Open `client/services/accountService.ts`]

The GET and PUT endpoints follow opposite patterns, and getting them mixed up
caused silent failures that were hard to debug.

The GET uses a query parameter: `/api/account/{id}?type={user_type}`. That type
tells the server which role record to load — customer or courier.

The PUT does NOT have a type parameter: `/api/account/{id}`. The request body
carries the updated email and phone, and the server determines the record from
the body content and the authenticated session.

I had these backwards at first. The GET was missing the type and returning the
wrong data, and the PUT was sending a type that the server ignored. Fixing it
required reading the API spec carefully and testing each endpoint in isolation.

### The second challenge — one component, two roles
[Open `client/components/AccountForm.tsx`]

Rather than writing a separate screen for customers and a separate screen for
couriers, I built a single `AccountForm` component that accepts a `role` prop.

[Show `client/app/(tabs)/account.tsx` and `client/app/(courier)/account.tsx`
side by side]

Both account screens are just three lines — they render `AccountForm` and pass
`role="customer"` or `role="courier"`. All the logic lives in the shared
component.

Inside AccountForm, that role prop does three things:
- Selects the right label set — "Customer Email" vs "Courier Email"
- Passes `role` to the GET request so the correct data is fetched
- Reads `account.customer` or `account.courier` from the response

This kind of prop-driven branching keeps the code DRY but you have to be careful
that every branch is covered and that you're not accidentally using the wrong
data in the wrong role context.

---

## CONCEPT 3 — Order Confirmation Modal (~2.5 minutes)

### What it is
When a customer has items in their cart and taps "Create Order," a modal slides
up showing the order summary — each item, quantity, and price — plus a total.
There are also two checkboxes: one to receive an email confirmation, one to
receive an SMS. After the customer taps Confirm, the modal handles the API call
and shows either a success or error result.

### The first challenge — four UI states
[Open `client/components/ConfirmationModal.tsx`]

The modal uses a `state` variable that can be `idle`, `processing`, `success`,
or `error`. Each state controls a completely different set of visible elements.

In `idle` you see the order summary, checkboxes, Cancel and Confirm buttons.
In `processing` the Cancel button disappears, the Confirm button becomes a
spinner with "Processing Order…", and the checkboxes are disabled.
In `success` the buttons disappear entirely and a green checkmark replaces them.
In `error` a red circle and message appears, and the user can try again.

[Scroll to the snapshot pattern — around line 41]

There's one subtle problem: when the order is placed successfully, the parent
screen clears the cart. But the modal is still visible at that point — it needs
to show the order summary during processing and on the success screen. If I read
directly from `items` and `totalPrice` props, they go blank the moment the cart
is cleared.

The fix is this snapshot: at the moment the user taps Confirm, I copy the current
items and total into local state. The modal then renders from the snapshot, not
the live props. The live values can change without affecting what the user sees.

### The second challenge — notification field names
[Open `client/app/(tabs)/(restaurant)/[id].tsx`, lines 103–116]

The order POST body needs to include `sendEmail` and `sendSMS` as booleans. The
casing matters — `sendSMS` is all caps for SMS, and everything is camelCase.

When I first wired this up I used snake_case — `send_email` and `send_sms` —
which is what the rest of the API uses for its response fields. The server
silently ignored those fields, so notifications never fired. The fix was simple
once I found it, but finding it required re-reading the API spec and comparing
field names character by character.

The checkbox state flows like this: the two `useState` booleans inside the modal
→ passed as arguments to `onConfirm(sendEmail, sendSms)` → received by
`handleConfirmOrder` in the screen → put into the request body as `sendEmail`
and `sendSMS`.

---

## OUTRO (~30 seconds)

Those are the three concepts I found most challenging in Module 13 — the
dual-role auth routing, the shared account form with its role-specific API
endpoints, and the multi-state confirmation modal with the snapshot pattern and
notification fields.

Each one pushed me to think more carefully about state timing, API contracts,
and component reuse. Thanks for watching.

---
# END OF SCRIPT
# Total estimated speaking time: ~7.5 minutes at a natural pace
