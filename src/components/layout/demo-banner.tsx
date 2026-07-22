import { isDemoMode } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
      Demo — all people and data here are fictional. This is how Dreamers CRM
      looks for a HelpBnk helper.
    </div>
  );
}
