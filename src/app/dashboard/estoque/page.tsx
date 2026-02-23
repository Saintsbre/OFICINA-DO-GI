"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { collection, serverTimestamp } from "firebase/firestore";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useFirebase, useCollection, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { partSchema } from "@/lib/schemas";
import type { Part } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type PartFormData = z.infer<typeof partSchema>;

export default function EstoquePage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const partsRef = useMemoFirebase(() => collection(firestore, "parts"), [firestore]);
  const { data: parts, isLoading } = useCollection<Part>(partsRef);

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      stockQuantity: 0,
      minStockQuantity: 0,
    },
  });

  const onSubmit = async (data: PartFormData) => {
    addDocumentNonBlocking(partsRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    toast({
      title: "Sucesso!",
      description: `Peça "${data.name}" adicionada ao estoque.`,
    });

    form.reset();
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Controle de Estoque"
        description="Gerencie as peças e produtos da sua oficina."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Peça
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Peça</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova peça para o estoque.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Peça</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Código</Label>
                  <Input id="sku" {...form.register("sku")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                     {form.formState.errors.price && (
                      <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Qtd. em Estoque</Label>
                    <Input id="stockQuantity" type="number" {...form.register("stockQuantity", { valueAsNumber: true })} />
                     {form.formState.errors.stockQuantity && (
                      <p className="text-sm text-destructive">{form.formState.errors.stockQuantity.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockQuantity">Qtd. Mínima</Label>
                    <Input id="minStockQuantity" type="number" {...form.register("minStockQuantity", { valueAsNumber: true })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Salvando..." : "Salvar Peça"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Qtd. em Estoque</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : parts && parts.length > 0 ? (
                parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.sku}</TableCell>
                    <TableCell className="text-right">
                      {part.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
                    <TableCell className="text-right">{part.stockQuantity}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma peça em estoque.
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
