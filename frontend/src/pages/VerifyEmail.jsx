import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import logo from "../assets/logo.png";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const hasVerified = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyEmailToken();
    } else if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      if (hasVerified.current === false) {
        hasVerified.current = true;
      }

      setStatus("verifying");

      const response = await api.get(`/staff/verify/${token}`);

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } else {
        setStatus("error");
        setMessage(response.data.message || "Verification failed");
      }
    } catch (error) {
      // Check if it's an expired token error
      if (error.response?.data?.message &&
        (error.response.data.message.toLowerCase().includes("expired") ||
          error.response.data.message.toLowerCase().includes("expire"))) {
        setStatus("expired");
        setMessage("Verification link has expired. Please enter your email below to request a new verification email.");
        // Try to extract email from error response if available
        if (error.response?.data?.email) {
          setEmail(error.response.data.email);
        }
      } else {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);
    try {
      const response = await api.post('/staff/resend-verification', { email });

      if (response.data.success) {
        toast.success("Verification email sent successfully! Please check your inbox.");
        setMessage("A new verification email has been sent. Please check your inbox and click the verification link. You can resend again if needed.");
        // Keep status as "expired" so user can resend again if needed
        // Don't redirect to login - let them stay on the page
      } else {
        toast.error(response.data.message || "Failed to send verification email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send verification email");
    } finally {
      setIsResending(false);
    }
  };

  const handleManualRedirect = () => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button
              onClick={handleManualRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Go to Login
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Go to Login
              </Button>
              <p className="text-sm text-gray-500">
                You can request a new verification email from the login page.
              </p>
            </div>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Link Expired
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isResending}
                />
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !email.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Go to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 size-16 rounded-full bg-black grid place-items-center">
            <img src={logo} alt="Cockpit" className="size-12 object-contain invert" />
          </div>
          <CardTitle>Cockpit Management System</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
