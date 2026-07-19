BLACKTERM OS desktop icon free-movement fix

Replace:
- src/components/DesktopWorkspace.tsx
- src/styles.css
- desktop-layout.css

This version:
- uses translate3d(x,y) instead of CSS top/left
- captures the pointer during dragging
- measures the actual desktop client height
- resets the saved layout using a v2 storage key

After replacement run:
npm.cmd run build
git add .
git commit -m "Fix unrestricted desktop icon movement"
git push
