import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/components/TaxonomyManager";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const [locations, categories] = await Promise.all([
    prisma.storageLocation.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { fullPath: "asc" },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TaxonomyManager
      locations={JSON.parse(JSON.stringify(locations))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
