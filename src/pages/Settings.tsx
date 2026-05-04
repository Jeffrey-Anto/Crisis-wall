import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";

export function Settings() {
  return (
    <PageWrapper 
      title="Settings" 
      description="Personal preferences, notification rules, and interface customization."
    >
      <Card className="border-slate-800">
        <CardContent className="flex h-[400px] flex-col items-center justify-center space-y-4 p-6">
          <SettingsIcon className="h-16 w-16 text-slate-700" />
          <p className="text-xl font-semibold text-slate-500">User Configuration</p>
          <p className="text-sm text-slate-600 text-center max-w-md">
            Theme toggles, alert thresholds, and individual account settings.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
