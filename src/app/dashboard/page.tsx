"use client";

import { useMemo } from "react";
import Link from "next/link";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import type { Customer, ServiceOrder, ServiceOrderStatus } from "@/lib/types";

import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Wrench, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusVariant = (status?: ServiceOrderStatus) => {
    switch(status) {
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

const StatCard = ({ title, value, icon, description, isLoading }: { title: string, value: string | number, icon: React.ReactNode, description?: string, isLoading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </>
      )}
    </CardContent>
  </Card>
);


export default function DashboardPage() {
  const { firestore } = useFirebase();

  const customersRef = useMemoFirebase(() => collection(firestore, "customers"), [firestore]);
  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Customer>(customersRef);

  const serviceOrdersQuery = useMemoFirebase(() => 
    query(collection(firestore, "serviceOrders"), orderBy("issueDate", "desc")),
    [firestore]
  );
  const { data: serviceOrders, isLoading: isLoadingOrders } = useCollection<ServiceOrder>(serviceOrdersQuery);
  
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyProfit = serviceOrders
      ?.filter(order => 
        order.status === 'completed' &&
        order.completionDate &&
        (order.completionDate as unknown as Timestamp).toDate() >= startOfMonth
      )
      .reduce((acc, order) => acc + (order.totalAmount - (order.totalCost || 0)), 0) || 0;
      
    const openOrders = serviceOrders?.filter(order => order.status === 'open' || order.status === 'in progress').length || 0;
    
    const customerCount = customers?.length || 0;

    return {
      monthlyProfit,
      openOrders,
      customerCount,
    }
  }, [serviceOrders, customers]);
  
  const recentOrders = serviceOrders?.slice(0, 5) || [];
  
  const isLoading = isLoadingCustomers || isLoadingOrders;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Uma visão geral da sua oficina em tempo real."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Lucro Líquido do Mês"
          value={stats.monthlyProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Receita de OS concluídas (venda - custo)"
          isLoading={isLoading}
        />
        <StatCard
          title="Ordens em Aberto"
          value={stats.openOrders}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          description="Serviços aguardando conclusão"
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Clientes"
          value={stats.customerCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Clientes cadastrados no sistema"
          isLoading={isLoading}
        />
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Ordens de Serviço Recentes</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
