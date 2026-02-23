import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div>
      <PageHeader
        title="Controle Financeiro"
        description="Acompanhe as entradas e saídas da sua oficina."
        action={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        }
      />
      <Tabs defaultValue="entradas">
        <TabsList className="grid w-full grid-cols-2 md:w-96">
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="saidas">Saídas</TabsTrigger>
        </TabsList>
        <TabsContent value="entradas">
          <Card className="flex min-h-96 items-center justify-center border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma entrada registrada</p>
              <p className="text-sm text-muted-foreground">
                Pagamentos de ordens de serviço aparecerão aqui.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="saidas">
          <Card className="flex min-h-96 items-center justify-center border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma saída registrada</p>
              <p className="text-sm text-muted-foreground">
                Clique em "Nova Despesa" para registrar uma saída.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
