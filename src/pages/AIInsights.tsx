import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Brain,
    TrendingUp,
    Lightbulb,
    BarChart3,
    Send,
    RefreshCw,
    Sparkles,
    Target,
    Users,
    DollarSign,
    Package,
    Zap,
    Clock,
    CheckCircle,

} from "lucide-react";
import {
    analyzeQuery,
    generateInsights,
    predictTrends,
    generateRecommendations,
    getAIDashboard,
    SAMPLE_QUERIES,
    type AIInsight,
} from "@/api/ai";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

const COLORS = {
    analysis: "bg-blue-100 text-blue-800",
    prediction: "bg-purple-100 text-purple-800",
    recommendation: "bg-green-100 text-green-800",
    alert: "bg-red-100 text-red-800",
    trend: "bg-orange-100 text-orange-800",
};

const CATEGORY_ICONS = {
    sales: DollarSign,
    customers: Users,
    inventory: Package,
    financial: BarChart3,
    general: Brain,
};

export default function AIInsights() {
    const { toast } = useToast();
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("dashboard");
    const [query, setQuery] = useState("");
    const [selectedQuery, setSelectedQuery] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Queries
    const { data: dashboard, isLoading: dashboardLoading } = useQuery({
        queryKey: ["aiDashboard"],
        queryFn: () => getAIDashboard(accessToken || ""),
        enabled: !!accessToken,
    });

    const { data: insights, isLoading: insightsLoading } = useQuery({
        queryKey: ["aiInsights"],
        queryFn: () => generateInsights(accessToken || ""),
        enabled: !!accessToken,
    });

    const { data: predictions, isLoading: predictionsLoading } = useQuery({
        queryKey: ["aiPredictions"],
        queryFn: () => predictTrends(accessToken || "", "30"),
        enabled: !!accessToken,
    });

    const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
        queryKey: ["aiRecommendations"],
        queryFn: () => generateRecommendations(accessToken || ""),
        enabled: !!accessToken,
    });

    // Mutations
    const analyzeQueryMutation = useMutation({
        mutationFn: (query: string) => analyzeQuery(query, accessToken || ""),
        onSuccess: (data) => {
            toast({
                title: "Analysis Complete",
                description: "AI has analyzed your business query",
            });
            queryClient.invalidateQueries({ queryKey: ["aiDashboard"] });
        },
        onError: (error: any) => {
            console.log(error);
            toast({
                title: "Analysis Failed",
                description: error.response?.data?.message || "Failed to analyze query",
                variant: "destructive",
            });
        },
    });

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsAnalyzing(true);
        try {
            await analyzeQueryMutation.mutateAsync(query);
            setQuery("");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSampleQuery = (sampleQuery: string) => {
        setQuery(sampleQuery);
        setSelectedQuery(sampleQuery);
    };

    const formatConfidence = (confidence: number) => {
        if (confidence >= 80) return "High";
        if (confidence >= 60) return "Medium";
        return "Low";
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return "text-green-600";
        if (confidence >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const InsightCard = ({ insight }: { insight: AIInsight }) => {
        const CategoryIcon = CATEGORY_ICONS[insight.category] || Brain;

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                            <Badge variant="outline" className={COLORS[insight.type]}>
                                {insight.type}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence}% confidence
                            </span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{insight.description}</p>
                    
                    {/* Key Metrics */}
                    {insight.data?.keyMetrics && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Key Metrics</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(insight.data.keyMetrics).map(([key, value]) => (
                                    <div key={key} className="bg-muted p-2 rounded text-sm">
                                        <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Insights */}
                    {insight.data?.insights && insight.data.insights.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Insights</h4>
                            <ul className="space-y-1">
                                {insight.data.insights.map((insight: string, index: number) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                                        <span className="text-primary mr-2">•</span>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {insight.data?.recommendations && insight.data.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Recommendations</h4>
                            <ul className="space-y-1">
                                {insight.data.recommendations.map((recommendation: string, index: number) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                                        <span className="text-green-600 mr-2">→</span>
                                        {recommendation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Factors */}
                    {insight.data?.factors && insight.data.factors.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Factors</h4>
                            <ul className="space-y-1">
                                {insight.data.factors.map((factor: string, index: number) => (
                                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        {factor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Steps */}
                    {insight.data?.steps && insight.data.steps.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Steps</h4>
                            <ol className="space-y-1 list-decimal list-inside">
                                {insight.data.steps.map((step: string, index: number) => (
                                    <li key={index} className="text-sm text-muted-foreground">
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Expected Outcome */}
                    {insight.data?.expectedOutcome && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Expected Outcome</h4>
                            <p className="text-sm text-muted-foreground bg-green-50 p-2 rounded">
                                {insight.data.expectedOutcome}
                            </p>
                        </div>
                    )}

                    {insight.actionable && (
                        <div className="flex items-center space-x-2 text-sm text-green-600 pt-2 border-t">
                            <CheckCircle className="w-4 h-4" />
                            <span>Actionable insight</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'sales-report':
                navigate('/reports');
                break;
            case 'customer-analysis':
                navigate('/customers');
                break;
            case 'inventory-forecast':
                navigate('/products');
                break;
            default:
                break;
        }
    };

    if (dashboardLoading) {
        return (
            <div className="space-y-6 p-4">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading AI insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
                    <p className="text-muted-foreground">
                        Leverage AI to gain deeper business intelligence and make data-driven decisions
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["aiDashboard"] })}
                        disabled={dashboardLoading}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Natural Language Query */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5" />
                        <span>Ask AI About Your Business</span>
                    </CardTitle>
                    <CardDescription>
                        Ask questions in natural language and get AI-powered insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleQuerySubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="query">Your Question</Label>
                            <Textarea
                                id="query"
                                placeholder="e.g., What are my top customers by revenue? Show me sales trends. Which products are underperforming?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button
                                type="submit"
                                disabled={!query.trim() || isAnalyzing}
                                className="flex items-center space-x-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Ask AI</span>
                                    </>
                                )}
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                {query.length}/500 characters
                            </div>
                        </div>
                    </form>

                    {/* Sample Queries */}
                    <div className="mt-6">
                        <Label className="text-sm font-medium">Sample Questions</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {SAMPLE_QUERIES.slice(0, 6).map((sampleQuery, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSampleQuery(sampleQuery)}
                                    className="text-xs"
                                >
                                    {sampleQuery}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Analysis Result */}
            {analyzeQueryMutation.data && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-800">
                            <Sparkles className="w-5 h-5" />
                            <span>AI Analysis Result</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InsightCard insight={analyzeQueryMutation.data} />
                    </CardContent>
                </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                {/* AI Dashboard */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Key Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="w-5 h-5" />
                                    <span>AI Confidence</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Insights</span>
                                        <span className="text-sm font-medium text-green-600">85%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Predictions</span>
                                        <span className="text-sm font-medium text-yellow-600">72%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Recommendations</span>
                                        <span className="text-sm font-medium text-blue-600">91%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5" />
                                    <span>Recent Analysis</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Sales trend analysis</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Customer insights generated</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Inventory predictions updated</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-start"
                                      onClick={() => handleQuickAction('sales-report')}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        Generate Sales Report
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-start"
                                      onClick={() => handleQuickAction('customer-analysis')}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Customer Analysis
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-start"
                                      onClick={() => handleQuickAction('inventory-forecast')}
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        Inventory Forecast
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Top Insights */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                                <Lightbulb className="w-5 h-5" />
                                <span>Top Insights</span>
                            </h3>
                            <div className="space-y-4">
                                {dashboard?.insights?.slice(0, 3).map((insight) => (
                                    <InsightCard key={insight.id} insight={insight} />
                                ))}
                            </div>
                        </div>

                        {/* Predictions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Predictions</span>
                            </h3>
                            <div className="space-y-4">
                                {dashboard?.predictions?.slice(0, 2).map((prediction) => (
                                    <InsightCard key={prediction.id} insight={prediction} />
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                                <Target className="w-5 h-5" />
                                <span>Recommendations</span>
                            </h3>
                            <div className="space-y-4">
                                {dashboard?.recommendations?.slice(0, 3).map((recommendation) => (
                                    <InsightCard key={recommendation.id} insight={recommendation} />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {insightsLoading ? (
                            <div className="col-span-full text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">Generating insights...</p>
                            </div>
                        ) : (
                            insights?.map((insight) => (
                                <InsightCard key={insight.id} insight={insight} />
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Predictions Tab */}
                <TabsContent value="predictions" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {predictionsLoading ? (
                            <div className="col-span-full text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">Analyzing trends...</p>
                            </div>
                        ) : (
                            predictions?.map((prediction) => (
                                <InsightCard key={prediction.id} insight={prediction} />
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendationsLoading ? (
                            <div className="col-span-full text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-sm text-muted-foreground">Generating recommendations...</p>
                            </div>
                        ) : (
                            recommendations?.map((recommendation) => (
                                <InsightCard key={recommendation.id} insight={recommendation} />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 