import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import ContactModal from "@/components/contact-modal";
import TaxCard from "@/components/tax-card";
import PaymentWrapper from "@/components/payment-wrapper";
import AnalyticsChart from "@/components/analytics-chart";
import { apiRequest } from "@/lib/queryClient";
import type { TaxProfile } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    paymentType: 'income_tax' | 'property_tax' | 'utility_bill';
    title: string;
    clientSecret: string;
  } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: taxProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/tax-profile"],
    enabled: isAuthenticated,
    retry: false,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ amount, paymentType }: { amount: number; paymentType: string }) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount, paymentType });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setPaymentData({
        amount: variables.amount,
        paymentType: variables.paymentType as 'income_tax' | 'property_tax' | 'utility_bill',
        title: variables.paymentType.replace('_', ' ').toUpperCase(),
        clientSecret: data.clientSecret,
      });
      setIsPaymentModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Payment setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = (amount: number, paymentType: 'income_tax' | 'property_tax' | 'utility_bill') => {
    createPaymentIntentMutation.mutate({ amount, paymentType });
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!taxProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-16 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to TaxEase!</h2>
                <p className="text-gray-600 mb-6">
                  You don't have a tax profile yet. Please create one to get started.
                </p>
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="bg-primary-800 hover:bg-primary-700"
                >
                  Create Tax Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const profile = taxProfile as TaxProfile;
  const daysUntilDue = Math.ceil((new Date(profile.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {profile.fullName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-primary-800 hover:bg-primary-700 text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="relative">
            <TaxCard
              title="Income Tax"
              icon="receipt"
              iconColor="primary"
              items={[
                { label: "Annual Income:", value: `$${profile.income.toLocaleString()}` },
                { label: "Tax Due:", value: `$${profile.incomeTaxDue.toLocaleString()}`, isHighlighted: true },
                { label: "Due Date:", value: new Date(profile.dueDate).toLocaleDateString() },
              ]}
              status={daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : "Overdue"}
              statusColor={daysUntilDue > 30 ? "success" : daysUntilDue > 0 ? "warning" : "error"}
            />
            <div className="absolute bottom-4 left-6 right-6">
              <Button
                onClick={() => handlePayment(profile.incomeTaxDue, 'income_tax')}
                className="w-full bg-primary-800 hover:bg-primary-700 text-white"
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <TaxCard
              title="Property Tax"
              icon="home"
              iconColor="success"
              items={[
                { label: "Property Value:", value: `$${profile.propertyValue.toLocaleString()}` },
                { label: "Property Tax:", value: `$${profile.propertyTax.toLocaleString()}`, isHighlighted: true },
                { label: "Property ID:", value: profile.propertyId },
              ]}
              status="Paid"
              statusColor="success"
            />
            <div className="absolute bottom-4 left-6 right-6">
              <Button
                onClick={() => handlePayment(profile.propertyTax, 'property_tax')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <TaxCard
              title="Utility Bills"
              icon="bolt"
              iconColor="warning"
              items={[
                { label: "Electric Bill:", value: `$${profile.electricBill}` },
                { label: "Gas Bill:", value: `$${profile.gasBill}` },
                { label: "Total Monthly:", value: `$${profile.electricBill + profile.gasBill}`, isHighlighted: true },
              ]}
              status="Payment pending"
              statusColor="warning"
            />
            <div className="absolute bottom-4 left-6 right-6">
              <Button
                onClick={() => handlePayment(profile.electricBill + profile.gasBill, 'utility_bill')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card>
          <Tabs defaultValue="income" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4 rounded-none bg-transparent h-auto">
                <TabsTrigger 
                  value="income" 
                  className="py-4 border-b-2 border-transparent data-[state=active]:border-primary-800 data-[state=active]:text-primary-800 rounded-none"
                >
                  Income Details
                </TabsTrigger>
                <TabsTrigger 
                  value="property" 
                  className="py-4 border-b-2 border-transparent data-[state=active]:border-primary-800 data-[state=active]:text-primary-800 rounded-none"
                >
                  Property Details
                </TabsTrigger>
                <TabsTrigger 
                  value="utilities" 
                  className="py-4 border-b-2 border-transparent data-[state=active]:border-primary-800 data-[state=active]:text-primary-800 rounded-none"
                >
                  Utilities
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="py-4 border-b-2 border-transparent data-[state=active]:border-primary-800 data-[state=active]:text-primary-800 rounded-none"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="income" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Tax Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Annual Gross Income:</span>
                    <span className="font-semibold">${profile.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tax Rate:</span>
                    <span className="font-semibold">17%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tax Due:</span>
                    <span className="font-semibold text-red-600">${profile.incomeTaxDue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">NIN:</span>
                    <span className="font-semibold">***-**-{profile.nin.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Filing Status:</span>
                    <span className="font-semibold">Single</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold text-yellow-600">{new Date(profile.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="property" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property ID:</span>
                    <span className="font-semibold">{profile.propertyId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property Value:</span>
                    <span className="font-semibold">${profile.propertyValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property Tax:</span>
                    <span className="font-semibold text-green-600">${profile.propertyTax.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-gray-600 block mb-1">Property Address:</span>
                    <span className="font-semibold">{profile.propertyAddress}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tax Rate:</span>
                    <span className="font-semibold">1.2%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-semibold text-green-600">Paid</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="utilities" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utility Bills</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Electric Bill</h4>
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Average:</span>
                        <span className="font-semibold">${profile.electricBill}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Total:</span>
                        <span className="font-semibold">${profile.electricBill * 12}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Due:</span>
                        <span className="font-semibold text-yellow-600">March 15, 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Gas Bill</h4>
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Average:</span>
                        <span className="font-semibold">${profile.gasBill}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Total:</span>
                        <span className="font-semibold">${profile.gasBill * 12}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Due:</span>
                        <span className="font-semibold text-yellow-600">March 20, 2024</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Analytics</h3>
              <AnalyticsChart />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      
      {paymentData && (
        <PaymentWrapper
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentData(null);
          }}
          amount={paymentData.amount}
          paymentType={paymentData.paymentType}
          title={paymentData.title}
          clientSecret={paymentData.clientSecret}
        />
      )}
    </div>
  );
}
