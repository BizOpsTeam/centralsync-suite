import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// Icons
import { 
  Lightbulb, 
  Brain, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Type,
  List,
  Sparkles,
  Send,
  TrendingUp,
  Target,
  RefreshCw,
  Braces,
  Calendar,
  CheckCircle,
  CheckSquare,
  CircleSlash,
  Clock,
  Hash,
  Link2,
  Package,
  Users,
  ChevronRight
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Hooks & Utils
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// API
import { 
  analyzeQuery,
  generateInsights,
  predictTrends,
  generateRecommendations,
  getAIDashboard,
  SAMPLE_QUERIES,
  type AIInsight,
} from "@/api/ai";

// Extended AIInsight interface to include content field
interface ExtendedAIInsight extends AIInsight {
  content?: string;
}

// Category Icons mapping
const CATEGORY_ICONS = {
  analysis: BarChart3,
  prediction: TrendingUp,
  recommendation: Target,
  insight: Lightbulb,
  default: Brain
};

// Colors mapping
const COLORS = {
  analysis: "bg-blue-100 text-blue-800",
  prediction: "bg-green-100 text-green-800",
  recommendation: "bg-purple-100 text-purple-800",
  insight: "bg-yellow-100 text-yellow-800"
};

// InsightCard Component
const InsightCard: React.FC<{ insight: ExtendedAIInsight }> = React.memo(({ insight }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  const formatTimestamp = useCallback((dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString();
      }
      return date.toLocaleString();
    } catch (e) {
      console.warn('Failed to format timestamp:', e);
      return new Date().toLocaleString();
    }
  }, []);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);



  const cleanResponse = useMemo(() => {
    if (!insight.content) return '';
    try {
      // Try to parse JSON content if it's a string
      const parsed = typeof insight.content === 'string' 
        ? JSON.parse(insight.content) 
        : insight.content;
      
      // Handle different response formats
      if (parsed.analysis) return parsed.analysis;
      if (parsed.summary) return parsed.summary;
      if (parsed.insight) return parsed.insight;
      if (parsed.data?.analysis) return parsed.data.analysis;
      
      // If none of the above, return the content as is
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, return the content as is
      return typeof insight.content === 'string' 
        ? insight.content 
        : JSON.stringify(insight.content, null, 2);
    }
  }, [insight.content]);

  const hasContent = Boolean(cleanResponse);
  const showExpandButton = cleanResponse.length > 200;
  const previewLength = 200;
        
  // Get the appropriate icon and color for the insight
  const { icon: CategoryIcon, color: categoryColor } = React.useMemo(() => {
    return {
      icon: CATEGORY_ICONS[insight.category as keyof typeof CATEGORY_ICONS] || Brain,
      color: COLORS[insight.type as keyof typeof COLORS] || COLORS.analysis
    };
  }, [insight.category, insight.type]);
        
  // Get type-specific icon and color
  const getTypeInfo = (value: unknown) => {
    if (value === null) return { 
      icon: <CircleSlash className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-muted-foreground',
      type: 'null'
    };
    if (Array.isArray(value)) return { 
      icon: <List className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-blue-500',
      type: 'array',
      count: value.length
    };
    if (typeof value === 'object') return { 
      icon: <Braces className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-purple-500',
      type: 'object',
      count: Object.keys(value).length
    };
    if (typeof value === 'number') return { 
      icon: <Hash className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-green-500',
      type: 'number'
    };
    if (typeof value === 'boolean') return { 
      icon: <CheckSquare className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-amber-500',
      type: 'boolean'
    };
    if (typeof value === 'string') {
      // Check if it's a date string
      if (!isNaN(Date.parse(value)) && !isNaN(new Date(value).getTime())) {
        return { 
          icon: <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
          color: 'text-cyan-500',
          type: 'date'
        };
      }
      // Check if it's a URL
      try {
        new URL(value);
        return { 
          icon: <Link2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
          color: 'text-blue-400',
          type: 'url'
        };
      } catch (e) {
        // Not a valid URL, continue to string type
        return { 
          icon: <Type className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
          color: 'text-foreground/80',
          type: 'string'
        };
      }
    }
    return { 
      icon: <Type className="w-3.5 h-3.5 mr-1 flex-shrink-0" />, 
      color: 'text-foreground/80',
      type: typeof value
    };
  };
        
  // Format value display
  const formatValue = (value: unknown) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };
        
  // Render JSON data in a formatted way with collapsible sections
  const renderJsonData = (data: unknown, path = '', depth = 0) => {
    if (data === null || data === undefined) {
      const { icon, color } = getTypeInfo(data);
      return (
        <span className="inline-flex items-center">
          {icon}
          <span className={color}>null</span>
        </span>
      );
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-muted-foreground">[]</span>;
      
      const isExpanded = expandedSections[path] !== false;
      const toggle = () => toggleSection(path);
      const typeInfo = getTypeInfo(data);
      
      return (
        <div className={`${depth > 0 ? 'pl-4' : ''}`}>
          <button 
            onClick={toggle}
            className="flex items-center text-sm font-mono hover:bg-muted/50 rounded px-1 -ml-1 py-0.5 transition-colors w-full text-left group"
          >
            <ChevronRight 
              className={`w-4 h-4 mr-1 transition-transform flex-shrink-0 ${isExpanded ? 'transform rotate-90' : ''} ${typeInfo.color}`} 
            />
            <span className="text-foreground/70">[</span>
            <span className={`mx-1 ${typeInfo.color} flex items-center`}>
              {typeInfo.icon}
              <span className="ml-0.5">{data.length} {data.length === 1 ? 'item' : 'items'}</span>
            </span>
            <span className="text-foreground/70">]</span>
            <span className="ml-1.5 text-xs text-muted-foreground font-normal opacity-0 group-hover:opacity-100 transition-opacity">
              array
            </span>
          </button>
          
          {isExpanded && (
            <div className="ml-4 border-l border-muted/50 pl-3 mt-1">
              {data.map((item: any, index: number) => {
                const itemTypeInfo = getTypeInfo(item);
                return (
                  <div key={index} className="py-1 group">
                    <div className="flex items-start">
                      <span className="text-muted-foreground text-xs font-mono mt-0.5 w-6 flex-shrink-0">
                        {index}:
                      </span>
                      <div className="flex-1 min-w-0">
                        {typeof item === 'object' 
                          ? renderJsonData(item, `${path}[${index}]`, depth + 1)
                          : (
                            <div className="flex items-center">
                              <span className={itemTypeInfo.color}>
                                {itemTypeInfo.icon}
                              </span>
                              <span className="text-foreground">
                                {formatValue(item)}
                                <span className="ml-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  {itemTypeInfo.type}
                                </span>
                              </span>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof data === 'object') {
      const entries = Object.entries(data);
      if (entries.length === 0) return <span className="text-muted-foreground">{'{}'}</span>;
      
      const isExpanded = expandedSections[path] !== false;
      const toggle = () => toggleSection(path);
      const typeInfo = getTypeInfo(data);
      
      return (
        <div className={`${depth > 0 ? 'pl-4' : ''}`}>
          <button 
            onClick={toggle}
            className="flex items-center text-sm font-mono hover:bg-muted/50 rounded px-1 -ml-1 py-0.5 transition-colors w-full text-left group"
          >
            <ChevronRight 
              className={`w-4 h-4 mr-1 transition-transform flex-shrink-0 ${isExpanded ? 'transform rotate-90' : ''} ${typeInfo.color}`} 
            />
            <span className="text-foreground/70">{'{'}</span>
            <span className={`mx-1 ${typeInfo.color} flex items-center`}>
              {typeInfo.icon}
              <span className="ml-0.5">{entries.length} {entries.length === 1 ? 'property' : 'properties'}</span>
            </span>
            <span className="text-foreground/70">{'}'}</span>
            <span className="ml-1.5 text-xs text-muted-foreground font-normal opacity-0 group-hover:opacity-100 transition-opacity">
              object
            </span>
          </button>
          
          {isExpanded && (
            <div className="ml-4 border-l border-muted/50 pl-3 mt-1">
              {entries.map(([key, value]) => {
                const valueTypeInfo = getTypeInfo(value);
                return (
                  <div key={key} className="py-1 group">
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start">
                          <span className="text-blue-500 font-medium font-mono">{key}:</span>
                          <div className="ml-2">
                            {typeof value === 'object' 
                              ? renderJsonData(value, `${path}.${key}`, depth + 1)
                              : (
                                <div className="flex items-center">
                                  <span className={valueTypeInfo.color}>
                                    {valueTypeInfo.icon}
                                  </span>
                                  <span className="text-foreground">
                                    {formatValue(value)}
                                    <span className="ml-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                      {valueTypeInfo.type}
                                    </span>
                                  </span>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-foreground">{formatValue(data)}</span>;
  };

  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: categoryColor.includes('blue') ? '#3b82f6' : categoryColor.includes('green') ? '#10b981' : categoryColor.includes('purple') ? '#8b5cf6' : categoryColor.includes('yellow') ? '#f59e0b' : '#6b7280' }}>
      <CardHeader className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${categoryColor.split(' ')[0]}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">
                {insight.title || 'AI Analysis'}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(insight.timestamp || new Date().toISOString())}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs"
          >
            {showRaw ? 'Show Clean View' : 'Show Raw Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showRaw ? (
          <div className="bg-muted/50 p-4 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{JSON.stringify(insight, null, 2)}</pre>
          </div>
        ) : hasContent ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                  <h4 className="text-base font-semibold mt-3 mb-1.5" {...props} />
                ),
                h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                  <h5 className="text-sm font-medium mt-2.5 mb-1" {...props} />
                ),
                ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
                  <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
                ),
                ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
                  <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
                ),
                p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
                  <p className="mb-4 leading-relaxed" {...props} />
                ),
                code: (props: any) => {
                  const { node, inline, className, children, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-sm my-2"
                      {...rest}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code 
                      className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono"
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
                a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
                  <a 
                    className="text-blue-600 hover:underline dark:text-blue-400" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {showExpandButton && !isExpanded ? 
                `${cleanResponse.substring(0, previewLength).trim()}...` : 
                cleanResponse
              }
            </ReactMarkdown>
            
            {/* Display suggested actions if available */}
            {insight.data?.suggested_actions && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Suggested Actions:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {(Array.isArray(insight.data.suggested_actions) 
                    ? insight.data.suggested_actions 
                    : [insight.data.suggested_actions]
                  ).filter(Boolean).map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No response content available</p>
        )} 
        
        {/* Show expand/collapse button if needed */}
        {showExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-0 h-auto mt-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
            {isExpanded ? (
              <ChevronUp className="ml-1 h-3 w-3" />
            ) : (
              <ChevronDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        )}

        {/* Additional data sections only shown when expanded */}
        {isExpanded && (
          <>
            {/* Key Metrics */}
            {insight.data?.keyMetrics && Object.keys(insight.data.keyMetrics).length > 0 && (
              <div className="space-y-3 pt-4 mt-4 border-t">
                <h4 className="font-semibold text-sm flex items-center text-muted-foreground">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Key Metrics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(insight.data.keyMetrics).map(([key, value]) => (
                    <div key={key} className="bg-muted/30 p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div className="text-xs font-medium text-muted-foreground mb-1">{key}</div>
                      <div className="text-lg font-semibold text-foreground">
                        {typeof value === 'number' && !Number.isInteger(value) 
                          ? value.toFixed(2) 
                          : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {insight.data?.insights && insight.data.insights.length > 0 && (
              <div className="space-y-3 pt-4 mt-4 border-t">
                <h4 className="font-semibold text-sm flex items-center text-muted-foreground">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Key Insights
                </h4>
                <ul className="space-y-3">
                  {insight.data.insights.map((insightText: string, index: number) => (
                    <li key={index} className="flex items-start group">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 mr-3 flex-shrink-0" />
                      </div>
                      <div className="text-sm text-foreground">
                        {insightText}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insight.data?.recommendations && insight.data.recommendations.length > 0 && (
              <div className="space-y-3 pt-4 mt-4 border-t">
                <h4 className="font-semibold text-sm flex items-center text-muted-foreground">
                  <Zap className="w-4 h-4 mr-2 text-green-500" />
                  Recommendations
                </h4>
                <ul className="space-y-3">
                  {insight.data.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start group">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0" />
                      </div>
                      <div className="text-sm text-foreground">
                        {recommendation}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {insight.actionable && (
          <div className="flex items-center space-x-2 text-sm text-green-600 pt-4 mt-4 border-t">
            <CheckCircle className="w-4 h-4" />
            <span>Actionable insight</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Main component
export default function AIInsights() {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [query, setQuery] = useState("");
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
      console.log('Analysis result:', data);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your business query",
      });
      queryClient.invalidateQueries({ queryKey: ["aiDashboard"] });
    },
    onError: (error: unknown) => {
      console.log(error);
      toast({
        title: "Analysis Failed",
        description: (error as any)?.response?.data?.message || "Failed to analyze query",
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
    } catch (error) {
      // Error is already handled by the mutation onError callback
      console.error('Query submission error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
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
                onChange={(e) => setQuery(e.target.value.slice(0, 500))}
                rows={3}
                className="resize-none"
                maxLength={500}
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
            <InsightCard insight={analyzeQueryMutation.data as ExtendedAIInsight} />
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
                <InsightCard key={insight.id} insight={insight as ExtendedAIInsight} />
              )) || (
                <p className="text-muted-foreground text-sm">No insights available</p>
              )}
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
                <InsightCard key={prediction.id} insight={prediction as ExtendedAIInsight} />
              )) || (
                <p className="text-muted-foreground text-sm">No predictions available</p>
              )}
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
                <InsightCard key={recommendation.id} insight={recommendation as ExtendedAIInsight} />
              )) || (
                <p className="text-muted-foreground text-sm">No recommendations available</p>
              )}
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
            ) : insights && insights.length > 0 ? (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight as ExtendedAIInsight} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No insights available</p>
              </div>
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
            ) : predictions && predictions.length > 0 ? (
              predictions.map((prediction) => (
                <InsightCard key={prediction.id} insight={prediction as ExtendedAIInsight} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No predictions available</p>
              </div>
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
            ) : recommendations && recommendations.length > 0 ? (
              recommendations.map((recommendation) => (
                <InsightCard key={recommendation.id} insight={recommendation as ExtendedAIInsight} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}