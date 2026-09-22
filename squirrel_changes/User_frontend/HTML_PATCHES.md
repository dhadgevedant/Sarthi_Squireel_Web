# HTML Patches — Squirrel Nuts User Frontend

Apply these find-and-replace changes to the indicated files.

---

## index.html — §1.3 key rename (overlay images)

**FIND** (lines ~72–73):
```html
<img data-image-key="aboutStoryMain"
<img data-image-key="aboutStoryOver"
```

**REPLACE WITH:**
```html
<img data-image-key="homeJarImage"
<img data-image-key="homeProteinImage"
```

---

## about.html — §1.3 key rename (overlay images)

**FIND** (lines ~35–36 inside "Why Choose Squirrel Nuts?"):
```html
<img data-image-key="aboutStoryMain"
<img data-image-key="aboutStoryOver"
```

**REPLACE WITH:**
```html
<img data-image-key="storyJarImage"
<img data-image-key="storyProteinImage"
```

---

## index.html — §5.7 dynamic category tiles

**FIND** the static category tiles section (currently 6 hard-coded `<a class="category-tile">` elements). Replace the **entire container's contents** with a single empty `<div>` that JS will populate:

```html
<!-- BEFORE: 6 static tiles -->
<a href="shop.html" class="category-tile"> ... </a>
<a href="shop.html" class="category-tile"> ... </a>
... (×6)

<!-- AFTER: single dynamic container -->
<div id="categoryTilesGrid">
  <!-- Populated by renderHomepageCategoryTiles() in app.js -->
</div>
```

Make sure the parent section keeps its existing class/id so CSS still applies.

---

## Announcement bar static fallback — ALL pages
### (index.html, shop.html, about.html, contact.html, faq.html, cart.html, checkout.html, product.html)

**FIND** in each file (exact text varies per page):
```html
<div class="announce" id="announceBar">Pan India delivery...</div>
```
or similar plain-text content inside `#announceBar`.

**REPLACE WITH** (add truck SVG inline so it shows before JS loads):
```html
<div class="announce" id="announceBar">
  <svg class="truck-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
  Pan India Delivery Available &middot; <span>📞 +91 70833 73681</span>
</div>
```

---

## Footer links — ALL pages
### (index.html, shop.html, about.html, contact.html, faq.html, cart.html, checkout.html, product.html)

### Policy links
**FIND:**
```html
<a href="#">Shipping Policy</a>
<a href="#">Returns & Cancellation</a>
<a href="#">Privacy Policy</a>
```
**REPLACE WITH:**
```html
<a href="shipping-policy.html">Shipping Policy</a>
<a href="returns-cancellation.html">Returns &amp; Cancellation</a>
<a href="privacy-policy.html">Privacy Policy</a>
```

### Contact links (add mailto/tel wrappers if missing)
**FIND** plain text (no anchor):
```html
connect@squirrelnuts.in
+91 70833 73681
```
**REPLACE WITH:**
```html
<a href="mailto:connect@squirrelnuts.in">connect@squirrelnuts.in</a>
<a href="tel:+917083373681">+91 70833 73681</a>
```

### Shop column category links — after §5 is done
Update each hard-coded `href="shop.html"` in the footer's Shop column to include the category slug:
```html
<a href="shop.html?category=cookies">Cookies</a>
<a href="shop.html?category=spreads">Spreads &amp; Butters</a>
<a href="shop.html?category=bars">Bars</a>
<a href="shop.html?category=cakes">Cakes</a>
<a href="shop.html?category=giftbox">Gift Hampers</a>
<a href="shop.html?category=trailmix">Trail Mix</a>
```
