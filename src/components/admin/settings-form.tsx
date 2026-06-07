"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { saveSettings, type SettingsInput } from "@/app/admin/actions";
import { buttonClasses } from "@/components/ui/button";
import type { SiteSettings } from "@/types/db";

const FIELD = "w-full rounded-xl border border-border bg-cream px-4 py-2.5 text-sm outline-none focus:border-clay";
const LABEL = "block text-sm font-medium mb-1.5";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const input: SettingsInput = {
      storeName: String(fd.get("storeName")),
      contactPhone: String(fd.get("contactPhone")),
      contactEmail: String(fd.get("contactEmail") || ""),
      instagramUrl: String(fd.get("instagramUrl") || ""),
      flatShippingRupees: Number(fd.get("flatShipping") || 0),
      freeShippingThresholdRupees: fd.get("freeThreshold") ? Number(fd.get("freeThreshold")) : null,
      codEnabled: fd.get("codEnabled") === "on",
      onlinePaymentEnabled: fd.get("onlineEnabled") === "on",
      announcementText: String(fd.get("announcement") || ""),
    };
    try {
      await saveSettings(input);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <section className="rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Store</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div><label className={LABEL}>Store name</label><input name="storeName" className={FIELD} defaultValue={settings.storeName} /></div>
          <div><label className={LABEL}>Contact phone</label><input name="contactPhone" className={FIELD} defaultValue={settings.contactPhone} /></div>
          <div><label className={LABEL}>Contact email</label><input name="contactEmail" type="email" className={FIELD} defaultValue={settings.contactEmail ?? ""} /></div>
          <div><label className={LABEL}>Instagram URL</label><input name="instagramUrl" className={FIELD} defaultValue={settings.instagramUrl ?? ""} placeholder="https://instagram.com/yourhandle" /></div>
        </div>
        <div className="mt-4"><label className={LABEL}>Announcement bar text</label><input name="announcement" className={FIELD} defaultValue={settings.announcementText ?? ""} /></div>
      </section>

      <section className="rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Shipping</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div><label className={LABEL}>Flat shipping fee (₹)</label><input name="flatShipping" type="number" min="0" className={FIELD} defaultValue={settings.flatShippingFee / 100} /></div>
          <div><label className={LABEL}>Free shipping over (₹, blank = never)</label><input name="freeThreshold" type="number" min="0" className={FIELD} defaultValue={settings.freeShippingThreshold != null ? settings.freeShippingThreshold / 100 : ""} /></div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-cream p-5">
        <h2 className="font-display text-lg">Payments</h2>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="codEnabled" defaultChecked={settings.codEnabled} className="accent-clay" /> Enable Cash on Delivery</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="onlineEnabled" defaultChecked={settings.onlinePaymentEnabled} className="accent-clay" /> Enable online payment (Razorpay)</label>
        </div>
      </section>

      {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">{error}</p>}

      <button type="submit" disabled={saving} className={buttonClasses("primary", "md")}>
        {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <Check size={16} /> : null}
        {saved ? "Saved" : "Save settings"}
      </button>
    </form>
  );
}
