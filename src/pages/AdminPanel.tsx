import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";

export function AdminPanel() {
  return (
    <PageWrapper 
      title="Admin Panel" 
      description="System configuration, user roles, and security audit logs."
    >
      <Card className="border-slate-800">
        <CardContent className="flex h-[400px] flex-col items-center justify-center space-y-4 p-6">
          <ShieldAlert className="h-16 w-16 text-slate-700" />
          <p className="text-xl font-semibold text-slate-500">Security & Access Control</p>
          <p className="text-sm text-slate-600 text-center max-w-md">
            User management matrices, API key generation, and system health controls go here.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
