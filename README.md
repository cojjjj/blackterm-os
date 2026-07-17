# BLACKTERM OS v10.1 — Cinematic Threat Intelligence

This polish update upgrades the existing v10 Threat Map with:

- Multi-stage typed startup sequence
- Global topology loading animation
- Progress states and secure-boot console
- Brief decrypting glitch
- Final blue flash and dashboard reveal
- Animated packets traveling along attack routes
- Optional deep ambient hum
- Radar ping roughly every 9.5 seconds
- Audio on/off controls
- Updated BLACKTERM OS v10.1 labels
- Threat Intelligence included in the main OS boot inventory
- Automatic backups before changing files

## Install

Extract this folder, open PowerShell in it, and run:

```powershell
python .\install_v10_1.py "C:\Users\tyler\Desktop\blackterm-os-portfolio"
```

Then:

```powershell
cd "C:\Users\tyler\Desktop\blackterm-os-portfolio"
npm.cmd run build
npm.cmd run dev
```

## Deploy

```powershell
git add .
git commit -m "Add cinematic Threat Intelligence startup"
git push
```

## Backups

The installer creates:

```text
.blackterm-backups/
```

inside the main project before replacing anything.

## Audio

Browsers can restrict audio until the visitor interacts with the page. Since the map is opened through a click, it should normally start. The dashboard also includes an AUDIO ON/OFF button.
