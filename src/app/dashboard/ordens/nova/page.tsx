import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";

export default function NovaOrdemPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Ordem de Serviço"
        description="Preencha os dados para gerar uma nova OS."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select>
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa do Veículo</Label>
                  <Input id="placa" placeholder="ABC-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo do Veículo</Label>
                  <Input id="modelo" placeholder="Ex: Toyota Corolla" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="problema">Problema Relatado</Label>
                <Textarea id="problema" placeholder="Descreva o problema relatado pelo cliente..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Serviços e Peças</CardTitle>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Troca de óleo</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell className="text-right">R$ 150,00</TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Filtro de ar</TableCell>
                    <TableCell>Peça</TableCell>
                    <TableCell className="text-right">R$ 45,50</TableCell>
                    <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumo da OS</CardTitle>
              <CardDescription>Revise os totais antes de salvar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal Serviços</span>
                <span>R$ 150,00</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal Peças</span>
                <span>R$ 45,50</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ 195,50</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg">Salvar Ordem de Serviço</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
