# Obra Financeiro MVP (Categoria)

App web pronto para rodar localmente (Next.js + Prisma + SQLite) para controle financeiro de obras por **categoria**.

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm

## Como rodar (5 minutos)
1) Instale dependências:
```bash
npm i
```

2) Crie o arquivo `.env` (copie do exemplo):
```bash
cp .env.example .env
```

3) Suba o banco + seed:
```bash
npm run db:setup
```

4) Rodar:
```bash
npm run dev
```

Acesse: http://localhost:3000

## Login simples (MVP)
- A autenticação é por senha única (para MVP).
- A senha está em `.env` como `APP_PASSWORD`.
- Você verá um campo "Senha" na tela inicial.

## O que tem
- CRUD de Obras
- CRUD de Categorias
- Orçamento por categoria por obra (previsto)
- Lançamentos (receita/despesa) por obra e categoria, com status (aberto/pago/atrasado)
- Dashboard (cards + tabela por obra)
- Relatórios (despesas por categoria) + export CSV

## Observações
- Banco padrão é SQLite para facilitar. Dá para trocar para PostgreSQL depois (Prisma).
