import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function EstoquePage() {
  return (
    <div>
      <PageHeader
        title="Controle de Estoque"
        description="Gerencie as peças e produtos da sua oficina."
        action={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Peça
          </Button>
        }
      />
      <Card className="flex h-96 items-center justify-center border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhuma peça em estoque</p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Peça" para adicionar itens ao seu inventário.
          </p>
        </div>
      </Card>
    </div>
  );
}
