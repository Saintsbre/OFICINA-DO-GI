"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Printer, Edit, ChevronDown } from "lucide-react";
import { useFirebase, useDoc, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import type { ServiceOrder, ServiceOrderStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function OrdemDetalhePage({ params }: { params: { id: string } }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const orderRef = useMemoFirebase(() => doc(firestore, "serviceOrders", params.id), [firestore, params.id]);
  const { data: order, isLoading } = useDoc<ServiceOrder>(orderRef);

  const getStatusVariant = (status?: ServiceOrderStatus) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'open': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status?: ServiceOrderStatus) => {
    const labels: Record<ServiceOrderStatus, string> = {
      open: 'Aberta',
      'in progress': 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };
    return status ? labels[status] : 'Carregando...';
  }

  const handleStatusChange = (newStatus: ServiceOrderStatus) => {
    if (!order) return;
    const updateData: { status: ServiceOrderStatus, completionDate?: any } = { status: newStatus };
    if (newStatus === 'completed' || newStatus === 'cancelled') {
        updateData.completionDate = serverTimestamp();
    }
    updateDocumentNonBlocking(orderRef, updateData);
    toast({
        title: "Status atualizado!",
        description: `A OS foi marcada como ${getStatusLabel(newStatus)}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <PageHeader title="Ordem de Serviço não encontrada" />
        <Card>
          <CardContent className="pt-6">
            <p>A ordem de serviço que você está procurando não existe ou foi removida.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Ordem de Serviço #${order.orderNumber}`}
        description={`Detalhes da OS para ${order.customerName}`}
        action={
          <div className="flex gap-2">
            <Link href={`/dashboard/ordens/${order.id}/print`} passHref>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" /> Alterar Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleStatusChange('open')}>Marcar como Aberta</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('in progress')}>Marcar como Em Andamento</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('completed')}>Marcar como Concluída</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('cancelled')}>Marcar como Cancelada</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <div><span className="font-medium">Cliente: </span>{order.customerName}</div>
              <div><span className="font-medium">Veículo: </span>{order.vehicleModel}</div>
              <div><span className="font-medium">Placa: </span>{order.vehiclePlate}</div>
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
                  {order.serviceLineItems.map((item, index) => (
                    <TableRow key={`service-${index}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell className="text-right">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  ))}
                  {order.partLineItems.map((item, index) => (
                    <TableRow key={`part-${index}`}>
                      <TableCell>{item.quantity}x {item.name}</TableCell>
                      <TableCell>Peça</TableCell>
                      <TableCell className="text-right">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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
                <Badge variant={getStatusVariant(order.status)} className="capitalize text-sm">{getStatusLabel(order.status)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data de Criação</span>
                <span>{new Date(order.issueDate.seconds * 1000).toLocaleDateString('pt-BR')}</span>
              </div>
              {order.notes && (
                <div>
                    <span className="text-muted-foreground text-sm">Problema Relatado</span>
                    <p className="text-sm">{order.notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span>{order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled>Registrar Pagamento</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
