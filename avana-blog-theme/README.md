# Avana Surgical Blog Theme

A lightweight, custom WordPress blog theme for Avana Surgical Systems. Designed to match the existing Avana brand guidelines with professional medical device styling.

## Features

- ✨ **Lightweight & Fast** - No heavy frameworks or page builders
- 🎨 **Brand-Consistent** - Matches Avana's color palette and typography
- 📱 **Fully Responsive** - Mobile-optimized design
- 🔍 **SEO-Friendly** - Proper semantic HTML and structured data
- ♿ **Accessible** - WCAG 2.1 compliant
- 🎯 **WordPress Native** - Uses WordPress standards and best practices
- 📝 **Rich Blog Features** - Category, tags, author pages, comments
- 🖼️ **Featured Images** - Optimized image handling
- 🔗 **Navigation Menus** - Customizable header and footer menus
- 📊 **Reading Time** - Automatic reading time calculation

## File Structure

```
avana-blog-theme/
├── style.css                 # Theme stylesheet and meta info
├── functions.php            # Theme setup and hooks
├── header.php              # Site header and navigation
├── footer.php              # Site footer
├── home.php                # Blog archive listing
├── single.php              # Single blog post
├── page.php                # Single page
├── index.php               # Fallback template
├── js/
│   └── navigation.js       # Theme JavaScript
└── README.md               # This file
```

## Installation

### Prerequisites
- WordPress 5.0 or higher
- PHP 7.2 or higher

### Installation Steps

1. **Download the Theme**
   - Extract `avana-blog-theme.zip` to get the theme folder

2. **Upload to WordPress**
   - Via XAMPP/Local:
     - Place the `avana-blog-theme` folder in `/wp-content/themes/`
     - Go to WordPress Admin → Appearance → Themes
     - Activate "Avana Surgical Blog" theme

3. **Configure Theme Settings**
   - Go to Appearance → Customize
   - Upload your logo (optional - falls back to site title)
   - Set featured image as default thumbnail

4. **Set Up Menus** (Optional)
   - Go to Appearance → Menus
   - Create a menu and assign it to "Primary Menu"
   - Create a footer menu and assign to "Footer Menu"

5. **Create Blog Posts**
   - Go to Posts → Add New
   - Add title, content, featured image
   - Assign categories and tags
   - Publish!

## Customization

### Colors

Edit the color variables in `style.css`:

```css
:root {
    --color-primary: #243447;       /* Dark blue-gray */
    --color-bg: #F4F4F2;            /* Cream background */
    --color-accent: #B18C57;        /* Mustard gold */
    --color-text: #1F1F1F;          /* Dark charcoal */
    --color-muted: #6C6C6C;         /* Medium gray */
    /* ... more colors ... */
}
```

### Typography

The theme uses Google Fonts:
- **Headers**: Playfair Display (serif, 600-700 weight)
- **Body**: DM Sans (sans-serif, 400-700 weight)

To change fonts, edit the `@import` in `style.css` and update the `font-family` declarations.

### Layout

Main content width is set to 1200px. Edit `.container` in `style.css`:

```css
.container {
    max-width: 1200px;  /* Adjust width here */
    margin: 0 auto;
    padding: 0 24px;
}
```

### Blog Grid

The blog listing (home.php) displays 3 columns on desktop, 2 on tablet, 1 on mobile:

```css
.blog-grid {
    grid-template-columns: repeat(3, 1fr);  /* 3 columns */
}

@media (max-width: 968px) {
    .blog-grid {
        grid-template-columns: repeat(2, 1fr);  /* 2 columns */
    }
}
```

## Template Hierarchy

WordPress uses this order to display content:

1. `home.php` - Blog archive
2. `single.php` - Single blog post
3. `page.php` - Static pages
4. `index.php` - Fallback for all content

## Adding Features

### Add Custom Post Types

In `functions.php`:

```php
function avana_blog_theme_register_post_types() {
    register_post_type( 'resource', array(
        'public' => true,
        'label' => 'Resources',
    ) );
}
add_action( 'init', 'avana_blog_theme_register_post_types' );
```

### Add Custom Taxonomies

```php
function avana_blog_theme_register_taxonomies() {
    register_taxonomy( 'resource_category', 'resource', array(
        'label' => 'Resource Categories',
    ) );
}
add_action( 'init', 'avana_blog_theme_register_taxonomies' );
```

### Add Theme Support

`functions.php` already supports:
- `title-tag` - Dynamic page titles
- `post-thumbnails` - Featured images
- `custom-logo` - Custom site logo
- `html5` - HTML5 markup
- `responsive-embeds` - Responsive video/embed sizes

Add more with `add_theme_support()`.

## Mobile Optimization

The theme is optimized for all screen sizes:

- **Desktop**: 1200px+ (3-column layouts)
- **Tablet**: 640px-968px (2-column layouts)
- **Mobile**: 320px-640px (1-column layouts)

All CSS is mobile-first with media queries at 968px and 640px breakpoints.

## Performance Tips

1. **Compress Images**
   - Use JPEG for photos, PNG for graphics
   - Aim for images under 200KB
   - WordPress will create thumbnails automatically

2. **Optimize Database**
   - Use a caching plugin (WP Super Cache, W3 Total Cache)
   - Clean up old revisions: install "WP-Optimize"

3. **Enable GZIP Compression**
   - Add to `.htaccess`:
     ```apache
     <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
     </IfModule>
     ```

4. **Minify CSS/JavaScript**
   - Use a plugin like "Autoptimize"

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 12+
- Edge 18+
- iOS Safari 12+
- Chrome Android

## Accessibility

The theme follows WCAG 2.1 Level AA standards:

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1
- Screen reader friendly

Test with:
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Support & Customization

### Common Questions

**Q: How do I add a logo?**
A: Go to Appearance → Customize → Site Identity → Logo

**Q: How do I change the blog posts per page?**
A: Go to Settings → Reading → Blog pages show at most [X] posts

**Q: How do I add a sidebar?**
A: Edit `home.php` and `single.php` to include `get_sidebar()` before the closing `</main>`

**Q: Can I use plugins?**
A: Yes! The theme supports all standard WordPress plugins. Avoid page builders (Elementor, Divi) for best performance.

## Troubleshooting

### Theme Not Showing
- Clear WordPress cache
- Deactivate all plugins temporarily
- Switch to a default theme (Twenty Twenty-Four), then back
- Check PHP errors in `/wp-content/debug.log`

### Images Not Displaying
- Regenerate thumbnails: Install "Regenerate Thumbnails" plugin
- Check image permissions in `/wp-content/uploads/`

### Navigation Not Working
- Ensure you've assigned a menu to "Primary Menu"
- Or menus will auto-generate from pages

### Comments Not Showing
- Go to Settings → Discussion → Enable Comments
- Check page/post settings: Allow Comments

## Code Standards

This theme follows:
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [HTML5 Best Practices](https://www.w3.org/TR/html5/)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)

## License

GPL v2 or later. See LICENSE file.

## Credits

**Theme Design**: Based on Avana Surgical Systems brand guidelines
**Colors**: Avana Surgical color palette
**Typography**: DM Sans (Google Fonts), Playfair Display (Google Fonts)
**Icons**: SVG social media icons

## Changelog

### Version 1.0.0
- Initial release
- Blog listing page
- Single post page
- Static pages support
- Responsive design
- Mobile optimization
- Sticky header
- Reading time calculation
- Author bio box
- Post navigation
- Category/Tag support
- Comment support

## Version History

All features are stable and tested. No breaking changes planned.

---

**Built with ❤️ for Avana Surgical Systems**

For questions or custom modifications, contact your developer.
