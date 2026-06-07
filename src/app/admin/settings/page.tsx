import { getSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="text-3xl">Settings</h1>
      <p className="mt-1 text-ink-soft">Store details, shipping rules and payment options.</p>
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
