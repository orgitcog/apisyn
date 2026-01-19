import React, { useState } from "react";
import {
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Link,
} from "@shopify/polaris";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { signIn, loading, isTestMode, toggleTestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        // Redirect to the page they were trying to access or dashboard
        navigate(from, { replace: true });
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Log in to your Shopify Enterprise Dashboard
          </p>
        </div>

        <Card>
          <Card.Section>
            {errorMessage && (
              <div className="mb-4">
                <Banner status="critical" onDismiss={() => setErrorMessage("")}>
                  <p>{errorMessage}</p>
                </Banner>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={email}
                  onChange={setEmail}
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  requiredIndicator
                  prefix={<Mail className="w-4 h-4" />}
                />

                <TextField
                  value={password}
                  onChange={setPassword}
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  requiredIndicator
                  prefix={<Lock className="w-4 h-4" />}
                />

                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link url="/forgot-password">Forgot password?</Link>
                </div>

                <Button submit primary fullWidth loading={loading}>
                  Log in
                </Button>

                <div className="text-center mt-4">
                  <Text variant="bodyMd" as="p">
                    Don't have an account? <Link url="/signup">Sign up</Link>
                  </Text>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button onClick={toggleTestMode} fullWidth plain>
                    {isTestMode ? "Disable Test Mode" : "Enable Test Mode"}
                  </Button>
                </div>
              </FormLayout>
            </form>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
}
