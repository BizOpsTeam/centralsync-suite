import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { CalendarIcon, Mail, MessageSquare, Users, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

import { createCampaign } from "@/api/campaigns";
import { fetchCustomers } from "@/api/customers";
import { useAuth } from "@/contexts/AuthContext";
import type { ICampaignPayload } from "@/types/Campaign";
import type { Customer } from "@/types/Customer";

// Form validation schema
const campaignFormSchema = z.object({
    name: z.string().min(2, "Campaign name is required"),
    message: z.string().min(5, "Message is required"),
    broadcastToAll: z.boolean(),
    recipients: z.array(z.string()),
    schedule: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CreateCampaignProps {
    onSuccess: () => void;
}

const messageVariables = [
    "{{customer_name}}",
    "{{business_name}}",
    "{{discount_code}}",
    "{{product_name}}",
    "{{order_total}}",
];

export function CreateCampaign({ onSuccess }: CreateCampaignProps) {
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [activeTab, setActiveTab] = useState("setup");
    const [selectedDate, setSelectedDate] = useState<Date>();

    const form = useForm<CampaignFormData>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues: {
            name: "",
            message: "",
            broadcastToAll: true,
            recipients: [],
            schedule: undefined,
        },
    });

    // Fetch customers for recipient selection
    useEffect(() => {
        if (accessToken) {
            const loadCustomers = async () => {
                try {
                    const response = await fetchCustomers(accessToken, 1, 100, "");
                    setCustomers(response.data);
                } catch (error) {
                    console.error("Failed to load customers:", error);
                    toast.error("Failed to load customers");
                }
            };
            loadCustomers();
        }
    }, [accessToken]);

    // Create campaign mutation
    const createCampaignMutation = useMutation({
        mutationFn: (data: ICampaignPayload) => createCampaign(accessToken!, data),
        onSuccess: () => {
            toast.success("Campaign created successfully!");
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create campaign");
        },
    });

    const insertVariable = (variable: string) => {
        const currentMessage = form.getValues("message");
        form.setValue("message", currentMessage + variable);
    };

    const totalRecipients = form.watch("broadcastToAll") 
        ? customers.length 
        : form.watch("recipients").length;

    const handleSubmit = (data: CampaignFormData) => {
        if (data.broadcastToAll && customers.length === 0) {
            toast.error("No customers available for broadcast");
            return;
        }

        if (!data.broadcastToAll && data.recipients.length === 0) {
            toast.error("Please select at least one recipient");
            return;
        }

        const campaignData: ICampaignPayload = {
            name: data.name,
            message: data.message,
            broadcastToAll: data.broadcastToAll,
            recipients: data.broadcastToAll ? [] : data.recipients,
            schedule: selectedDate ? selectedDate.toISOString() : undefined,
        };

        createCampaignMutation.mutate(campaignData);
    };

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
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Campaign Type</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4" />
                                        <span>Email Campaign</span>
                                    </div>
                                </div>
                            </div>
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
                                value={form.watch("broadcastToAll") ? "all" : "custom"}
                                onValueChange={(value) => {
                                    form.setValue("broadcastToAll", value === "all");
                                    if (value === "all") {
                                        form.setValue("recipients", []);
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="all" />
                                    <Label htmlFor="all" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        All Customers ({customers.length})
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom">Custom Recipients</Label>
                                </div>
                            </RadioGroup>

                            {!form.watch("broadcastToAll") && (
                                <div className="space-y-3 pl-6">
                                    <Label>Select Customers</Label>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {customers.map((customer) => (
                                            <div key={customer.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={customer.id}
                                                    checked={form.watch("recipients").includes(customer.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentRecipients = form.watch("recipients");
                                                        if (checked) {
                                                            form.setValue("recipients", [...currentRecipients, customer.id]);
                                                        } else {
                                                            form.setValue("recipients", currentRecipients.filter(id => id !== customer.id));
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={customer.id} className="flex items-center justify-between w-full">
                                                    <span>{customer.name}</span>
                                                    <span className="text-sm text-muted-foreground">{customer.email}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
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
                                        placeholder="Write your email content here..."
                                        {...form.register("message")}
                                        rows={8}
                                    />
                                    {form.formState.errors.message && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.message.message}
                                        </p>
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
                                                type="button"
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
                                    <div className="whitespace-pre-wrap text-sm">
                                        {form.watch("message") || "Your message will appear here..."}
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
                                value={selectedDate ? "scheduled" : "now"}
                                onValueChange={(value) => {
                                    if (value === "now") {
                                        setSelectedDate(undefined);
                                    }
                                }}
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

                            {selectedDate !== undefined && (
                                <div className="space-y-2">
                                    <Label>Schedule Date & Time</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
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
                                    <p>{form.watch("name")}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Type</Label>
                                    <p className="capitalize flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Campaign
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Recipients</Label>
                                    <p>{totalRecipients.toLocaleString()} customers</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Send Type</Label>
                                    <p className="capitalize">
                                        {selectedDate ? `Scheduled for ${format(selectedDate, "PPP")}` : "Send immediately"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Message Preview</Label>
                                <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                                    <div className="whitespace-pre-wrap text-sm">
                                        {form.watch("message")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setActiveTab("content")}>
                            Back to Edit
                        </Button>
                        <Button 
                            onClick={form.handleSubmit(handleSubmit)} 
                            disabled={createCampaignMutation.isPending}
                        >
                            {createCampaignMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                selectedDate ? "Schedule Campaign" : "Send Campaign"
                            )}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}