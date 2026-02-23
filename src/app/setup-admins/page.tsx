"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function SetupAdminsPage() {
  const { signup, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const setupInProgress = useRef(false);

  useEffect(() => {
    if (setupInProgress.current || !signup || !logout) {
      return;
    }
    setupInProgress.current = true;

    const setupAdmins = async () => {
      let createdCount = 0;
      try {
        // Attempt to create Breno
        await signup("Breno", "breno@oficina.com", "Coelho", true);
        createdCount++;
      } catch (e: any) {
        if (e.code !== 'auth/email-already-in-use') throw e; // Rethrow unexpected errors
      }
      await logout();

      try {
        // Attempt to create Gi
        await signup("Gi", "gi@oficina.com", "Coelho", true);
        createdCount++;
      } catch (e: any) {
        if (e.code !== 'auth/email-already-in-use') throw e; // Rethrow unexpected errors
      }
      await logout();

      if (createdCount > 0) {
        toast({
          title: "Sucesso!",
          description: `Foram criados ${createdCount} novo(s) usuário(s) administrador(es).`,
        });
      } else {
        toast({
          title: "Setup Verificado",
          description: "Os usuários administradores já existem.",
        });
      }

      router.replace("/login");
    };

    setupAdmins().catch((err) => {
      console.error("Admin setup failed catastrophically:", err);
      // The signup function would have already shown a toast.
      // We still redirect to login so the user isn't stuck.
      router.replace("/login");
    });
  }, [signup, logout, toast, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        <h1 className="mt-4 text-xl font-semibold">Configurando...</h1>
        <p className="text-muted-foreground">Verificando e criando usuários administradores. Aguarde.</p>
      </div>
    </div>
  );
}
