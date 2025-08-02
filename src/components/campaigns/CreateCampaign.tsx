import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarIcon, Mail, MessageSquare, Users, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CreateCampaignProps {
  onSuccess: () => void;
}

interface CampaignForm {
  name: string;
  type: "email" | "sms";
  subject: string;
  message: string;
  recipients: "all" | "segment";
  segmentFilters: string[];
  sendType: "now" | "scheduled";
  scheduledDate?: Date;
}

const customerSegments = [
  { id: "new", label: "New Customers", count: 245 },
  { id: "vip", label: "VIP Customers", count: 89 },
  { id: "inactive", label: "Inactive Customers", count: 156 },
  { id: "high-value", label: "High Value Customers", count: 67 },
];

const messageVariables = [
  "{{customer_name}}",
  "{{business_name}}",
  "{{discount_code}}",
  "{{product_name}}",
  "{{order_total}}",
];

export function CreateCampaign({ onSuccess }: CreateCampaignProps) {
  const [form, setForm] = useState<CampaignForm>({
    name: "",
    type: "email",
    subject: "",
    message: "",
    recipients: "all",
    segmentFilters: [],
    sendType: "now",
  });
  const [activeTab, setActiveTab] = useState("setup");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!form.name || !form.message) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Campaign created",
      description: form.sendType === "now" ? "Campaign is being sent." : "Campaign has been scheduled.",
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  const insertVariable = (variable: string) => {
    setForm(prev => ({
      ...prev,
      message: prev.message + variable
    }));
  };

  const totalRecipients = form.recipients === "all" 
    ? 1250 
    : customerSegments
        .filter(segment => form.segmentFilters.includes(segment.id))
        .reduce((sum, segment) => sum + segment.count, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter campaign name..."
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Type *</Label>
                <RadioGroup 
                  value={form.type} 
                  onValueChange={(value) => setForm(prev => ({ ...prev, type: value as "email" | "sms" }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Campaign
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS Campaign
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {form.type === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={form.recipients} 
                onValueChange={(value) => setForm(prev => ({ ...prev, recipients: value as "all" | "segment" }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Customers (1,250)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="segment" id="segment" />
                  <Label htmlFor="segment">Custom Segments</Label>
                </div>
              </RadioGroup>

              {form.recipients === "segment" && (
                <div className="space-y-3 pl-6">
                  <Label>Select Customer Segments</Label>
                  {customerSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={segment.id}
                        checked={form.segmentFilters.includes(segment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm(prev => ({
                              ...prev,
                              segmentFilters: [...prev.segmentFilters, segment.id]
                            }));
                          } else {
                            setForm(prev => ({
                              ...prev,
                              segmentFilters: prev.segmentFilters.filter(id => id !== segment.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={segment.id} className="flex items-center justify-between w-full">
                        <span>{segment.label}</span>
                        <Badge variant="secondary">{segment.count}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Total Recipients: {totalRecipients.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder={form.type === "email" 
                      ? "Write your email content here..." 
                      : "Write your SMS message here... (160 characters max)"
                    }
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={8}
                  />
                  {form.type === "sms" && (
                    <div className="text-sm text-muted-foreground">
                      {form.message.length}/160 characters
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Insert Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {messageVariables.map((variable) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-background">
                  {form.type === "email" && form.subject && (
                    <div className="mb-3 pb-3 border-b">
                      <div className="font-semibold">Subject: {form.subject}</div>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">
                    {form.message || "Your message will appear here..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={form.sendType} 
                onValueChange={(value) => setForm(prev => ({ ...prev, sendType: value as "now" | "scheduled" }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now">Send immediately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled">Schedule for later</Label>
                </div>
              </RadioGroup>

              {form.sendType === "scheduled" && (
                <div className="space-y-2">
                  <Label>Schedule Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !form.scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.scheduledDate ? format(form.scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.scheduledDate}
                        onSelect={(date) => setForm(prev => ({ ...prev, scheduledDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Campaign Name</Label>
                  <p>{form.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="capitalize flex items-center gap-2">
                    {form.type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    {form.type}
                  </p>
                </div>
                {form.type === "email" && (
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <p>{form.subject}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Recipients</Label>
                  <p>{totalRecipients.toLocaleString()} customers</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Send Type</Label>
                  <p className="capitalize">
                    {form.sendType === "now" ? "Send immediately" : 
                     form.scheduledDate ? `Scheduled for ${format(form.scheduledDate, "PPP")}` : "Scheduled"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Message Preview</Label>
                <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                  <div className="whitespace-pre-wrap text-sm">
                    {form.message}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setActiveTab("content")}>
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : form.sendType === "now" ? "Send Campaign" : "Schedule Campaign"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}