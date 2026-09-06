import { prisma } from "@/lib/prisma";
import { ProfileManager } from "@/components/ProfileManager";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [products, categories, locations, movementsCount, currentUser] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        location: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.storageLocation.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { fullPath: "asc" },
    }),
    prisma.stockMovement.count(),
    getCurrentUser(),
  ]);

  return (
    <ProfileManager
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      locations={JSON.parse(JSON.stringify(locations))}
      movementsCount={movementsCount}
      currentUser={currentUser ? JSON.parse(JSON.stringify(currentUser)) : null}
    />
  );
}
