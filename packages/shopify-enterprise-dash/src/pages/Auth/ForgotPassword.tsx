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
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          "Password reset instructions have been sent to your email",
        );
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
      console.error("Password reset error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            We'll send you instructions to reset your password
          </p>
        </div>

        <Card>
          <Card.Section>
            {errorMessage && (
              <Banner status="critical" onDismiss={() => setErrorMessage("")}>
                <p>{errorMessage}</p>
              </Banner>
            )}

            {successMessage && (
              <Banner status="success" onDismiss={() => setSuccessMessage("")}>
                <p>{successMessage}</p>
              </Banner>
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

                <Button submit primary fullWidth loading={loading}>
                  Send Reset Instructions
                </Button>

                <div className="text-center mt-4">
                  <Text variant="bodyMd" as="p">
                    Remember your password? <Link url="/login">Log in</Link>
                  </Text>
                </div>
              </FormLayout>
            </form>
          </Card.Section>
        </Card>
      </div>
    </div>
  );
}
