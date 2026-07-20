from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
PROJECT = Path.cwd()

component_path = PROJECT / "src" / "components" / "CredentialVault.tsx"
style_path = PROJECT / "src" / "styles" / "credential-vault.css"
controller_path = PROJECT / "src" / "components" / "BlackTermAIController.tsx"

if not component_path.exists() or not style_path.exists():
    raise SystemExit(
        "Credential Vault v1 was not found. Run this from the BLACKTERM project root."
    )

backup_dir = PROJECT / ".blackterm-backups"
backup_dir.mkdir(parents=True, exist_ok=True)

for path in (component_path, style_path, controller_path):
    if path.exists():
        backup = backup_dir / f"{path.stem}.before-credential-vault-v2{path.suffix}"
        if not backup.exists():
            shutil.copy2(path, backup)

shutil.copy2(ROOT / "src/components/CredentialVault.tsx", component_path)

style = style_path.read_text(encoding="utf-8")
appendix = (ROOT / "src/styles/credential-vault-v2.css").read_text(encoding="utf-8")
marker = "/* Credential Vault v2 additions */"

if marker not in style:
    style = style.rstrip() + "\n\n" + appendix.strip() + "\n"
    style_path.write_text(style, encoding="utf-8")

if controller_path.exists():
    controller = controller_path.read_text(encoding="utf-8")

    helper = """
function detectCredentialFilter(query: string): string | null {
  const normalized = query.toLowerCase();

  if (!/(cert|credential|training)/i.test(query)) {
    return null;
  }

  if (/offensive|pentest|red team|web application/i.test(normalized)) {
    return "Offensive Security";
  }

  if (/defensive|blue team|soc|incident|detection/i.test(normalized)) {
    return "Defensive Security";
  }

  if (/engineer|devsecops|architecture/i.test(normalized)) {
    return "Security Engineering";
  }

  if (/foundation|beginner|pre security|intro/i.test(normalized)) {
    return "Foundations";
  }

  if (/professional|google|ibm|skillup/i.test(normalized)) {
    return "Professional";
  }

  return "All";
}
""".strip()

    if "function detectCredentialFilter(" not in controller:
        anchor = "function suggestedActions(text: string): ChatAction[] {"
        if anchor in controller:
            controller = controller.replace(anchor, helper + "\n\n" + anchor)

    command_block = """    const credentialFilter = detectCredentialFilter(query);

    if (credentialFilter) {
      localStorage.setItem("bt-credential-filter", credentialFilter);
      window.dispatchEvent(
        new CustomEvent("blackterm:credential-filter", {
          detail: credentialFilter,
        }),
      );
      openApp("certs");
      notify(`Credential Vault opened: ${credentialFilter}.`);

      addMessage({
        role: "assistant",
        content:
          credentialFilter === "All"
            ? "Credential Vault opened with all verified certification records."
            : `Credential Vault opened and filtered to ${credentialFilter}.`,
        category: "CREDENTIAL INTELLIGENCE",
        actions: [{ label: "Open Credential Vault", app: "certs" }],
      });

      setMode("LIVE AI");
      return true;
    }

"""

    signature = "  function runLocalCommand(query: string): boolean {\n"
    if "CREDENTIAL INTELLIGENCE" not in controller and signature in controller:
        controller = controller.replace(signature, signature + command_block)

    controller_path.write_text(controller, encoding="utf-8")

print("BLACKTERM Credential Vault v2 installed.")
print("Added issuer badges, sorting, TryHackMe stats, and AI category control.")
print("Run:")
print("  npx tsc --noEmit")
print("  npm run build")
