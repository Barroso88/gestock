import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { description: { contains: q } },
          { category: { name: { contains: q } } },
          { location: { fullPath: { contains: q } } },
        ],
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            fullPath: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      take: 25,
      orderBy: { updatedAt: "desc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      imageUrl: p.imageUrl,
      locationPath: p.location ? p.location.fullPath.replace(/^\//, "").replace(/\//g, " › ") : "Sem localização",
      locationId: p.locationId,
      categoryName: p.category?.name || null,
      categoryColor: p.category?.color || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro na pesquisa de inventário:", error);
    return NextResponse.json({ error: "Erro na pesquisa" }, { status: 500 });
  }
}
