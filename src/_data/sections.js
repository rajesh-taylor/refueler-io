// Section sub-menus (Share-Upload-2 · 6 Oct 2026). One list per product section;
// section-nav.njk renders the list named by a page's `section`. The current item is
// matched on page.url, so each url must be exactly what Eleventy gives that page.
// Share: sign-in joins only when it exists (U-4). Harbourmaster never appears here.
module.exports = {
  share: [
    { label: "Send",   url: "/share/" },
    { label: "Plans",  url: "/share/plans/" },
    { label: "Status", url: "/share/status/" },
  ],
};
