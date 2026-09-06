const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testSystem() {
  console.log("=== INICIANDO TESTE DO SISTEMA GESTOCK ===");

  // 1. Validar Categorias
  const categories = await prisma.category.findMany();
  console.log(`✔ Categorias carregadas: ${categories.length}`);
  if (categories.length === 0) throw new Error("Sem categorias!");

  // 2. Validar Hierarquia de Locais
  const locations = await prisma.storageLocation.findMany({ orderBy: { fullPath: "asc" } });
  console.log(`✔ Locais carregados: ${locations.length}`);
  const deepLocation = locations.find((l) => l.depth === 3);
  if (!deepLocation) throw new Error("Hierarquia profunda não encontrada!");
  console.log(`✔ Exemplo de Hierarquia Profunda: ${deepLocation.fullPath} (Nível ${deepLocation.depth})`);

  // 3. Validar Produtos e Alocação
  const products = await prisma.product.findMany({
    include: { location: true, category: true },
  });
  console.log(`✔ Produtos em stock: ${products.length}`);
  for (const p of products) {
    const locName = p.location ? p.location.name : "Nenhum";
    console.log(`  - [${p.sku || "SEM SKU"}] ${p.name}: ${p.quantity} un -> ${locName}`);
  }

  // 4. Teste de Pesquisa Simulada
  const searchTerm = "berbequim";
  const searchResults = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
      ],
    },
    include: { location: true },
  });
  console.log(`✔ Pesquisa por '${searchTerm}': ${searchResults.length} resultado(s)`);
  if (searchResults.length !== 1) throw new Error("Falha na pesquisa de teste!");

  console.log("=== TODOS OS TESTES PASSARAM COM SUCESSO! ===");
}

testSystem()
  .catch((err) => {
    console.error("❌ ERRO NO TESTE:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
