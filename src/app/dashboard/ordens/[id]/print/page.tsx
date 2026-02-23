"use client";

import { Wrench } from "lucide-react";
import { useEffect } from "react";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { ServiceOrder } from "@/lib/types";

export default function PrintOrdemPage({ params }: { params: { id: string } }) {
  
  const { firestore } = useFirebase();
  const orderRef = useMemoFirebase(() => doc(firestore, "serviceOrders", params.id), [firestore, params.id]);
  const { data: order, isLoading } = useDoc<ServiceOrder>(orderRef);
  
  useEffect(() => {
    if (order) {
      setTimeout(() => {
          window.print();
      }, 500); 
    }
  }, [order]);
  
  if (isLoading || !order) {
    return (
        <div className="flex h-screen items-center justify-center bg-card text-card-foreground">
             <div className="text-center">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                <h1 className="mt-4 text-xl font-semibold">Carregando dados da OS...</h1>
             </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-card text-card-foreground print:bg-white print:text-black">
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      
      <header className="flex justify-between items-center pb-4 border-b border-border">
        <div className="flex items-center gap-3">
            <Wrench className="h-10 w-10 text-primary print:text-black" />
            <div>
                <h1 className="text-2xl font-bold">Oficina do Gi</h1>
                <p className="text-sm text-muted-foreground print:text-gray-600">Ordem de Serviço</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-semibold">OS #{order.orderNumber}</p>
            <p className="text-sm">{new Date(order.issueDate.seconds * 1000).toLocaleDateString('pt-BR')}</p>
        </div>
      </header>

      <section className="my-6 grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Cliente</h2>
          <p>{order.customerName}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Veículo</h2>
          <p>{order.vehicleModel}</p>
          <p>Placa: {order.vehiclePlate}</p>
        </div>
      </section>

      <section className="my-6">
        <h3 className="font-semibold mb-2">Problema Relatado</h3>
        <p className="text-sm">{order.notes || "Nenhum problema relatado."}</p>
      </section>

      <section className="my-6">
        <h3 className="font-semibold mb-2">Itens da Ordem de Serviço</h3>
        <table className="w-full text-left">
          <thead className="bg-muted print:bg-gray-200">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2">Tipo</th>
              <th className="p-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
             {order.serviceLineItems.map((item, index) => (
                <tr key={`service-${index}`} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">Serviço</td>
                    <td className="p-2 text-right">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
                ))}
             {order.partLineItems.map((item, index) => (
                <tr key={`part-${index}`} className="border-b">
                    <td className="p-2">{item.quantity}x {item.name}</td>
                    <td className="p-2">Peça</td>
                    <td className="p-2 text-right">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        </div>
      </section>

      <footer className="mt-12 pt-4 border-t text-center text-xs text-muted-foreground print:text-gray-500">
        <p>Agradecemos a preferência!</p>
        <p>Oficina do Gi - Contato: (XX) XXXX-XXXX</p>
      </footer>
    </div>
  );
}
