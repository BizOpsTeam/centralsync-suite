import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Upload,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    X,
} from "lucide-react";
import {
    getUserProfile,
    updateUserProfile,
    uploadLogo,
    changePassword,
    resendVerificationEmail,
    CURRENCY_OPTIONS,
    TAX_RATE_PRESETS,
    type UpdateProfileData,
    type ChangePasswordData,
} from "@/api/settings";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
    const { toast } = useToast();
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("business");
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [profileData, setProfileData] = useState<UpdateProfileData>({});
    const [passwordData, setPasswordData] = useState<ChangePasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Queries
    const { data: profile, isLoading } = useQuery({
        queryKey: ["userProfile"],
        queryFn: () => getUserProfile(accessToken!),
        enabled: !!accessToken,
    });

    // Mutations
    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileData) => updateUserProfile(accessToken!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });

    const uploadLogoMutation = useMutation({
        mutationFn: (file: File) => uploadLogo(accessToken!, file),
        onSuccess: (data) => {
            updateProfileMutation.mutate({ logoUrl: data.url });
            setSelectedLogo(null);
            setLogoPreview(null);
            toast({
                title: "Success",
                description: "Logo uploaded successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to upload logo",
                variant: "destructive",
            });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordData) => changePassword(accessToken!, data),
        onSuccess: () => {
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to change password",
                variant: "destructive",
            });
        },
    });

    const resendVerificationMutation = useMutation({
        mutationFn: () => resendVerificationEmail(accessToken!),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Verification email sent successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to send verification email",
                variant: "destructive",
            });
        },
    });

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setProfileData({
                name: profile.name || "",
                companyAddress: profile.companyAddress || "",
                companyPhone: profile.companyPhone || "",
                defaultCurrencyCode: profile.defaultCurrencyCode || "USD",
                defaultCurrencySymbol: profile.defaultCurrencySymbol || "$",
                defaultTaxRate: profile.defaultTaxRate || 0,
                invoicePrefix: profile.invoicePrefix || "",
                invoiceSuffix: profile.invoiceSuffix || "",
                invoiceSequenceStart: profile.invoiceSequenceStart || 1,
                invoiceSequenceNext: profile.invoiceSequenceNext || 1,
            });
        }
    }, [profile]);

    // Handle logo file selection
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedLogo(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileData);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    const handleLogoUpload = () => {
        if (selectedLogo) {
            uploadLogoMutation.mutate(selectedLogo);
        }
    };


    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">Loading settings...</div>
            </div>
        );
    }

  return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Manage your business information and preferences
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="business" className="text-xs sm:text-sm">Business</TabsTrigger>
                    <TabsTrigger value="invoicing" className="text-xs sm:text-sm">Invoicing</TabsTrigger>
                    <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
                    <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
                </TabsList>

                {/* Business Information */}
                <TabsContent value="business" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base sm:text-lg">Business Profile</CardTitle>
                                    <CardDescription className="text-sm">
                                        Update your company information and branding
                                    </CardDescription>
                                </div>
                                <Button
                                    variant={isEditing ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? "Cancel" : "Edit"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Company Logo */}
                                <div className="space-y-4">
                                    <Label>Company Logo</Label>
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            {logoPreview || profile?.logoUrl ? (
                                                <img
                                                    src={logoPreview || profile?.logoUrl}
                                                    alt="Company logo"
                                                    className="w-20 h-20 object-contain"
                                                />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                disabled={!isEditing}
                                            />
                                            {selectedLogo && (
                                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleLogoUpload}
                                                        disabled={uploadLogoMutation.isPending}
                                                    >
                                                        {uploadLogoMutation.isPending ? "Uploading..." : "Upload"}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedLogo(null);
                                                            setLogoPreview(null);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Company Information */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Company Name</Label>
                                        <Input
                                            id="name"
                                            value={profileData.name || ""}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, name: e.target.value })
                                            }
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyPhone">Company Phone</Label>
                                        <Input
                                            id="companyPhone"
                                            value={profileData.companyPhone || ""}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, companyPhone: e.target.value })
                                            }
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyAddress">Company Address</Label>
                                    <Textarea
                                        id="companyAddress"
                                        value={profileData.companyAddress || ""}
                                        onChange={(e) =>
                                            setProfileData({ ...profileData, companyAddress: e.target.value })
                                        }
                                        disabled={!isEditing}
                                        rows={3}
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                        <Button
                                            type="submit"
                                            disabled={updateProfileMutation.isPending}
                                            className="w-full sm:w-auto"
                                        >
                                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invoicing Settings */}
                <TabsContent value="invoicing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Invoice Settings</CardTitle>
                            <CardDescription className="text-sm">
                                Configure invoice numbering, currency, and tax settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Currency Settings */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Default Currency</Label>
                                        <Select
                                            value={profileData.defaultCurrencyCode || "USD"}
                                            onValueChange={(value) => {
                                                const currency = CURRENCY_OPTIONS.find(c => c.code === value);
                                                setProfileData({
                                                    ...profileData,
                                                    defaultCurrencyCode: value,
                                                    defaultCurrencySymbol: currency?.symbol || "$"
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CURRENCY_OPTIONS.map((currency) => (
                                                    <SelectItem key={currency.code} value={currency.code}>
                                                        {currency.symbol} {currency.name} ({currency.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxRate">Default Tax Rate</Label>
                                        <Select
                                            value={profileData.defaultTaxRate?.toString() || "0"}
                                            onValueChange={(value) =>
                                                setProfileData({ ...profileData, defaultTaxRate: parseFloat(value) })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TAX_RATE_PRESETS.map((tax) => (
                                                    <SelectItem key={tax.value} value={tax.value.toString()}>
                                                        {tax.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Invoice Numbering */}
                                <div className="space-y-4">
                                    <Label>Invoice Numbering</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="invoicePrefix">Prefix</Label>
                                            <Input
                                                id="invoicePrefix"
                                                placeholder="e.g., INV-"
                                                value={profileData.invoicePrefix || ""}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, invoicePrefix: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="invoiceSuffix">Suffix</Label>
                                            <Input
                                                id="invoiceSuffix"
                                                placeholder="e.g., -2024"
                                                value={profileData.invoiceSuffix || ""}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, invoiceSuffix: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                            <Label htmlFor="sequenceStart">Start Number</Label>
                                            <Input
                                                id="sequenceStart"
                                                type="number"
                                                min="1"
                                                value={profileData.invoiceSequenceStart || 1}
                                                onChange={(e) =>
                                                    setProfileData({
                                                        ...profileData,
                                                        invoiceSequenceStart: parseInt(e.target.value)
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="w-full sm:w-auto"
                                    >
                                        {updateProfileMutation.isPending ? "Saving..." : "Save Settings"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Account Security</CardTitle>
                            <CardDescription className="text-sm">
                                Manage your password and account security
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Email Verification */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Label>Email Verification</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {profile?.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                        {profile?.isEmailVerified ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Not Verified
                                            </Badge>
                                        )}
                                        {!profile?.isEmailVerified && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => resendVerificationMutation.mutate()}
                                                disabled={resendVerificationMutation.isPending}
                                            >
                                                {resendVerificationMutation.isPending ? "Sending..." : "Resend"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Change Password */}
                            <div className="space-y-4">
                                <Label>Change Password</Label>
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        currentPassword: e.target.value
                                                    })
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        newPassword: e.target.value
                                                    })
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        confirmPassword: e.target.value
                                                    })
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={changePasswordMutation.isPending}
                                        className="w-full sm:w-auto"
                                    >
                                        {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base sm:text-lg">Notification Preferences</CardTitle>
                            <CardDescription className="text-sm">
                                Configure your email and notification settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications about important business events
                                        </p>
                                    </div>
                                    <Badge variant="outline">Coming Soon</Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Label>Invoice Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified about invoice status changes
                                        </p>
                                    </div>
                                    <Badge variant="outline">Coming Soon</Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Label>Stock Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive alerts for low stock items
                                        </p>
                                    </div>
                                    <Badge variant="outline">Coming Soon</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
  );
}