# Vizhiyarasu Sampath — Portfolio

An interactive portfolio website for Vizhiyarasu Sampath, a Software Development Engineer in Test (SDET), featuring advanced animations, 3D elements, and a smooth user experience.

## ✏️ Editing site content

All personal content — name, bio, skills, projects, experience, education, achievements, and contact details — lives in a single file:

```
data/profile.js
```

Components import from it, so changing a phone number or adding a project is a one-file edit. Nothing personal is hardcoded in JSX.

## 👨‍💻 Developer & Project Context

This project was developed by [selva](https://selvasivam.netlify.app) for a client. 

For work inquiries or contact:
- **Website**: [www.selvasivam.netlify.app](https://www.selvasivam.netlify.app)
- **Contact for Work**: [www.selvasivam.netlify.app](https://www.selvasivam.netlify.app)

## ✨ Features

- **Modern Next.js Architecture**: Built with Next.js 14 for optimal performance
- **3D Elements**: Interactive 3D components using React Three Fiber and Spline
- **Advanced Animations**: Smooth animations powered by GSAP and Framer Motion
- **Smooth Scrolling**: Enhanced scrolling experience with Lenis
- **Responsive Design**: Fully responsive across all devices
- **Interactive Components**: 
  - Hero section with dynamic content
  - Featured work showcase
  - Horizontal scrolling sections
  - Contact form
  - Particle effects
  - Gradual blur effects

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **3D Graphics**: React Three Fiber, React Three Drei, Spline
- **Animations**: GSAP, Framer Motion, React Spring
- **Styling**: Tailwind CSS
- **Utilities**: Lenis (smooth scrolling), Parallax.js

## 📦 Installation

1. From the project directory:
```bash
cd vizhi-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
vizhiyarasu-portfolio/
├── app/
│   ├── about/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── About/
│   ├── ...
├── data/
│   └── profile.js        # ← all site content lives here
│   ├── Character/
│   ├── Contact/
│   ├── Featured/
│   ├── GradualBlur/
│   ├── HeroSection/
│   ├── HorizontalScroll/
│   ├── Navbar/
│   ├── Projects/
│   ├── SiteFooter/
│   ├── ui/               # ← shadcn/ui primitives + composed sections
│   └── SmoothScroll/
├── public/
└── package.json
```

## 🎨 Key Components

- **HeroSection**: Main landing section with dynamic animations
- **ui/integrations-section**: "Tools & tech" card grid, driven by `SKILLS` in `data/profile.js`
- **HorizontalScroll**: Smooth horizontal scrolling sections
- **Contact**: Interactive contact form
- **GradualBlur**: Advanced blur effects for visual depth
- **Character**: 3D character components with React Three Fiber

## 📄 License & Credits

This project was developed by [selva](https://selvasivam.netlify.app) for a client and is proprietary.

- **Developer**: [selva](https://selvasivam.netlify.app) (Contact for work at [www.selvasivam.netlify.app](https://www.selvasivam.netlify.app))
- **Client / Owner**: Vizhiyarasu Sampath
