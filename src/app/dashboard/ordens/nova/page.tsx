"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, serverTimestamp } from 'firebase/firestore';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useFirebase, useCollection, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { useToast } from '@/hooks/use-toast';
import type { Customer, Service, Part, ServiceLineItem, PartLineItem } from '@/lib/types';


const serviceOrderFormSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente."),
  vehiclePlate: z.string().min(7, "A placa deve ter 7 caracteres.").max(8, "A placa deve ter no máximo 8 caracteres."),
  vehicleModel: z.string().min(2, "Insira o modelo do veículo."),
  notes: z.string().optional(),
  scheduledDate: z.date().optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderFormSchema>;

type ItemToAdd = (Service | Part) & { itemType: 'service' | 'part' };

export default function NovaOrdemPage() {
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [serviceLineItems, setServiceLineItems] = useState<ServiceLineItem[]>([]);
  const [partLineItems, setPartLineItems] = useState<PartLineItem[]>([]);
  const [isAddItemOpen, setAddItemOpen] = useState(false);
  const [itemTypeToAdd, setItemTypeToAdd] = useState<'service' | 'part'>('service');
  const [selectedItem, setSelectedItem] = useState<string | undefined>();
  const [partQuantity, setPartQuantity] = useState(1);
  const [submitAction, setSubmitAction] = useState<'save' | 'schedule'>('save');


  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Customer>(
    useMemoFirebase(() => collection(firestore, "customers"), [firestore])
  );
  const { data: services, isLoading: isLoadingServices } = useCollection<Service>(
    useMemoFirebase(() => collection(firestore, "services"), [firestore])
  );
  const { data: parts, isLoading: isLoadingParts } = useCollection<Part>(
    useMemoFirebase(() => collection(firestore, "parts"), [firestore])
  );

  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderFormSchema),
  });

  const availableItems: ItemToAdd[] = useMemo(() => {
    const serviceItems = services?.map(s => ({ ...s, itemType: 'service' as const })) || [];
    const partItems = parts?.map(p => ({ ...p, itemType: 'part' as const })) || [];
    return itemTypeToAdd === 'service' ? serviceItems : partItems;
  }, [services, parts, itemTypeToAdd]);

  const totalAmount = useMemo(() => {
    const servicesTotal = serviceLineItems.reduce((acc, item) => acc + item.price, 0);
    const partsTotal = partLineItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return servicesTotal + partsTotal;
  }, [serviceLineItems, partLineItems]);

  const totalCost = useMemo(() => {
    return partLineItems.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
  }, [partLineItems]);

  const handleAddItem = () => {
    if (!selectedItem) return;
    const item = availableItems.find(i => i.id === selectedItem);
    if (!item) return;

    if (item.itemType === 'service') {
      if (!serviceLineItems.some(sli => sli.id === item.id)) {
        setServiceLineItems(prev => [...prev, { id: item.id, name: item.name, price: item.price }]);
      }
    } else { // It's a part
      const existingPart = partLineItems.find(pli => pli.id === item.id);
      if (existingPart) {
        setPartLineItems(prev => prev.map(pli => pli.id === item.id ? { ...pli, quantity: pli.quantity + partQuantity } : pli));
      } else {
        setPartLineItems(prev => [...prev, { id: item.id, name: item.name, price: item.price, costPrice: (item as Part).costPrice, quantity: partQuantity }]);
      }
    }
    setSelectedItem(undefined);
    setPartQuantity(1);
    setAddItemOpen(false);
  };
  
  const removeItem = (type: 'service' | 'part', id: string) => {
    if (type === 'service') {
        setServiceLineItems(prev => prev.filter(item => item.id !== id));
    } else {
        setPartLineItems(prev => prev.filter(item => item.id !== id));
    }
  }

  const onSubmit = (data: ServiceOrderFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para criar uma OS.' });
      return;
    }
    if (serviceLineItems.length === 0 && partLineItems.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Adicione pelo menos um serviço ou peça à ordem.' });
      return;
    }

    const selectedCustomer = customers?.find(c => c.id === data.customerId);
    if (!selectedCustomer) return;

    const status = submitAction === 'schedule' ? 'scheduled' : 'open';

    if (status === 'scheduled' && !data.scheduledDate) {
        form.setError("scheduledDate", { type: "manual", message: "Selecione uma data para agendar." });
        return;
    }

    const orderNumber = `OS-${Date.now().toString().slice(-6)}`;
    const serviceOrdersRef = collection(firestore, "serviceOrders");

    const orderData: any = {
      orderNumber,
      customerId: data.customerId,
      customerName: selectedCustomer.name,
      vehiclePlate: data.vehiclePlate,
      vehicleModel: data.vehicleModel,
      mechanicId: user.uid,
      issueDate: serverTimestamp(),
      status,
      notes: data.notes,
      serviceLineItems,
      partLineItems,
      totalAmount,
      totalCost,
      paymentStatus: 'pending',
    };

    if (status === 'scheduled') {
      orderData.scheduledDate = data.scheduledDate;
    }

    addDocumentNonBlocking(serviceOrdersRef, orderData);

    toast({ title: 'Sucesso!', description: `Ordem de Serviço ${orderNumber} ${status === 'scheduled' ? 'agendada' : 'criada'}.` });
    router.push('/dashboard/ordens');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <PageHeader
        title="Nova Ordem de Serviço"
        description="Preencha os dados para gerar uma nova OS."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Controller
                  name="customerId"
                  control={form.control}
                  render={({ field }) => (
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCustomers}>
                      <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                      <SelectContent>
                        {customers?.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.customerId && <p className="text-sm text-destructive">{form.formState.errors.customerId.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">Placa do Veículo</Label>
                  <Input id="vehiclePlate" placeholder="ABC-1234" {...form.register("vehiclePlate")} />
                  {form.formState.errors.vehiclePlate && <p className="text-sm text-destructive">{form.formState.errors.vehiclePlate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Modelo do Veículo</Label>
                  <Input id="vehicleModel" placeholder="Ex: Toyota Corolla" {...form.register("vehicleModel")} />
                  {form.formState.errors.vehicleModel && <p className="text-sm text-destructive">{form.formState.errors.vehicleModel.message}</p>}
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="scheduledDate">Data de Chegada (para agendamento)</Label>
                 <Controller
                    name="scheduledDate"
                    control={form.control}
                    render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                    )}
                />
                 {form.formState.errors.scheduledDate && <p className="text-sm text-destructive">{form.formState.errors.scheduledDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Problema Relatado / Observações</Label>
                <Textarea id="notes" placeholder="Descreva o problema relatado pelo cliente..." {...form.register("notes")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Serviços e Peças</CardTitle>
                    <CardDescription>Itens adicionados à ordem de serviço.</CardDescription>
                </div>
              <Dialog open={isAddItemOpen} onOpenChange={setAddItemOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <Label>Tipo de Item</Label>
                        <Select value={itemTypeToAdd} onValueChange={(v) => setItemTypeToAdd(v as 'service' | 'part')}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="service">Serviço</SelectItem>
                                <SelectItem value="part">Peça</SelectItem>
                            </SelectContent>
                        </Select>

                        <Label>Item</Label>
                        <Select value={selectedItem} onValueChange={setSelectedItem} disabled={isLoadingServices || isLoadingParts}>
                             <SelectTrigger><SelectValue placeholder={`Selecione um(a) ${itemTypeToAdd === 'service' ? 'serviço' : 'peça'}`} /></SelectTrigger>
                             <SelectContent>
                                {availableItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.name} - {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</SelectItem>
                                ))}
                             </SelectContent>
                        </Select>

                        {itemTypeToAdd === 'part' && (
                            <div>
                                <Label htmlFor="quantity">Quantidade</Label>
                                <Input id="quantity" type="number" value={partQuantity} onChange={e => setPartQuantity(parseInt(e.target.value, 10) || 1)} min="1"/>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddItem} disabled={!selectedItem}>Adicionar</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  {serviceLineItems.length === 0 && partLineItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">Nenhum item adicionado.</TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {serviceLineItems.map((item) => (
                        <TableRow key={`service-${item.id}`}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>Serviço</TableCell>
                            <TableCell className="text-right">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem('service', item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                      {partLineItems.map((item) => (
                        <TableRow key={`part-${item.id}`}>
                            <TableCell>{item.quantity}x {item.name}</TableCell>
                            <TableCell>Peça</TableCell>
                            <TableCell className="text-right">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem('part', item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
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
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-2">
                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    onClick={() => setSubmitAction('save')}
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting && submitAction === 'save' ? 'Salvando...' : 'Salvar como Aberta'}
                </Button>
                <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    size="lg"
                    onClick={() => setSubmitAction('schedule')}
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting && submitAction === 'schedule' ? 'Agendando...' : 'Agendar Serviço'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
