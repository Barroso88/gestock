"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------
// PRODUTOS
// ----------------------------------------------------
export async function createProduct(data: {
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  minQuantity?: number;
  categoryId?: string | null;
  locationId?: string | null;
  imageUrl?: string | null;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        sku: data.sku?.trim() || null,
        description: data.description?.trim() || null,
        quantity: Math.max(0, data.quantity),
        minQuantity: data.minQuantity ?? 0,
        categoryId: data.categoryId || null,
        locationId: data.locationId || null,
        imageUrl: data.imageUrl || null,
      },
    });

    if (data.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantityDelta: data.quantity,
          quantityAfter: data.quantity,
          toLocationId: data.locationId || null,
          note: "Entrada inicial de stock",
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/locations");
    return { success: true, product };
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Já existe um artigo com este código SKU." };
    }
    return { success: false, error: "Falha ao registar produto." };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    sku?: string;
    description?: string;
    quantity: number;
    minQuantity?: number;
    categoryId?: string | null;
    locationId?: string | null;
    imageUrl?: string | null;
  }
) {
  try {
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Artigo não encontrado." };

    const qtyDelta = data.quantity - current.quantity;
    const locationChanged = data.locationId !== current.locationId;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        sku: data.sku?.trim() || null,
        description: data.description?.trim() || null,
        quantity: Math.max(0, data.quantity),
        minQuantity: data.minQuantity ?? 0,
        categoryId: data.categoryId || null,
        locationId: data.locationId || null,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : current.imageUrl,
      },
    });

    // Registar movimentação se quantidade ou local mudou
    if (qtyDelta !== 0 || locationChanged) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: locationChanged ? "TRANSFER" : qtyDelta > 0 ? "IN" : "OUT",
          quantityDelta: qtyDelta,
          quantityAfter: data.quantity,
          fromLocationId: current.locationId,
          toLocationId: data.locationId || null,
          note: locationChanged
            ? "Transferência de local de arrumação"
            : `Ajuste manual de stock (${qtyDelta > 0 ? "+" : ""}${qtyDelta})`,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/locations");
    return { success: true, product };
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Falha ao atualizar produto." };
  }
}

export async function quickAdjustStock(id: string, delta: number, note?: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Artigo não encontrado." };

    const newQty = Math.max(0, product.quantity + delta);
    const updated = await prisma.product.update({
      where: { id },
      data: { quantity: newQty },
    });

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: delta > 0 ? "IN" : "OUT",
        quantityDelta: delta,
        quantityAfter: newQty,
        toLocationId: product.locationId,
        note: note || (delta > 0 ? "Incremento rápido" : "Baixa rápida"),
      },
    });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/locations");
    return { success: true, quantity: newQty };
  } catch (error) {
    console.error("Erro ao ajustar stock:", error);
    return { success: false, error: "Falha ao ajustar quantidade." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao remover produto." };
  }
}

// ----------------------------------------------------
// LOCALIZAÇÕES DE ARRUMAÇÃO
// ----------------------------------------------------
export async function createLocation(data: {
  name: string;
  code?: string;
  description?: string;
  type?: string;
  parentId?: string | null;
}) {
  try {
    let fullPath = `/${data.name.trim()}`;
    let depth = 0;

    if (data.parentId) {
      const parent = await prisma.storageLocation.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        fullPath = `${parent.fullPath}/${data.name.trim()}`;
        depth = parent.depth + 1;
      }
    }

    const location = await prisma.storageLocation.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        type: data.type || "SHELF",
        parentId: data.parentId || null,
        fullPath,
        depth,
      },
    });

    revalidatePath("/");
    revalidatePath("/locations");
    revalidatePath("/manage");
    return { success: true, location };
  } catch (error: any) {
    console.error("Erro ao criar localização:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Já existe um local com esse código." };
    }
    return { success: false, error: "Falha ao criar local de arrumação." };
  }
}

export async function updateLocation(
  id: string,
  data: {
    name: string;
    code?: string;
    description?: string;
    type?: string;
    parentId?: string | null;
  }
) {
  try {
    const current = await prisma.storageLocation.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Localização não encontrada." };

    if (data.parentId === id) {
      return { success: false, error: "Uma localização não pode pertencer a si própria." };
    }

    let newFullPath = `/${data.name.trim()}`;
    let newDepth = 0;

    if (data.parentId) {
      const parent = await prisma.storageLocation.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        newFullPath = `${parent.fullPath}/${data.name.trim()}`;
        newDepth = parent.depth + 1;
      }
    }

    const oldFullPath = current.fullPath;

    const location = await prisma.storageLocation.update({
      where: { id },
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        type: data.type || current.type,
        parentId: data.parentId || null,
        fullPath: newFullPath,
        depth: newDepth,
      },
    });

    // Se o caminho mudou, atualizar em cascata todos os filhos
    if (oldFullPath !== newFullPath) {
      const children = await prisma.storageLocation.findMany({
        where: { fullPath: { startsWith: `${oldFullPath}/` } },
      });

      for (const child of children) {
        const childRelative = child.fullPath.substring(oldFullPath.length);
        const childNewPath = `${newFullPath}${childRelative}`;
        const childDepth = childNewPath.split("/").filter(Boolean).length - 1;

        await prisma.storageLocation.update({
          where: { id: child.id },
          data: {
            fullPath: childNewPath,
            depth: childDepth,
          },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/locations");
    revalidatePath("/manage");
    return { success: true, location };
  } catch (error: any) {
    console.error("Erro ao atualizar localização:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Já existe um local com esse código." };
    }
    return { success: false, error: "Falha ao atualizar localização." };
  }
}

export async function deleteLocation(id: string) {
  try {
    // Desvincular produtos antes de eliminar
    await prisma.product.updateMany({
      where: { locationId: id },
      data: { locationId: null },
    });

    await prisma.storageLocation.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/locations");
    revalidatePath("/manage");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover localização:", error);
    return { success: false, error: "Falha ao remover local." };
  }
}

// ----------------------------------------------------
// CATEGORIAS
// ----------------------------------------------------
export async function createCategory(data: {
  name: string;
  color?: string;
  icon?: string;
}) {
  try {
    const slug = data.name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        color: data.color || "#3b82f6",
        icon: data.icon || "Folder",
      },
    });

    revalidatePath("/");
    revalidatePath("/manage");
    return { success: true, category };
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Esta categoria já existe." };
    }
    return { success: false, error: "Falha ao criar categoria." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/manage");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao remover categoria." };
  }
}

export async function importProductsFromBackup(items: Array<{
  name: string;
  sku?: string | null;
  description?: string | null;
  quantity?: number;
  minQuantity?: number;
}>) {
  try {
    let imported = 0;
    for (const item of items) {
      if (!item.name || typeof item.name !== "string") continue;
      await prisma.product.create({
        data: {
          name: item.name.trim(),
          sku: item.sku?.trim() || null,
          description: item.description?.trim() || null,
          quantity: Math.max(0, Number(item.quantity) || 0),
          minQuantity: Math.max(0, Number(item.minQuantity) || 0),
        },
      });
      imported++;
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/profile");
    return { success: true, count: imported };
  } catch (error: any) {
    console.error("Erro ao importar artigos:", error);
    return { success: false, error: "Falha ao processar ficheiro de importação." };
  }
}
