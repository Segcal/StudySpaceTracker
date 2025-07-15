import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  nin: z.string().min(10, "NIN must be at least 10 characters"),
  propertyId: z.string().min(3, "Property ID must be at least 3 characters"),
  propertyAddress: z.string().min(10, "Property address must be at least 10 characters"),
  propertyValue: z.number().min(1, "Property value must be greater than 0"),
  income: z.number().min(1, "Income must be greater than 0"),
  electricBill: z.number().min(0, "Electric bill cannot be negative"),
  gasBill: z.number().min(0, "Gas bill cannot be negative"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      nin: "",
      propertyId: "",
      propertyAddress: "",
      propertyValue: 0,
      income: 0,
      electricBill: 0,
      gasBill: 0,
      password: "",
      agreeToTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      // First create the tax profile, then redirect to login
      await apiRequest("POST", "/api/tax-profile", {
        fullName: data.fullName,
        nin: data.nin,
        propertyId: data.propertyId,
        propertyAddress: data.propertyAddress,
        propertyValue: data.propertyValue,
        income: data.income,
        electricBill: data.electricBill,
        gasBill: data.gasBill,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your tax profile has been created. Please log in to continue.",
      });
      // Redirect to login
      window.location.href = '/api/login';
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
              <p className="text-gray-600">Join TaxEase and start managing your taxes professionally</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nin" className="text-sm font-medium text-gray-700">National ID Number (NIN)</Label>
                    <Input
                      id="nin"
                      {...form.register("nin")}
                      placeholder="Enter your NIN"
                      className="mt-1"
                    />
                    {form.formState.errors.nin && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.nin.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="propertyId" className="text-sm font-medium text-gray-700">Property ID</Label>
                    <Input
                      id="propertyId"
                      {...form.register("propertyId")}
                      placeholder="Property identification"
                      className="mt-1"
                    />
                    {form.formState.errors.propertyId && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyId.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="propertyAddress" className="text-sm font-medium text-gray-700">Property Address</Label>
                  <Textarea
                    id="propertyAddress"
                    {...form.register("propertyAddress")}
                    placeholder="Enter complete property address"
                    rows={3}
                    className="mt-1"
                  />
                  {form.formState.errors.propertyAddress && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyAddress.message}</p>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="propertyValue" className="text-sm font-medium text-gray-700">Property Value ($)</Label>
                    <Input
                      id="propertyValue"
                      type="number"
                      {...form.register("propertyValue", { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {form.formState.errors.propertyValue && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.propertyValue.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="income" className="text-sm font-medium text-gray-700">Annual Income ($)</Label>
                    <Input
                      id="income"
                      type="number"
                      {...form.register("income", { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {form.formState.errors.income && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.income.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="electricBill" className="text-sm font-medium text-gray-700">Monthly Electric Bill ($)</Label>
                    <Input
                      id="electricBill"
                      type="number"
                      {...form.register("electricBill", { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {form.formState.errors.electricBill && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.electricBill.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="gasBill" className="text-sm font-medium text-gray-700">Monthly Gas Bill ($)</Label>
                    <Input
                      id="gasBill"
                      type="number"
                      {...form.register("gasBill", { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                    {form.formState.errors.gasBill && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.gasBill.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    placeholder="Create a secure password"
                    className="mt-1"
                  />
                  {form.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={form.watch("agreeToTerms")}
                    onCheckedChange={(checked) => form.setValue("agreeToTerms", checked as boolean)}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-primary-800 hover:text-primary-700">Terms of Service</a> and <a href="#" className="text-primary-800 hover:text-primary-700">Privacy Policy</a>
                  </label>
                </div>
                {form.formState.errors.agreeToTerms && (
                  <p className="text-red-500 text-sm">{form.formState.errors.agreeToTerms.message}</p>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-primary-800 hover:bg-primary-700 text-white py-3"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => window.location.href = '/api/login'}
                    className="text-primary-800 hover:text-primary-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
