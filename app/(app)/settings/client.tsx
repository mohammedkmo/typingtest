"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  KeyRound,
  User,
  Shield,
  Trash2,
  LogOut,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/utils/uploadthing";
import { twMerge } from "tailwind-merge";

// Settings page skeleton loader
function SettingsPageSkeleton() {
  return (
    <div className="container py-12">
      <Skeleton className="h-8 w-64 mb-6" />

      <div className="space-y-6">
        <Skeleton className="h-12 w-full max-w-md mb-6" />

        <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48" />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            {/* Form skeleton */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex-1">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex-1">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Form schemas
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export default function SettingsPageClient() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  // States
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forms - moved before conditional returns to ensure consistent hook order
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
    },
    values: {
      name: session?.user?.name || "",
    },
  });

  // Loading state
  if (status === "loading") {
    return <SettingsPageSkeleton />;
  }

  // Handlers
  const handleImageUpload = async (file: string) => {

    if (!file) return;

    // Create preview
    


    setUploading(true);

    try {
      const response = await fetch("/api/user/profile/image", {
        method: "POST",
        body: JSON.stringify({ image: file }),
        cache: "no-store",
      });

      const data = await response.json();
      

      if (response.ok) {
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Show success message
        toast({ title: "Profile photo updated" });

        // Update session and reload
        try {
          await update({
            ...session,
            user: {
              ...session?.user,
              image: data.imageUrl,
            },
          });
        } catch (error) {
          console.error("Session update failed:", error);
        }
      } else {
        setImagePreview(null);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      setImagePreview(null);
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setUploading(false);
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: "Profile updated" });

        try {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: values.name,
            },
          });
        } catch (error) {
          console.error("Session update failed:", error);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        passwordForm.reset();
        toast({ title: "Password updated" });
      } else {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user", { method: "DELETE" });

      if (response.ok) {
        toast({ title: "Account deleted" });
        router.push("/auth/signout");
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Deletion failed",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-medium mb-6">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="overflow-hidden border border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">
                Profile Information
              </CardTitle>
            </CardHeader>

            {/* Profile Photo */}
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6">
                <div className="relative group mx-auto sm:mx-0">
                  <Avatar className="h-24 w-24 border border-border/40 shadow-sm">
                    <AvatarImage
                      className="object-cover"
                      src={imagePreview || session?.user?.image || ""}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="text-xl bg-primary/5">
                      {session?.user?.name
                        ? getInitials(session?.user?.name)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="font-medium">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Click on the avatar to change your photo
                  </p>

                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setImagePreview(res[0].url);
                      handleImageUpload(res[0].url);
                      toast({ title: "Profile photo updated" });
                    }}

                    config={{ cn: twMerge }}

                    appearance={{
                      button:
                        "ut-ready:bg-primary ut-uploading:cursor-not-allowed rounded-r-none bg-red-500 bg-none after:bg-orange-400",
                      container: "w-max flex-row rounded-md border-cyan-300 bg-slate-800",
                      allowedContent:
                        "flex h-8 flex-col items-center justify-center px-2 text-white",
                    }}
                  />
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Profile Form */}
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <FormLabel className="sm:w-24 sm:text-right">
                            Name
                          </FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <FormLabel className="sm:w-24 sm:text-right">
                      Email
                    </FormLabel>
                    <div className="flex-1">
                      <Input
                        value={session?.user?.email || ""}
                        disabled
                        className="bg-muted/30"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email address cannot be changed
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      disabled={
                        isUpdatingProfile || !profileForm.formState.isDirty
                      }
                      className="gap-2"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {/* Password Card */}
          <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span>Password</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <FormLabel className="sm:w-36 sm:text-right">
                            Current Password
                          </FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <Input
                                type="password"
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <FormLabel className="sm:w-36 sm:text-right">
                            New Password
                          </FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <Input
                                type="password"
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground mt-1">
                              Minimum 8 characters
                            </p>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <FormLabel className="sm:w-36 sm:text-right">
                            Confirm Password
                          </FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <Input
                                type="password"
                                className="bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      disabled={
                        isUpdatingPassword || !passwordForm.formState.isDirty
                      }
                      className="gap-2"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">
                Account Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sign Out */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <span>Sign Out</span>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign out from your current session
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/auth/signout")}
                >
                  Sign Out
                </Button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                <div>
                  <h4 className="font-medium flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background/95 backdrop-blur-sm border-border/40">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your account and all
                        associated data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 gap-2"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
