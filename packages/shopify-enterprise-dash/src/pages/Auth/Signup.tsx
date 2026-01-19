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
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    if (!email || !password || !confirmPassword) {
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
      const { error, _data } = await signUp(email, password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          "Account created successfully! Please check your email to confirm your account.",
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-gray-600 mt-2">
            Join the Shopify Enterprise Dashboard
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
                  value={name}
                  onChange={setName}
                  label="Name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  prefix={<User className="w-4 h-4" />}
                />

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
                  autoComplete="new-password"
                  placeholder="••••••••"
                  requiredIndicator
                  prefix={<Lock className="w-4 h-4" />}
                  helpText="Password must be at least 6 characters"
                />

                <TextField
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  requiredIndicator
                  prefix={<Lock className="w-4 h-4" />}
                />

                <Button submit primary fullWidth loading={loading}>
                  Create Account
                </Button>

                <div className="text-center mt-4">
                  <Text variant="bodyMd" as="p">
                    Already have an account? <Link url="/login">Log in</Link>
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
