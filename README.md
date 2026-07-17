# BLACKTERM OS v13.1 — Draggable Persistent Desktop

Adds:

- Drag-and-drop desktop icons
- Free icon positioning
- Apps dragged from Start to the desktop
- Plus button to add Start-menu apps as shortcuts
- Right-click an icon to remove it
- Align and Reset controls
- Layout persistence using localStorage
- Positions survive refreshes and future visits
- Automatic backups

## Install when files are inside the main project

```powershell
python .\install_desktop_layout.py .
npm.cmd run build
npm.cmd run dev
```

## Controls

- Drag a desktop icon to move it.
- Double-click it to open.
- Right-click it to remove the shortcut.
- Drag an app from Start onto the desktop.
- Press `＋` beside an app in Start to add it.
- Use `ALIGN` to organize icons.
- Use `RESET` to restore the default desktop.

## Deploy

```powershell
git add .
git commit -m "Add draggable persistent desktop shortcuts"
git push
```
