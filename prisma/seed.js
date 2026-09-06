const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("A iniciar seed da base de dados Gestock...");

  // Limpar dados anteriores
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storageLocation.deleteMany();

  // 1. Criar Categorias
  const catFerramentas = await prisma.category.create({
    data: { name: "Ferramentas", slug: "ferramentas", color: "#3b82f6", icon: "Wrench" },
  });
  const catEletrico = await prisma.category.create({
    data: { name: "Material Elétrico", slug: "material-eletrico", color: "#f59e0b", icon: "Zap" },
  });
  const catComponentes = await prisma.category.create({
    data: { name: "Componentes & Fixação", slug: "componentes", color: "#10b981", icon: "Layers" },
  });
  const catConsumiveis = await prisma.category.create({
    data: { name: "Consumíveis & Segurança", slug: "consumiveis", color: "#ef4444", icon: "Shield" },
  });

  // 2. Criar Hierarquia de Locais
  // Raiz 1: Armazém Central
  const armazemCentral = await prisma.storageLocation.create({
    data: {
      name: "Armazém Principal",
      code: "ARM-01",
      type: "WAREHOUSE",
      fullPath: "/Armazém Principal",
      depth: 0,
    },
  });

  // Nível 1: Corredor A
  const corredorA = await prisma.storageLocation.create({
    data: {
      name: "Corredor A",
      code: "ARM-01-COR-A",
      type: "AISLE",
      parentId: armazemCentral.id,
      fullPath: "/Armazém Principal/Corredor A",
      depth: 1,
    },
  });

  // Nível 2: Estante 1
  const estante1 = await prisma.storageLocation.create({
    data: {
      name: "Estante 01",
      code: "ARM-01-COR-A-EST-01",
      type: "RACK",
      parentId: corredorA.id,
      fullPath: "/Armazém Principal/Corredor A/Estante 01",
      depth: 2,
    },
  });

  // Nível 3: Prateleiras
  const pratSuperior = await prisma.storageLocation.create({
    data: {
      name: "Prateleira Superior (Topo)",
      code: "ARM-01-EST-01-PRAT-TOP",
      type: "SHELF",
      parentId: estante1.id,
      fullPath: "/Armazém Principal/Corredor A/Estante 01/Prateleira Superior",
      depth: 3,
    },
  });

  const pratMedia = await prisma.storageLocation.create({
    data: {
      name: "Prateleira Média (Nível 2)",
      code: "ARM-01-EST-01-PRAT-MED",
      type: "SHELF",
      parentId: estante1.id,
      fullPath: "/Armazém Principal/Corredor A/Estante 01/Prateleira Média",
      depth: 3,
    },
  });

  const pratInferior = await prisma.storageLocation.create({
    data: {
      name: "Prateleira Inferior (Chão)",
      code: "ARM-01-EST-01-PRAT-INF",
      type: "SHELF",
      parentId: estante1.id,
      fullPath: "/Armazém Principal/Corredor A/Estante 01/Prateleira Inferior",
      depth: 3,
    },
  });

  // Raiz 2: Armazém Secundário / Bancada Técnica
  const bancadaTecnica = await prisma.storageLocation.create({
    data: {
      name: "Bancada de Manutenção",
      code: "BANC-TEC",
      type: "ZONE",
      fullPath: "/Bancada de Manutenção",
      depth: 0,
    },
  });

  const gaveteiro = await prisma.storageLocation.create({
    data: {
      name: "Gaveteiro M01",
      code: "GAV-M01",
      type: "BIN",
      parentId: bancadaTecnica.id,
      fullPath: "/Bancada de Manutenção/Gaveteiro M01",
      depth: 1,
    },
  });

  // 3. Criar Produtos de Teste
  const p1 = await prisma.product.create({
    data: {
      name: "Berbequim Percussor sem Fios 18V",
      sku: "TOOL-DRL-18V",
      description: "Berbequim com 2 baterias de lítio e mala de transporte rígida.",
      quantity: 4,
      minQuantity: 2,
      categoryId: catFerramentas.id,
      locationId: pratMedia.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: "Disjuntor Bipolar 16A Curva C",
      sku: "ELEC-DSJ-16A",
      description: "Proteção modular para calha DIN de quadros residenciais e industriais.",
      quantity: 45,
      minQuantity: 10,
      categoryId: catEletrico.id,
      locationId: pratSuperior.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: "Parafuso Sextavado M8 x 40mm Inox (Caixa 100un)",
      sku: "FIX-M8-40",
      description: "Aço inoxidável A2 para montagens exteriores.",
      quantity: 12,
      minQuantity: 5,
      categoryId: catComponentes.id,
      locationId: gaveteiro.id,
    },
  });

  const p4 = await prisma.product.create({
    data: {
      name: "Fita Isoladora Preta 19mm x 25m",
      sku: "ELEC-FIT-BLK",
      description: "Resistente a UV e alta aderência.",
      quantity: 2, // Alerta stock baixo!
      minQuantity: 5,
      categoryId: catConsumiveis.id,
      locationId: pratInferior.id,
    },
  });

  // Movimentos de auditoria inicial
  for (const p of [p1, p2, p3, p4]) {
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        type: "IN",
        quantityDelta: p.quantity,
        quantityAfter: p.quantity,
        toLocationId: p.locationId,
        note: "Inventário inicial do sistema",
      },
    });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
