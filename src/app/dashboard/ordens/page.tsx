"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { ServiceOrder, ServiceOrderStatus } from "@/lib/types";

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

export default function OrdensPage() {
  const { firestore } = useFirebase();

  const serviceOrdersQuery = useMemoFirebase(() => 
    query(collection(firestore, "serviceOrders"), orderBy("issueDate", "desc")),
    [firestore]
  );
  const { data: serviceOrders, isLoading } = useCollection<ServiceOrder>(serviceOrdersQuery);

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
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Carregando ordens de serviço...
                  </TableCell>
                </TableRow>
              ) : serviceOrders && serviceOrders.length > 0 ? (
                serviceOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.vehicleModel} ({order.vehiclePlate})</TableCell>
                    <TableCell>{new Date(order.issueDate.seconds * 1000).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/ordens/${order.id}`}>Ver Detalhes</Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhuma ordem de serviço criada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
