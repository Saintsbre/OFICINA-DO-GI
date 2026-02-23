import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function ClientesPage() {
  return (
    <div>
      <PageHeader
        title="Gestão de Clientes"
        description="Adicione, edite e visualize os seus clientes e seus veículos."
        action={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        }
      />
      <Card className="flex h-96 items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
          <p className="text-sm text-muted-foreground">
            Clique em "Novo Cliente" para começar.
          </p>
        </div>
      </Card>
    </div>
  );
}
