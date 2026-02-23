"use client";

import { Wrench } from "lucide-react";
import { useEffect } from "react";

export default function PrintOrdemPage({ params }: { params: { id: string } }) {
  
  useEffect(() => {
    // This will run only on the client side after the component mounts
    setTimeout(() => {
        window.print();
    }, 500); // Small delay to ensure content is rendered
  }, []);
  
  // Mock data - in a real app, you would fetch this based on params.id
  const order = {
    id: params.id,
    numero: '00123',
    cliente: 'João da Silva',
    telefone: '(11) 98765-4321',
    veiculo: 'Toyota Corolla',
    placa: 'ABC-1234',
    dataCriacao: '15 de Julho de 2024',
    items: [
      { id: 1, tipo: 'Serviço', nome: 'Troca de óleo do motor', preco: 150.00 },
      { id: 2, tipo: 'Peça', nome: 'Filtro de óleo', preco: 45.50 },
      { id: 3, tipo: 'Peça', nome: 'Óleo 5W30 Sintético (4L)', preco: 180.00 },
      { id: 4, tipo: 'Serviço', nome: 'Alinhamento e Balanceamento', preco: 120.00 },
    ],
  };

  const total = order.items.reduce((acc, item) => acc + item.preco, 0);

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
            <p className="font-semibold">OS #{order.numero}</p>
            <p className="text-sm">{order.dataCriacao}</p>
        </div>
      </header>

      <section className="my-6 grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Cliente</h2>
          <p>{order.cliente}</p>
          <p>{order.telefone}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Veículo</h2>
          <p>{order.veiculo}</p>
          <p>{order.placa}</p>
        </div>
      </section>

      <section className="my-6">
        <table className="w-full text-left">
          <thead className="bg-muted print:bg-gray-200">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2">Tipo</th>
              <th className="p-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.nome}</td>
                <td className="p-2">{item.tipo}</td>
                <td className="p-2 text-right">R$ {item.preco.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
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
