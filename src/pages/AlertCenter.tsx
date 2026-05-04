import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";

export function AlertCenter() {
  return (
    <PageWrapper 
      title="Alert Center" 
      description="Manage, acknowledge, and resolve system and intelligence alerts."
    >
      <Card className="border-slate-800">
        <CardContent className="flex h-[400px] flex-col items-center justify-center space-y-4 p-6">
          <AlertTriangle className="h-16 w-16 text-slate-700" />
          <p className="text-xl font-semibold text-slate-500">Alert Log & Processing</p>
          <p className="text-sm text-slate-600 text-center max-w-md">
            High-performance data grid for alert triaging, filtering, and bulk actions will be implemented here.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
