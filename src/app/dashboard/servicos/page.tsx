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
import { Checkbox } from "@/components/ui/checkbox";
import { useFirebase, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { serviceSchema } from "@/lib/schemas";
import type { Service } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicosPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [serviceToDelete, setServiceToDelete] = React.useState<Service | null>(null);

  const servicesRef = useMemoFirebase(() => collection(firestore, "services"), [firestore]);
  const { data: services, isLoading } = useCollection<Service>(servicesRef);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    addDocumentNonBlocking(servicesRef, data);

    toast({
      title: "Sucesso!",
      description: `Serviço "${data.name}" adicionado.`,
    });

    form.reset();
    setOpen(false);
  };

  const handleDeleteService = () => {
    if (!serviceToDelete) return;
    const serviceDocRef = doc(firestore, "services", serviceToDelete.id);
    deleteDocumentNonBlocking(serviceDocRef);
    toast({
      title: "Serviço excluído",
      description: `O serviço "${serviceToDelete.name}" foi excluído com sucesso.`,
    });
    setServiceToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Gestão de Serviços"
        description="Adicione, edite e visualize os serviços da sua oficina."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo serviço.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
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
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                     {form.formState.errors.price && (
                      <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                    )}
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="isActive" {...form.register("isActive")} defaultChecked={true} />
                    <Label htmlFor="isActive">Serviço ativo</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Salvando..." : "Salvar Serviço"}
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
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : services && services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell className="text-right">
                      {service.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </TableCell>
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
                            <DropdownMenuItem onSelect={() => setServiceToDelete(service)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!serviceToDelete} onOpenChange={(isOpen) => !isOpen && setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o serviço &quot;{serviceToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
