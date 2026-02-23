import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function OrdensPage() {
  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Crie e gerencie as ordens de serviço da oficina."
        action={
          <Link href="/dashboard/ordens/nova" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Ordem
            </Button>
          </Link>
        }
      />
      <Card className="flex h-96 items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhuma ordem de serviço criada</p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Ordem" para começar.
          </p>
        </div>
      </Card>
    </div>
  );
}
