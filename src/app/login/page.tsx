"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GovernmentLogin } from "@/components/login/government-login";
import { useSenseIT, SenseITProvider } from "@/components/senseit-provider";

function LoginContent() {
  const { isAuthenticated } = useSenseIT();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return <GovernmentLogin />;
}

export default function LoginPage() {
  return (
    <SenseITProvider initialAssets={[]} initialLandfallIso={new Date().toISOString()}>
      <LoginContent />
    </SenseITProvider>
  );
}
