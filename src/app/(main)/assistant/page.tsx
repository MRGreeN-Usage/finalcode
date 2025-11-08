import { RecommendationTool } from "@/components/assistant/recommendation-tool";

export default function AssistantPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Budget Assistant</h1>
                    <p className="text-muted-foreground">Get personalized budget recommendations based on your spending.</p>
                </div>
            </div>

            <RecommendationTool />
        </div>
    );
}
