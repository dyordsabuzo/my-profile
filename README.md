# My Profile - Personal Portfolio & Resume Website

A modern, responsive personal portfolio and resume website built with Astro, React, and Tailwind CSS. Features dark mode, PDF generation capabilities, and optimized for performance and SEO.

## 🏗️ Architecture Overview

This application follows a modern JAMstack architecture using Astro as the meta-framework, providing static site generation with selective client-side hydration. The project is designed for performance, maintainability, and easy content management.

### Core Technologies

- **Astro 5.13.2** - Meta-framework for static site generation with islands architecture
- **React 19.1.1** - Component library for interactive elements
- **Tailwind CSS 3.4.10** - Utility-first CSS framework
- **TypeScript 5.5.4** - Type-safe JavaScript
- **PDF-lib** - Client-side PDF generation
- **Bun** - Fast JavaScript runtime and package manager

### Architecture Patterns

- **Islands Architecture**: Minimal JavaScript with selective hydration
- **Component-Based Design**: Reusable UI components
- **Configuration-Driven Content**: JSON-based content management
- **Static Site Generation**: Pre-rendered pages for optimal performance
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 📁 Project Structure

```
my-profile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── buttons/         # Interactive button components
│   │   ├── common/          # Shared utility components
│   │   ├── layouts/         # Layout components (Header, Footer, etc.)
│   │   └── sections/        # Page section components
│   │       ├── blog/        # Blog-related components
│   │       └── portfolio/   # Portfolio/resume section components
│   ├── config/              # Configuration and content data
│   │   ├── cv.json          # Resume/CV content data
│   │   └── page.json        # Site configuration (nav, social links)
│   ├── content/             # Astro content collections
│   │   ├── blogs/           # Blog post content
│   │   └── config.ts        # Content collection schemas
│   ├── layouts/             # Page layout templates
│   ├── pages/               # Route-based pages
│   ├── styles/              # Global styles and theme definitions
│   ├── utils/               # Utility functions and helpers
│   │   ├── common/          # General utility functions
│   │   ├── pdf/             # PDF generation utilities
│   │   └── pdfbuilders/     # PDF building components
│   ├── icons/               # SVG icon assets
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── astro.config.mjs         # Astro configuration
├── tailwind.config.mjs      # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── netlify.toml             # Netlify deployment configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Key Features

### 1. **Performance Optimized**
- Static site generation with minimal JavaScript
- Lazy loading for images and components
- Optimized build output with code splitting

### 2. **Dark Mode Support**
- System preference detection
- Manual theme toggle
- Persistent theme selection via localStorage

### 3. **Content Management**
- JSON-based configuration for easy content updates
- Structured data for resume/CV information
- Blog support through Astro content collections

### 4. **PDF Generation**
- Client-side resume PDF generation
- Custom PDF styling and layout
- No server dependency for PDF creation

### 5. **Responsive Design**
- Mobile-first approach
- Tailwind CSS utility classes
- Flexible grid and layout systems

## 🔧 Configuration System

### Site Configuration (`src/config/page.json`)
Controls navigation, branding, and social links:

```json
{
  "basic": {
    "name": "Your Name"
  },
  "menuItems": [
    {
      "name": "Menu Item",
      "link": "/path-or-url"
    }
  ],
  "socialLinks": [
    {
      "iconName": "Github",
      "link": "https://github.com/username"
    }
  ]
}
```

### Resume Data (`src/config/cv.json`)
Comprehensive resume/CV data structure including:
- Personal information and summary
- Work experience history
- Education background
- Skills and competencies
- Company information with logos

## 🎨 Theming System

### CSS Variables Approach
The theming system uses CSS custom properties for dynamic theme switching:

```css
[data-theme="light"] {
  --color-primary: theme("colors.blue.700");
  --color-background: theme("colors.gray.50");
  /* ... */
}

[data-theme="dark"] {
  --color-primary: theme("colors.blue.600");
  --color-background: theme("colors.gray.900");
  /* ... */
}
```

### Tailwind Integration
Custom Tailwind configuration extends the theme with CSS variables:

```javascript
theme: {
  extend: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
    },
    textColor: {
      default: "var(--color-text)",
      offset: "var(--color-text-offset)",
    }
  }
}
```

## 🚀 Getting Started

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-profile
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Start development server**
   ```bash
   bun run dev
   # or npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321`

### Development Workflow

| Command | Action |
|---------|--------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run astro check` | Type check and lint |

## 🛠️ Customization Guide

### 1. **Personal Information**
Edit `src/config/cv.json` to update:
- Personal details and contact information
- Work experience and job descriptions
- Education history
- Skills and competencies

### 2. **Site Navigation**
Modify `src/config/page.json` to:
- Change site branding
- Update navigation menu items
- Configure social media links

### 3. **Styling and Colors**
Customize the theme in `src/styles/theme.css`:
- Adjust color schemes for light/dark modes
- Modify primary and secondary colors
- Update background and text colors

### 4. **Add New Sections**
To add new resume sections:
1. Create component in `src/components/sections/portfolio/`
2. Add data structure to `src/config/cv.json`
3. Import and use in main page

### 5. **Blog Configuration**
- Add blog posts in `src/content/blogs/`
- Configure content schema in `src/content/config.ts`
- Blog posts are excluded from build (configurable in `astro.config.mjs`)

## 📦 Build & Deployment

### Production Build
```bash
bun run build
```

### Deployment Platforms

#### Netlify (Configured)
- Automatic deployments from Git
- Build command: `bun run build`
- Publish directory: `dist/`

#### GitHub Pages (Configured)
- Base path: `/my-profile`
- Site URL: `https://dyordsabuzo.github.io`
- Automatic deployment via GitHub Actions

#### Other Platforms
The static build output in `dist/` can be deployed to:
- Vercel
- AWS S3 + CloudFront
- Firebase Hosting
- Any static hosting service

## 🔍 Technical Details

### Astro Configuration
- **Output**: Static site generation
- **Base path**: `/my-profile` (for GitHub Pages)
- **Integrations**: Tailwind, React, MDX, Sitemap, Astro Icon
- **Build optimizations**: External module exclusions, file watching ignores

### Performance Features
- **Image optimization**: Lazy loading and proper sizing
- **Code splitting**: Automatic by Astro
- **CSS optimization**: Tailwind purging and minification
- **Bundle analysis**: Rollup optimization configuration

### SEO & Accessibility
- **Meta tags**: Proper title, description, and Open Graph tags
- **Sitemap**: Automatic generation for better indexing
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Responsive design**: Mobile-first approach

## 🐛 Troubleshooting

### Common Issues

1. **Router errors with assets**
   - Ensure all asset paths include `import.meta.env.BASE_URL`
   - Check `astro.config.mjs` base path configuration

2. **Theme not persisting**
   - Verify localStorage is available
   - Check theme toggle component functionality

3. **PDF generation issues**
   - Ensure PDF-lib dependencies are properly installed
   - Check browser console for font loading errors

4. **Build failures**
   - Run `bun run astro check` for TypeScript errors
   - Verify all imports and file paths are correct

### Development Tips

- Use `bun run astro check` regularly for type checking
- Test both light and dark themes during development
- Verify responsive design across different screen sizes
- Test PDF generation functionality before deployment

## 📄 License

Licensed under the MIT License. See [LICENSE](./LICENSE) for more information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This project is configured as a personal portfolio. Remember to update personal information, social links, and content before deploying to production.