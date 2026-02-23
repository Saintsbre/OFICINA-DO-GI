"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { collection, doc } from "firebase/firestore";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useFirebase, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { partSchema } from "@/lib/schemas";
import type { Part } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type PartFormData = z.infer<typeof partSchema>;

export default function EstoquePage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [partToDelete, setPartToDelete] = React.useState<Part | null>(null);

  const partsRef = useMemoFirebase(() => collection(firestore, "parts"), [firestore]);
  const { data: parts, isLoading } = useCollection<Part>(partsRef);

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      costPrice: 0,
      stockQuantity: 0,
      minStockQuantity: 0,
    },
  });

  const onSubmit = async (data: PartFormData) => {
    addDocumentNonBlocking(partsRef, data);

    toast({
      title: "Sucesso!",
      description: `Peça "${data.name}" adicionada ao estoque.`,
    });

    form.reset();
    setOpen(false);
  };

  const handleDeletePart = () => {
    if (!partToDelete) return;
    const partDocRef = doc(firestore, "parts", partToDelete.id);
    deleteDocumentNonBlocking(partDocRef);
    toast({
      title: "Peça excluída",
      description: `A peça "${partToDelete.name}" foi excluída com sucesso.`,
    });
    setPartToDelete(null);
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                    <Input id="costPrice" type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
                    {form.formState.errors.costPrice && (
                      <p className="text-sm text-destructive">{form.formState.errors.costPrice.message}</p>
                    )}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="price">Preço de Venda (R$)</Label>
                    <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                     {form.formState.errors.price && (
                      <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Qtd. em Estoque</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : parts && parts.length > 0 ? (
                parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.sku}</TableCell>
                     <TableCell className="text-right">
                      {part.costPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
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
                          <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setPartToDelete(part)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma peça em estoque.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!partToDelete} onOpenChange={(isOpen) => !isOpen && setPartToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente a peça &quot;{partToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePart} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
