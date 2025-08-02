import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarIcon, Upload, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ExpenseForm {
  description: string;
  amount: string;
  category: string;
  vendor: string;
  date?: Date;
  paymentMethod: string;
  tags: string[];
  notes: string;
  receipt?: File;
}

const categories = [
  "Office Supplies",
  "Software",
  "Meals & Entertainment",
  "Travel",
  "Marketing",
  "Utilities",
  "Professional Services",
  "Equipment",
  "Other"
];

const paymentMethods = [
  "Company Card",
  "Personal Card",
  "Cash",
  "Bank Transfer",
  "Check"
];

const commonTags = [
  "office", "travel", "meals", "client", "software", "subscription",
  "marketing", "conference", "supplies", "equipment", "utilities"
];

export function AddExpenseDialog({ open, onOpenChange, onSuccess }: AddExpenseDialogProps) {
  const [form, setForm] = useState<ExpenseForm>({
    description: "",
    amount: "",
    category: "",
    vendor: "",
    paymentMethod: "",
    tags: [],
    notes: "",
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.description || !form.amount || !form.category || !form.vendor || !form.date) {
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
      title: "Expense added",
      description: "Your expense has been submitted for approval.",
    });
    
    setForm({
      description: "",
      amount: "",
      category: "",
      vendor: "",
      paymentMethod: "",
      tags: [],
      notes: "",
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  const addTag = (tag: string) => {
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, receipt: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Enter expense description..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Input
                id="vendor"
                placeholder="Enter vendor name..."
                value={form.vendor}
                onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? format(form.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => setForm(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(value) => setForm(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="space-y-3">
              {/* Common Tags */}
              <div>
                <Label className="text-sm text-muted-foreground">Common Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={form.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNewTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddNewTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Tags */}
              {form.tags.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="cursor-pointer">
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Receipt</Label>
            <Card className="border-dashed">
              <CardContent className="p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Click to upload receipt or drag and drop
                  </div>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm">
                      Choose File
                    </Button>
                  </Label>
                  {form.receipt && (
                    <div className="mt-2 text-sm text-green-600">
                      File selected: {form.receipt.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or comments..."
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}