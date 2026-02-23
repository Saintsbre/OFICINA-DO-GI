import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Edit } from "lucide-react";

export default function OrdemDetalhePage({ params }: { params: { id: string } }) {
  // Mock data - in a real app, you would fetch this based on params.id
  const order = {
    id: params.id,
    numero: '00123',
    cliente: 'João da Silva',
    telefone: '(11) 98765-4321',
    veiculo: 'Toyota Corolla',
    placa: 'ABC-1234',
    status: 'concluída',
    dataCriacao: '15/07/2024',
    items: [
      { id: 1, tipo: 'Serviço', nome: 'Troca de óleo do motor', preco: '150.00' },
      { id: 2, tipo: 'Peça', nome: 'Filtro de óleo', preco: '45.50' },
      { id: 3, tipo: 'Peça', nome: 'Óleo 5W30 Sintético (4L)', preco: '180.00' },
      { id: 4, tipo: 'Serviço', nome: 'Alinhamento e Balanceamento', preco: '120.00' },
    ],
    total: '495.50'
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'concluída': return 'default';
      case 'em andamento': return 'secondary';
      case 'aberta': return 'outline';
      default: return 'destructive';
    }
  }

  return (
    <div>
      <PageHeader
        title={`Ordem de Serviço #${order.numero}`}
        description={`Detalhes da OS para ${order.cliente}`}
        action={
          <div className="flex gap-2">
             <Link href={`/dashboard/ordens/${order.id}/print`} passHref>
                <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
            </Link>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Editar Status
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Cliente e Veículo</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Cliente: </span>{order.cliente}</div>
                    <div><span className="font-medium">Telefone: </span>{order.telefone}</div>
                    <div><span className="font-medium">Veículo: </span>{order.veiculo}</div>
                    <div><span className="font-medium">Placa: </span>{order.placa}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Itens e Custos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.nome}</TableCell>
                                    <TableCell>{item.tipo}</TableCell>
                                    <TableCell className="text-right">R$ {item.preco}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>Resumo e Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(order.status)} className="capitalize text-sm">{order.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Data de Criação</span>
                        <span>{order.dataCriacao}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span>R$ {order.total}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Registrar Pagamento</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  )
}
