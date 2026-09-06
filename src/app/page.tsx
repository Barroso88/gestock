import { prisma } from "@/lib/prisma";
import { InventoryDashboard } from "@/components/InventoryDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, locations] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        location: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.storageLocation.findMany({
      orderBy: { fullPath: "asc" },
    }),
  ]);

  return (
    <InventoryDashboard
      initialProducts={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      locations={JSON.parse(JSON.stringify(locations))}
    />
  );
}
