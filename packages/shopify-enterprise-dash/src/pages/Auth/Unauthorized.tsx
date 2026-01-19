import React from "react";
import { Card, EmptyState, Button } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { _ShieldOff } from "lucide-react";

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card>
        <Card.Section>
          <EmptyState
            heading="Access Denied"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p className="mb-6">
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate("/")} primary>
                Go to Dashboard
              </Button>
              <Button onClick={() => navigate("/login")}>
                Sign in with a different account
              </Button>
            </div>
          </EmptyState>
        </Card.Section>
      </Card>
    </div>
  );
}
