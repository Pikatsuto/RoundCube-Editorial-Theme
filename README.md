# Roundcube Editorial Theme

A true black dark theme for [Roundcube Webmail](https://roundcube.net/), based on the Elastic skin. Designed with a minimal, editorial aesthetic using the Source font family.

Compatible with the [identity_switch](https://github.com/toteph42/identity_switch) plugin.

## Screenshots

> *Coming soon*

## Features

- **True black palette** — OLED-friendly backgrounds (`#0a0a0a`, `#050505`, `#0e0e12`)
- **Source font family** — Source Serif 4 for headings, Source Sans 3 for body, Source Code Pro for monospace
- **Identity Switch support** — styled dropdown matching the dark palette
- **Always dark** — dark mode is always active, no light mode toggle needed
- **Responsive** — inherits Elastic's full responsive layout (desktop, tablet, phone)
- **Minimal "R." logo** — serif-styled logo with accent blue dot

## Color Palette

| Role       | Color     | Hex       |
|------------|-----------|-----------|
| Background | Main      | `#0a0a0a` |
| Background | Menu      | `#050505` |
| Background | Sidebar   | `#0e0e12` |
| Background | Header    | `#141418` |
| Background | Hover     | `#16161e` |
| Background | Selected  | `#1c1c2e` |
| Text       | Primary   | `#f5f5f5` |
| Text       | Secondary | `#888898` |
| Text       | Dim       | `#55556a` |
| Accent     | Blue      | `#5b9bd5` |
| Border     | Default   | `#1a1a24` |
| Border     | Medium    | `#252530` |
| Status     | Error     | `#e05050` |
| Status     | Success   | `#4caf7d` |
| Status     | Warning   | `#e5a44d` |

## Installation

### 1. Download

```bash
git clone https://github.com/your-username/RoundCube-Editorial-Theme.git
```

### 2. Copy to Roundcube

Copy the `skins/editorial` folder into your Roundcube installation's `skins/` directory:

```bash
cp -r skins/editorial /path/to/roundcube/skins/
```

### 3. Activate

Go to **Settings > Preferences > User Interface > Skin** and select **Editorial**.

Alternatively, set it as the default skin in Roundcube's `config/config.inc.php`:

```php
$config['skin'] = 'editorial';
```

## Identity Switch Plugin

This theme includes built-in styling for the [identity_switch](https://github.com/toteph42/identity_switch) plugin. The plugin's dropdown menu and identity selector are styled to match the dark palette.

No additional configuration is needed — just install the plugin as usual and the theme will handle the styling.

## Building from Source

The theme uses LESS for stylesheets. To recompile after making changes:

```bash
npm install
npx lessc skins/editorial/styles/styles.less skins/editorial/styles/styles.css
npx lessc skins/editorial/styles/embed.less skins/editorial/styles/embed.css
npx lessc skins/editorial/styles/print.less skins/editorial/styles/print.css
```

Pre-compiled CSS files are included, so building is only needed if you modify the LESS sources.

## Structure

```
skins/editorial/
  meta.json              # Skin metadata
  ui.js                  # UI JavaScript (from Elastic)
  thumbnail.png          # Preview thumbnail
  watermark.html         # Empty state watermark
  fonts/                 # FontAwesome + Roboto fonts
  images/
    logo.svg             # "R." logo with accent dot
    ...
  styles/
    colors.less          # True black color palette
    variables.less       # Layout variables
    _variables.less      # Font family overrides
    _styles.less         # Custom overrides + identity_switch
    styles.less          # Main entry point
    styles.css           # Compiled CSS
    ...
  templates/             # HTML templates (from Elastic)
```

## Credits

- Based on the **Elastic** skin by [Aleksander Machniak](https://github.com/alecpl) and [The Roundcube Dev Team](https://github.com/roundcube/roundcubemail)
- Palette inspired by [gabriel-guillou.fr](https://gabriel-guillou.fr)
- Fonts: [Source Serif 4](https://github.com/adobe-fonts/source-serif), [Source Sans 3](https://github.com/adobe-fonts/source-sans), [Source Code Pro](https://github.com/adobe-fonts/source-code-pro) by Adobe

## License

Creative Commons Attribution-ShareAlike (CC BY-SA 3.0), same as the Elastic skin.
See [LICENSE](LICENSE) for details.
