"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SetupAdminsPage() {
  const { signup, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleCreateAdmins = async () => {
    setIsLoading(true);
    try {
      // Create Breno
      await signup("Breno", "breno@oficina.com", "Coelho", true);
      toast({
        title: "Usuário Breno criado",
        description: "O usuário administrador Breno foi criado com sucesso.",
      });
      await logout(); // Logout to create the next user

      // Create Gi
      await signup("Gi", "gi@oficina.com", "Coelho", true);
      toast({
        title: "Usuário Gi criado",
        description: "O usuário administrador Gi foi criado com sucesso.",
      });
      await logout(); // Logout after the last creation

      setIsDone(true);
      toast({
        title: "Sucesso!",
        description: "Os usuários administradores foram criados.",
      });
    } catch (error: any) {
      console.error("Failed to create admins:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar administradores",
        description: error.message || "Ocorreu um problema ao criar os usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Configurar Administradores</CardTitle>
          <CardDescription>
            Clique no botão abaixo para criar os usuários administradores. Use os logins `Breno` ou `Gi` com a senha `Coelho`.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isDone ? (
            <>
              <div className="text-center text-green-500 font-bold p-4 bg-green-500/10 rounded-md">
                Administradores criados com sucesso!
              </div>
              <Link href="/login" passHref>
                <Button className="w-full">Ir para o Login</Button>
              </Link>
            </>
          ) : (
            <Button
              onClick={handleCreateAdmins}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></div>
              ) : (
                "Criar Administradores"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
