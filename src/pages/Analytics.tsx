import { BarChart2 } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";

export function Analytics() {
  return (
    <PageWrapper 
      title="Analytics Engine" 
      description="Deep-dive metrics and predictive intelligence based on historical data."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-[400px] border-slate-800">
          <CardContent className="flex h-full flex-col items-center justify-center space-y-4 p-6">
            <BarChart2 className="h-12 w-12 text-slate-700" />
            <p className="text-lg font-semibold text-slate-500">Trend Analysis</p>
          </CardContent>
        </Card>
        <Card className="h-[400px] border-slate-800">
          <CardContent className="flex h-full flex-col items-center justify-center space-y-4 p-6">
            <BarChart2 className="h-12 w-12 text-slate-700" />
            <p className="text-lg font-semibold text-slate-500">Predictive Models</p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
