import { Newspaper } from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { PageWrapper } from "../components/PageWrapper";

export function NewsIntelligence() {
  return (
    <PageWrapper 
      title="News Intelligence" 
      description="AI-aggregated news feeds and social media sentiment analysis."
    >
      <Card className="border-slate-800">
        <CardContent className="flex h-[500px] flex-col items-center justify-center space-y-4 p-6">
          <Newspaper className="h-16 w-16 text-slate-700" />
          <p className="text-xl font-semibold text-slate-500">Aggregated Intelligence Feed</p>
          <p className="text-sm text-slate-600 text-center max-w-md">
            NLP-processed news articles, automated summaries, and sentiment indicators will appear here.
          </p>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
