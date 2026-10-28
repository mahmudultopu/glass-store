# SHADEO: Announcements, pop-ups and emails

## Announcement bar messages (rotate 3 at a time)
**Always-on**
- `FREE DELIVERY ON ORDERS OVER TK 3,000 · CASH ON DELIVERY AVAILABLE`
- `BUY 2, GET 15% OFF · MIX & MATCH ANY FRAMES`
- `PRESCRIPTION GLASSES FROM TK 3,490 · LENSES INCLUDED`
- `100% UV400 PROTECTION ON EVERY PAIR`

**Campaign**
- `NEW DROP: THE MONSOON EDIT IS HERE →`
- `EID SALE: UP TO 30% OFF · ENDS SUNDAY`
- `11.11 MEGA SALE: EXTRA 11% OFF WITH CODE SHADE11`
- `LAUNCH WEEK: 15% OFF EVERYTHING + FREE DELIVERY`

---

## Welcome pop-up (Shopify Forms)
- **Trigger:** after 8 seconds or on exit intent, once per visitor. Don't show on mobile until 50% scroll.
- **Heading:** `WAIT, TAKE 10% OFF`
- **Text:** `Join the SHADEO list and get 10% off your first pair. Plus early access to new drops.`
- **Field:** Email or phone number
- **Button:** `GET MY 10%`
- **Small print:** `One-time use. No spam, unsubscribe anytime.`
- **Success message:** `You're in! Use code WELCOME10 at checkout. We've also sent it to you.`

## Newsletter section (homepage + footer)
- **Heading:** `GET 10% OFF YOUR FIRST PAIR`
- **Text:** `New drops, private sales and style tips. No spam, just good frames.`
- **Button:** `UNLOCK 10%`

## Welcome email (sent right after signup)
- **Subject:** `Your 10% off is inside 👓`
- **Preview text:** `Welcome to SHADEO. Here's your code.`
- **Body:**
  > **Welcome to the SHADEO crew.**
  >
  > Here's your code for 10% off your first order:
  >
  > ## WELCOME10
  >
  > Not sure where to start? Our bestsellers are a safe bet, or take the 60-second frame quiz to find your perfect shape.
  >
  > `[SHOP BESTSELLERS]`
  >
  > Free delivery over Tk 3,000 · Cash on Delivery · 7-day easy returns
  >
  > See you around,
  > Team SHADEO

---

## Abandoned checkout emails (Klaviyo or Shopify Email)

### Email 1: sent 1 hour after
- **Subject:** `Did something catch your eye? 👀`
- **Preview:** `Your frames are waiting in your cart.`
- **Body:**
  > **You left something good behind.**
  >
  > Your SHADEO frames are still in your cart, but popular styles sell out fast.
  >
  > `{{ cart items with images }}`
  >
  > `[COMPLETE MY ORDER]`
  >
  > Questions about size or lenses? Reply to this email or WhatsApp us; a real human will answer.

### Email 2: sent 24 hours after
- **Subject:** `Still thinking it over?`
- **Preview:** `Here's why 1,000s of customers chose SHADEO.` *(use only once it's true; otherwise: "Here's why people love SHADEO.")*
- **Body:**
  > **We get it: frames are personal.**
  >
  > So here's what you get with every SHADEO order:
  > - ✅ 100% UV400 protection, tested
  > - ✅ Cash on Delivery: check before you pay
  > - ✅ 7-day easy returns
  > - ✅ 6-month warranty
  >
  > `{{ one real customer review }}`
  >
  > `[RETURN TO MY CART]`

### Email 3: sent 72 hours after
- **Subject:** `10% off, just for you (expires in 48h)`
- **Preview:** `Last chance to grab your frames.`
- **Body:**
  > **Okay, we'll sweeten the deal.**
  >
  > Use code **COMEBACK10** for 10% off your cart. It expires in 48 hours.
  >
  > `{{ cart items }}`
  >
  > `[CLAIM MY 10%]`
  >
  > After this, your cart will be cleared to make room for the next drop.

*(Create the discount code `COMEBACK10`: 10% off, one use per customer, so the code in email 3 works.)*

**SMS version (if using local SMS):**
`SHADEO: Your frames are waiting! Complete your order & get 10% off with COMEBACK10 (48h only): [short link]`

---

## Post-purchase emails
1. **Order shipped:** `Your SHADEO frames are on the way 🚚` + tracking link + care tips
2. **7 days after delivery: review request:** `How are your new frames?` (Judge.me sends this automatically) + "Upload a photo and get 100 loyalty points"
3. **30 days after: referral:** `Give 10%, get 10%`, with the customer's personal referral link
