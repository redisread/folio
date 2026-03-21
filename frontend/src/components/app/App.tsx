import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ThreeColumnLayout } from "./layout/ThreeColumnLayout";
import { KeyboardShortcuts } from "./common/KeyboardShortcuts";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user) {
        setIsAuthenticated(true);
      } else {
        window.location.href = "/login";
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-main)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <KeyboardShortcuts />
      <ThreeColumnLayout />
    </>
  );
}
