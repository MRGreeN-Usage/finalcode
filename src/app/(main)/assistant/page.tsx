'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecommendationTool } from "@/components/assistant/recommendation-tool";
import { FinancialCoachTool } from "@/components/assistant/financial-coach-tool";
import { Sparkles, Bot } from "lucide-react";


export default function AssistantPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Financial Coach</h1>
                    <p className="text-muted-foreground">Your personal AI for smart financial insights and planning.</p>
                </div>
            </div>

            <Tabs defaultValue="coach" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="coach">
                        <Bot className="mr-2 h-4 w-4" />
                        Financial Coach
                    </TabsTrigger>
                    <TabsTrigger value="planner">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Budget Planner
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="coach" className="pt-4">
                    <FinancialCoachTool />
                </TabsContent>
                <TabsContent value="planner" className="pt-4">
                    <RecommendationTool />
                </TabsContent>
            </Tabs>
        </div>
    );
}
