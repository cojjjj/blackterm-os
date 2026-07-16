# BLACKTERM OS v3

An interactive operating-system-style cybersecurity portfolio for Tyler Deppa.

## Highlights
- Animated BIOS boot and secure login
- Draggable/minimizable/maximizable application windows
- Electric-blue workstation theme plus cyan/violet options
- Real resume PDF viewer and download
- Project archive, career timeline, skills monitor, certifications
- File Explorer and hidden `/root/interview` recruiter file
- SOC-style Security Center with animated telemetry
- Public GitHub API repository panel with offline fallback
- TryHackMe achievement snapshot (clearly labeled as portfolio data)
- Rule-based Assistant.exe for portfolio questions
- Expanded terminal with root and Matrix easter eggs
- Desktop status widgets, Start menu, taskbar, notifications, and gallery

## Run
```powershell
cd "$HOME\Desktop\blackterm-os-portfolio"
npm.cmd install
npm.cmd run dev
```

Open the Local URL shown by Vite, normally `http://localhost:5173`.

## Build
```powershell
npm.cmd run build
```

## Customize
- Profile/projects/skills/certifications: `src/data/portfolio.ts`
- Main OS behavior: `src/App.tsx`
- Styling: `src/styles.css`
- Resume: `public/Tyler-Deppa-Resume.pdf`


## v4 Custom Icon Pack

Every installed application now uses its own locally bundled SVG image in `public/icons/`. The icons appear consistently on the desktop, Start menu, taskbar, and window title bars. They require no external image host and can be recolored or replaced independently.

## v5 icon system

Version 5 includes a completely redrawn local SVG application pack. Every desktop app now has distinct artwork rather than a shared generic symbol. The same images are reused consistently in desktop shortcuts, the Start menu, taskbar buttons, and window title bars. All assets live in `public/icons` and require no external image service.

## v8.0 Living Desktop

Adds ambient particles, cursor lighting, glass blur, premium shadows, dock physics, generated ambient sound, persistent effect controls, and reduced-motion support.


## BLACKTERM AI v2

The Assistant.exe app is a grounded local portfolio assistant. It can answer questions about Tyler, explain projects, filter Python and Docker work, summarize skills and experience, present a recruiter-focused hiring case, and open related BLACKTERM OS applications. It includes suggested prompts, quick actions, optional browser speech synthesis, conversation memory for the current session, a visible knowledge-status panel, and a hidden developer mode triggered by asking for `developer mode`.
