export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculos: Veiculo[];
}

export interface Veiculo {
  placa: string;
  marca: string;
  modelo: string;
}

export interface Peca {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
}

export type OrdemStatus = 'aberta' | 'em andamento' | 'concluída' | 'cancelada';

export interface OrdemServico {
  id: string;
  numero: number;
  cliente: { id: string; nome: string };
  veiculo: { placa: string; modelo: string };
  servicos: Servico[];
  pecas: Peca[];
  total: number;
  status: OrdemStatus;
  dataCriacao: any; // Use firestore.FieldValue.serverTimestamp()
  dataConclusao?: any;
}

export interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: any; // Use firestore.FieldValue.serverTimestamp()
  ordemServicoId?: string;
}
