import React, { useState, useEffect } from "react";
import {
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Link,
} from "@shopify/polaris";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if we have a hash for password reset
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) {
      setErrorMessage(
        "Invalid or missing reset token. Please try requesting a new password reset.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      // Get the hash token from the URL
      const _hash = window.location.hash.substring(1);

      // Use Supabase to update the password with the token
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Password has been reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Create a new password for your account
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
                  value={password}
                  onChange={setPassword}
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  requiredIndicator
                  prefix={<Lock className="w-4 h-4" />}
                  helpText="Password must be at least 6 characters"
                />

                <TextField
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  requiredIndicator
                  prefix={<Lock className="w-4 h-4" />}
                />

                <Button submit primary fullWidth loading={loading}>
                  Reset Password
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
