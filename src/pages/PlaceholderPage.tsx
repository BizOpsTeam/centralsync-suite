import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features: string[];
}

export function PlaceholderPage({ title, description, features }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-xl text-muted-foreground">{description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            This feature is currently under development. Check back soon!
          </p>
          <Button onClick={() => navigate("/")} className="bg-primary hover:bg-primary/90">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}