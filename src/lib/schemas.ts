import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const partSchema = z.object({
    name: z.string().min(3, { message: "O nome da peça deve ter pelo menos 3 caracteres." }),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().min(0, { message: "O preço não pode ser negativo." }),
    stockQuantity: z.number().int({ message: "A quantidade deve ser um número inteiro." }).min(0, { message: "A quantidade não pode ser negativa." }),
    minStockQuantity: z.number().int({ message: "A quantidade mínima deve ser um número inteiro." }).min(0, { message: "A quantidade mínima não pode ser negativa." }).optional(),
});
