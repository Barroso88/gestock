import { prisma } from "@/lib/prisma";
import { LocationsExplorer } from "@/components/LocationsExplorer";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const [locationsWithProducts, categories, allLocations] = await Promise.all([
    prisma.storageLocation.findMany({
      include: {
        products: {
          include: {
            category: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { fullPath: "asc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.storageLocation.findMany({
      orderBy: { fullPath: "asc" },
    }),
  ]);

  return (
    <LocationsExplorer
      locations={JSON.parse(JSON.stringify(locationsWithProducts))}
      categories={JSON.parse(JSON.stringify(categories))}
      allLocations={JSON.parse(JSON.stringify(allLocations))}
    />
  );
}
