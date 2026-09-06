import { prisma } from "@/lib/prisma";
import { InventoryGallery } from "@/components/InventoryGallery";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, categories, locations] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        location: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.storageLocation.findMany({
      orderBy: { fullPath: "asc" },
    }),
  ]);

  return (
    <InventoryGallery
      initialProducts={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      locations={JSON.parse(JSON.stringify(locations))}
    />
  );
}
