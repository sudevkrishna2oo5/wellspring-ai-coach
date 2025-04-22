
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNavbar from "@/components/BottomNavbar";
import { Check } from "lucide-react";

const PaymentDemo = () => {
  const handlePayment = () => {
    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // This would be your test key
      amount: 50000, // Amount in paise (500 INR)
      currency: "INR",
      name: "FitVibe Consultation",
      description: "Expert Consultation Session",
      handler: (response: any) => {
        console.log("Payment successful", response);
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Demo User",
        email: "demo@example.com",
      },
      theme: {
        color: "#7C3AED",
      },
    };

    // @ts-ignore
    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Expert Consultation</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Premium Consultation Package</CardTitle>
            <CardDescription>30-minute session with our fitness expert</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Personalized fitness guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Diet plan recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Progress tracking tips</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <div className="text-2xl font-bold mb-4">₹500.00</div>
              <Button 
                className="w-full"
                onClick={handlePayment}
              >
                Pay Now
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default PaymentDemo;
