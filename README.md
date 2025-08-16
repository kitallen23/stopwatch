# Stopwatch

A simple and aesthetic Progressive Web App (PWA) for timing tasks. Built with modern web technologies and designed for both desktop and mobile use.

🔗 **Live App**: [https://stopwatch.chuggs.net](https://stopwatch.chuggs.net)

## Features

- ⏱️ **High-precision timing** with start/pause/reset functionality
- 📱 **Progressive Web App** - install on mobile devices and use offline
- 🎨 **Multiple themes** - choose from various dark and light theme options
- 📊 **Timer history** - persistent "laps" that save across sessions (unlike physical stopwatches)
- 🗂️ **Multiple named timers** - organize and separate timing data for different activities
- 📝 **Session notes** - add context to your timer entries
- 🧘 **Zen mode** - hide the timer display when active to avoid distraction
- 🚫 **Ad-free forever** - clean UX without compromising advertisements
- 💾 **Local storage** - your data stays on your device

## Why This App?

Coming from React, this was my first Svelte application built to properly learn the framework. The goal was to create a distraction-free timing tool that solves common issues with existing timer apps:

- **Persistent history**: Unlike physical stopwatches, your timing data is saved and organized
- **Focus-friendly**: Zen mode prevents the timer display from becoming a distraction during work
- **Multi-purpose**: Named timers let you track completely different activities separately
- **Clean experience**: No ads or unnecessary features that compromise the user experience

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Styling**: Tailwind CSS 4 + DaisyUI
- **Build Tool**: Vite
- **Icons**: Material Symbols via unplugin-icons
- **PWA**: vite-plugin-pwa with Workbox
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Deployment**: AWS S3 + CloudFront

## Development

### Prerequisites

- Node.js v22.13 (see `.nvmrc`)
- pnpm

### Getting Started

1. Clone the repository
2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Start the development server:
    ```bash
    pnpm run dev
    ```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Create production build
- `pnpm run preview` - Preview production build
- `pnpm run test` - Run all tests
- `pnpm run test:unit` - Run unit tests in watch mode
- `pnpm run lint` - Check code formatting and linting
- `pnpm run format` - Format code with Prettier
- `pnpm run check` - Type check with svelte-check

## Deployment

The app is configured for static deployment with automatic CI/CD:

- **Static Site Generation**: Uses `@sveltejs/adapter-static`
- **GitHub Actions**: Automated deployment to AWS S3 on push to main
- **CDN**: CloudFront distribution with cache invalidation
- **PWA**: Service worker with offline support

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
