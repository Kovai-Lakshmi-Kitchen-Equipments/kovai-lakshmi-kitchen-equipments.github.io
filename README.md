# Kovai Lakshmi Grinders – Website

Live site: <https://kovailakshmi.in/> (custom domain; the repository is still `kovai-lakshmi-kitchen-equipments.github.io`)

This folder is the complete website. Everything in it is uploaded to the root of the
GitHub repository `kovai-lakshmi-kitchen-equipments.github.io` (branch `main`).
GitHub Pages publishes it automatically, usually within 1–2 minutes.

---

## 1. Folder structure

```
/ (root)
├── index.html                      Home page
├── 404.html                        "Page not found" page
├── about-us/index.html
├── gallery/
│   ├── index.html                  Photo groups (heading, then photos) – made by the admin's Gallery menu
│   └── images/[group]/             Photos uploaded in the Gallery menu
├── contact-us/index.html           Inquiry form + Google Map
├── privacy-policy/index.html
├── terms-and-conditions/index.html
├── search/index.html               Search results page
├── resources/
│   ├── index.html                  Blogs / articles / case studies (rebuilt by the admin)
│   ├── [post-address]/index.html   Each published post (made by the admin)
│   ├── images/[post-address]/      Images uploaded in the admin
│   └── admin/
│       ├── index.html              Owner's admin panel (not indexed by Google)
│       └── templates/              post.html, listing.html, gallery.html used by the admin
├── hotel-equipment/                Category page + one folder per product
├── bakery-equipment/               Category page + one folder per product
├── agri-machineries/               Category page + one folder per product
├── assets/
│   ├── css/site.css                Shared styles: header, footer, WhatsApp button, common parts
│   └── js/site.js                  Shared scripts: menu, dropdown, search, suggestions
│                                   + the Apps Script address (EXEC_URL) in ONE place
├── about-us.html, gallery.html, …  Forwarding pages: old addresses send visitors to the new ones
├── LOGO/, SLIDES/, CUSTOMERS/, CERTIFICATES/, KITCHENPRODUCTS/, SOCIAL MEDIAS/   existing images (unchanged)
├── search-index.json               Search data (products, pages and posts)
├── sitemap.xml                     For Google (posts are added automatically)
├── robots.txt
└── README.md                       This file
```

Every link and image uses the full address (`https://kovailakshmi.in/...`),
with spaces written as `%20`.

The Google Apps Script (backend) is **not** in this folder – it lives in the Google Sheet.
See `SETUP-GUIDE.md` that came with this delivery.

---

## 2. Adding or changing products

Product pages, category pages, the search data and the sitemap are generated from the
Excel file by the **site builder** (the `site-builder` folder delivered next to this one).

1. Open `site-builder/src/products.xlsx` and add a row (or edit one). Columns:
   Product Name · Product Description · Product Specifications · How to Use · Benefits ·
   Image Source · Video Embedded Code · Category.
   - Specifications: one per line as `• Name: Value`.
   - How to Use: numbered lines `1. …`; extra parts with a heading line ending in `:` (e.g. `Caution:`) followed by `• …` lines.
   - Benefits: `• Title: description` lines.
   - Image Source: the full image address, e.g. `https://kovailakshmi.in/KITCHENPRODUCTS/My machine.jpg`.
     Upload the image to `KITCHENPRODUCTS/` first and copy its name **exactly** (capital letters and extension matter).
   - Video: paste the YouTube "Embed" code. Add the video's upload date to `VIDEO_DATES` in `site-builder/gen/config.py`.
   - Category: `HOTEL AND KITCHEN EQUIPMENT`, `BAKERY EQUIPMENT` or `AGRI MACHINERIES`.
2. Download the repository from GitHub (Code → Download ZIP) and unzip it as `site-builder/repo`, then run
   `pip install openpyxl Pillow` once and `python3 site-builder/gen/build.py`. (The builder reads real image sizes from that copy.)
3. Upload the changed folders and files from `site-builder/site/` to GitHub: the new product folder, the
   category page, `index.html` if Popular Products changed, `search-index.json` and `sitemap.xml`.

> Upload the generated `search-index.json` and `sitemap.xml` only **after** downloading the latest copies from
> GitHub if posts were published in the meantime – the admin also updates these two files. The simplest way:
> after uploading, open the admin and click **Rebuild all posts**; it adds every post back into both files.

## 3. Adding a new product category

1. In `site-builder/gen/config.py` add the category to `CATEGORIES` and `CATEGORY_ORDER`, and write its
   intro in `CATEGORY_INTROS` (`site-builder/gen/build_products.py`).
2. Run the build. The menu, footer, every page, the post templates, search data and sitemap all update.
3. Upload the whole `site-builder/site/` folder to GitHub.
4. Open the admin and click **Rebuild all posts** so older posts get the new menu and footer.

The **Domestic Equipment** menu item has an empty link for now. When its page exists, set `DOMESTIC_HREF`
in `config.py` (or make it a real category as above) and rebuild.

## 4. Changing the menu, footer or design

Header, footer and WhatsApp button are generated from `site-builder/gen/common.py`; shared styles are in
`assets/css/site.css`. After a change: run the build, upload, then **Rebuild all posts** in the admin.

---

## 5. Admin guide for the shop owner (posts and gallery)

Open **<https://kovailakshmi.in/resources/admin/>** (bookmark it).

**Log in** – type your username and password. After 5 wrong tries, login is locked for 15 minutes.
You stay logged in while you work; you are logged out after 2 hours without activity, or when you close the tab.

**My Posts** – shows every post with its status:
- *Draft* – only you can see it.
- *Published* – live on the website.
- *Unpublished changes* – you edited a live post but haven't updated the website yet.

### Write a new post

1. Click **+ New post**. Type the **title** first – pictures are saved under the post's address.
2. Choose the **category**.
3. **Cover image** – must be exactly **1200 × 630 pixels**, **1 MB or smaller**, JPG/PNG/WebP. If it isn't,
   you'll see exactly what is wrong. The cover is also the picture shown when the post is shared on WhatsApp.
   Describe the cover in a few words.
4. **Choose a layout.** A layout adds ready-made, numbered sections that you fill in:

   | Layout | Sections it adds |
   |---|---|
   | Simple article | Text |
   | Zig-zag story | Text → Picture + text → Picture + text → Picture + text → Call-to-action (pictures alternate left, right, left) |
   | Picture cards | Text → Cards with pictures → Call-to-action |
   | Photo story | Text → Big picture → Text → Photo gallery |
   | Case study | Problem box → Solution box → Big picture → Result box → Customer quote → Call-to-action |
   | Video post | Text → YouTube video → Text → Call-to-action |

5. **Fill in each numbered section.** Every section is a box with its own fields, shown on the website in
   the same order. Section types:

   | Section | What you fill in | Options |
   |---|---|---|
   | Text | Heading (optional) and text | Background |
   | Picture + text | The picture **for this paragraph** (shown beside it), heading, text | Picture left / right / automatic zig-zag · size ½, ⅓, ⅔ · text at middle or top · background |
   | Big picture | One picture, description, caption | Text width / edge to edge / medium |
   | Photo gallery | Heading and many photos at once (each with a description and caption); visitors open them full screen | 2, 3 or 4 per row · background |
   | Cards with pictures | Up to 12 cards: picture, title, text, optional link (e.g. to a product page) | 2, 3 or 4 per row · shadow, outline or light-red cards · background |
   | YouTube video | Paste the YouTube link; the thumbnail shows so you know it is right | Background |
   | Customer quote | The words and who said them | – |
   | Highlight box | Heading and text | Note, Tip, Important, Problem, Solution, Result (each has its own colour) |
   | Call-to-action | Heading, one line, button text and link – or click **WhatsApp**, **Call** or **Contact page** | – |
   | Divider line | – | – |

   - **↑ ↓** move a section, **⧉** copies it, **🗑** deletes it (it asks first if the section has content).
     **+ Add section here** (between sections) and **+ Add section** (at the end) add any type.
   - The box above each picture says where it will appear, e.g. *"Picture for this paragraph – shown on the LEFT"*.
   - **Pictures:** choose a photo, pick a shape (wide 16:9, standard 4:3, square, tall 3:4 or the original shape),
     drag to choose what shows, zoom, describe it, then *Use this image*. It is saved up to 1200 px wide and
     1 MB or less automatically. Photo galleries keep each photo's own shape and make big photos smaller
     (up to 1600 px, 1 MB) automatically.
   - The **formatting bar** (bold, headings, lists, quote, alignment, link, table, undo) works on the text box you
     clicked last. Tick **Show a contents list** to list your headings at the top of the post.
6. **Google & sharing** (right side) – these fill in by themselves from your title and first paragraph,
   including the keywords. Green numbers mean a good length. The preview shows how the post may look on Google.

**Save as draft** – keeps your work without putting it on the website. While you write, your work is also
saved automatically every minute ("Saved ✓").

**Preview** – shows the post exactly as it will look, on top of the admin. Switch between **Phone**, **Tablet**
and **Computer** sizes. Click **← Exit preview** (or press Esc) to go straight back to where you were.

**Publish** – puts the post on the website. It first checks that every picture has a description and that no
section is left without its picture or with a wrong YouTube link, and tells you which section to fix.
You'll see *"Published! Your post will be live in about 1–2 minutes."* The post is added to the Resources page,
Google's sitemap and the site search automatically. Pictures you removed from the post are deleted from the website.

**Edit** – open any post, change it, then click **Update live post**. The original publish date stays and an
"Updated" date is added. (Saving a live post as a draft keeps the website unchanged until you update it.)

**Delete** – asks first, then removes the post, its pictures, and its place on the Resources page, sitemap and search.

### Gallery

**Gallery** (top menu) lists your photo groups. On the website's Gallery page each group shows its **heading**,
the optional short note, and then its photos; visitors click a photo to see it full screen.

1. **+ New photo group** – type the heading (e.g. *Hotel kitchen installation, Coimbatore*) and an optional note.
2. **+ Add photos** or drag photos onto the box – you can choose many at once (up to 80 per group). Big photos
   are made smaller automatically. Photos are saved as soon as they are uploaded.
3. Describe each photo in a few words (it starts with the group heading – change it to say what is in the photo),
   add a caption if you like, and use **← →** to change the order or **×** to remove a photo.
4. **Preview** shows the whole Gallery page with this group (Exit preview brings you back). **Publish** puts it on
   the website; later changes are kept as a draft until you click **Update live group**.
5. In the list, **↑ ↓** change the order of the groups on the Gallery page (new groups start at the top);
   **Delete** removes the group and its photos from the website.

### Other menus

**Categories** – add new ones (they appear as filter buttons on the Resources page), rename them (every post
in the category updates), or delete them (only when no posts use them).

**Rebuild all posts** – use this after the website's menu, footer or design has changed, so older posts and the
Gallery page match.

**Password** – change it any time from the **Password** menu. Forgot it? See the setup guide
("Reset the admin password").
