import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppShell>
      <Card>
        <h1 className="text-2xl font-semibold">Profile settings</h1>
        <p className="mt-2 text-sm text-foreground/65">Profile, language, voice style, and security preferences live here.</p>
      </Card>
    </AppShell>
  );
}
