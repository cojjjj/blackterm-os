BLACKTERM OS Desktop Icon Vertical Drag Fix

Replace these files in your project:
- src/components/DesktopWorkspace.tsx
- src/styles.css
- desktop-layout.css

Then run:
npm.cmd run build
git add .
git commit -m "Fix full-screen desktop icon dragging"
git push

The fix tracks pointer movement at the window level, allows full X/Y movement across the desktop above the taskbar, and saves the latest position correctly.
