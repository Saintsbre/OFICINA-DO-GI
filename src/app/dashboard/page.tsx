"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, Timestamp, doc, serverTimestamp } from "firebase/firestore";
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import type { Customer, ServiceOrder, ServiceOrderStatus } from "@/lib/types";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { PageHeader } from "@/components/shared/PageHeader";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Wrench, Users, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const getStatusVariant = (status?: ServiceOrderStatus) => {
    switch(status) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'open': return 'outline';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
};

const getStatusLabel = (status?: ServiceOrderStatus, date?: any) => {
    const labels: Record<ServiceOrderStatus, string> = {
      open: 'Aberta',
      'in progress': 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      scheduled: 'Agendada'
    };
    
    if (status === 'scheduled' && date) {
      try {
        return `Agendada (${new Date(date.seconds * 1000).toLocaleDateString('pt-BR')})`;
      } catch (e) {
        return 'Data inválida';
      }
    }
    
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
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfMonth(now) };
  });

  const customersRef = useMemoFirebase(() => collection(firestore, "customers"), [firestore]);
  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Customer>(customersRef);

  const serviceOrdersQuery = useMemoFirebase(() => 
    query(collection(firestore, "serviceOrders"), orderBy("issueDate", "desc")),
    [firestore]
  );
  const { data: serviceOrders, isLoading: isLoadingOrders } = useCollection<ServiceOrder>(serviceOrdersQuery);
  
  const handleFinalizeOrder = (order: ServiceOrder) => {
    const orderRef = doc(firestore, "serviceOrders", order.id);
    updateDocumentNonBlocking(orderRef, {
        status: 'completed',
        completionDate: serverTimestamp()
    });
    toast({
        title: "Ordem finalizada!",
        description: `A OS #${order.orderNumber} foi marcada como concluída.`
    });
  };

  const stats = useMemo(() => {
    const startDate = date?.from;
    const endDate = date?.to;
      
    const periodProfit = serviceOrders
      ?.filter(order => {
        if (order.status !== 'completed' || !order.completionDate || !startDate) {
            return false;
        }
        const completionDate = (order.completionDate as unknown as Timestamp).toDate();
        
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        if (!endDate) {
            return completionDate >= startOfDay;
        }

        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        return completionDate >= startOfDay && completionDate <= endOfDay;
      })
      .reduce((acc, order) => acc + (order.totalAmount - (order.totalCost || 0)), 0) || 0;
      
    const openOrders = serviceOrders?.filter(order => ['open', 'in progress', 'scheduled'].includes(order.status)).length || 0;
    
    const customerCount = customers?.length || 0;

    return {
      periodProfit,
      openOrders,
      customerCount,
    }
  }, [serviceOrders, customers, date]);
  
  const getPeriodLabel = () => {
    if (!date?.from) return "no período selecionado";
    const from = format(date.from, 'dd/MM/yy', { locale: ptBR });
    if (!date.to) return `a partir de ${from}`;
    const to = format(date.to, 'dd/MM/yy', { locale: ptBR });
    if (from === to) return `em ${from}`;
    return `de ${from} a ${to}`;
  }
  
  const setPresetDateRange = (preset: '7' | '15' | '30' | 'month') => {
    const end = new Date();
    let start: Date;

    if (preset === 'month') {
      start = startOfMonth(end);
      setDate({ from: start, to: endOfMonth(end) });
    } else {
      start = subDays(end, Number(preset) - 1);
      setDate({ from: start, to: end });
    }
  }

  const recentOrders = serviceOrders?.slice(0, 5) || [];
  
  const isLoading = isLoadingCustomers || isLoadingOrders;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Uma visão geral da sua oficina em tempo real."
        action={
            <DateRangePicker date={date} setDate={setDate} />
        }
      />
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => setPresetDateRange('7')}>Últimos 7 dias</Button>
        <Button variant="outline" size="sm" onClick={() => setPresetDateRange('15')}>Últimos 15 dias</Button>
        <Button variant="outline" size="sm" onClick={() => setPresetDateRange('30')}>Últimos 30 dias</Button>
        <Button variant="outline" size="sm" onClick={() => setPresetDateRange('month')}>Este Mês</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Lucro Líquido no Período"
          value={stats.periodProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description={`Receita de OS concluídas ${getPeriodLabel()}`}
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
                      <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status, order.scheduledDate)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                     <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <Button variant="outline" size="sm" onClick={() => handleFinalizeOrder(order)}>
                                  <CheckCircle className="mr-2 h-3 w-3" />
                                  Finalizar
                              </Button>
                          )}
                          <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/ordens/${order.id}`}>Ver Detalhes</Link>
                          </Button>
                        </div>
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
