import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // categorias
  const categoriasNomes = ["Material", "Mão de obra", "Subempreita", "Equipamentos", "Impostos/Taxas", "Outras"];

  const categorias = [];
  for (const nome of categoriasNomes) {
    const c = await prisma.categoria.upsert({
      where: { nome },
      create: { nome },
      update: {},
    });
    categorias.push(c);
  }

  // obras
  const obra1 = await prisma.obra.create({
    data: { nome: "Obra Jardim das Flores", cliente: "Cliente A", endereco: "Rua 1, 123", status: "ATIVA" },
  });
  const obra2 = await prisma.obra.create({
    data: { nome: "Obra Residencial Sol", cliente: "Cliente B", endereco: "Av. 2, 456", status: "ATIVA" },
  });

  const obras = [obra1, obra2];

  // orçamentos: criar linhas p/ cada categoria
  for (const obra of obras) {
    for (const cat of categorias) {
      await prisma.orcamentoCategoria.create({
        data: {
          obraId: obra.id,
          categoriaId: cat.id,
          valorPrevisto: 0,
        },
      });
    }
  }

  // define alguns previstos
  const setPrev = async (obra, nomeCat, valor) => {
    const cat = categorias.find(c => c.nome === nomeCat);
    await prisma.orcamentoCategoria.update({
      where: { obraId_categoriaId: { obraId: obra.id, categoriaId: cat.id } },
      data: { valorPrevisto: valor },
    });
  };

  await setPrev(obra1, "Material", 180000);
  await setPrev(obra1, "Mão de obra", 120000);
  await setPrev(obra1, "Subempreita", 60000);
  await setPrev(obra2, "Material", 95000);
  await setPrev(obra2, "Mão de obra", 85000);

  // lançamentos
  const createLanc = (obra, catNome, tipo, valor, desc, dc, dv, dp) => {
    const cat = categorias.find(c => c.nome === catNome);
    return prisma.lancamento.create({
      data: {
        obraId: obra.id,
        categoriaId: cat.id,
        tipo,
        valor,
        descricao: desc,
        dataCompetencia: dc,
        dataVencimento: dv,
        dataPagamento: dp,
        status: "ABERTO", // será recalculado na app (action)
      }
    });
  };

  await Promise.all([
    createLanc(obra1, "Material", "DESPESA", 12500, "Compra de cimento", daysAgo(20), daysAgo(18), daysAgo(18)),
    createLanc(obra1, "Mão de obra", "DESPESA", 9800, "Folha semana 1", daysAgo(15), daysAgo(14), daysAgo(14)),
    createLanc(obra1, "Subempreita", "DESPESA", 15000, "Elétrica - 1ª etapa", daysAgo(10), daysAgo(5), null),
    createLanc(obra1, "Impostos/Taxas", "DESPESA", 2200, "Alvará/Taxas", daysAgo(8), daysAgo(7), daysAgo(7)),
    createLanc(obra1, "Outras", "RECEITA", 50000, "Medição recebida", daysAgo(12), null, daysAgo(12)),
    createLanc(obra2, "Material", "DESPESA", 7300, "Areia e brita", daysAgo(14), daysAgo(13), daysAgo(13)),
    createLanc(obra2, "Mão de obra", "DESPESA", 11200, "Equipe - quinzena", daysAgo(9), daysAgo(7), null),
    createLanc(obra2, "Equipamentos", "DESPESA", 1800, "Locação betoneira", daysAgo(6), daysAgo(3), daysAgo(3)),
    createLanc(obra2, "Outras", "RECEITA", 30000, "Entrada contrato", daysAgo(16), null, daysAgo(16)),
    createLanc(obra2, "Impostos/Taxas", "DESPESA", 900, "ISS", daysAgo(5), daysFromNow(5), null),
    createLanc(obra1, "Material", "DESPESA", 4200, "Ferragens", daysAgo(3), daysFromNow(2), null),
    createLanc(obra1, "Outras", "RECEITA", 20000, "Reembolso", daysAgo(2), null, daysAgo(2)),
  ]);

  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
