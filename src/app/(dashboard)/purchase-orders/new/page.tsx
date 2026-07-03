import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePOFormMulti } from "@/components/purchase-orders/create-po-form-multi";

export default async function NewPOPage({
  searchParams,
}: {
  searchParams: { itemIds?: string; requestIds?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Lay cac items da chon tu URL
  let selectedItemIds: string[] = [];

  if (searchParams.itemIds) {
    // Format moi: itemIds=id1,id2,id3
    selectedItemIds = decodeURIComponent(searchParams.itemIds).split(",");
  } else if (searchParams.requestIds) {
    // Fallback: lay tat ca items cua cac YC
    const requestIds = searchParams.requestIds.split(",");
    const items = await prisma.requestItem.findMany({
      where: { requestId: { in: requestIds } },
      select: { id: true },
    });
    selectedItemIds = items.map((i: { id: string }) => i.id);
  }

  if (selectedItemIds.length === 0) {
    redirect("/purchase-orders/select-items");
  }

  // Lay thong tin cac items
  const items = await prisma.requestItem.findMany({
    where: { id: { in: selectedItemIds } },
    include: {
      deviceModel: { select: { brand: true, name: true } },
      category: { select: { name: true } },
      request: {
        include: {
          requester: { select: { name: true, department: true } },
        },
      },
    },
  });

  // Group theo request
  const requestMap = new Map<
    string,
    {
      id: string;
      requestNumber: string;
      title: string;
      requester: unknown;
      items: Array<(typeof items)[number]>;
    }
  >();
  items.forEach((item: (typeof items)[number]) => {
    if (!requestMap.has(item.requestId)) {
      requestMap.set(item.requestId, {
        id: item.request.id,
        requestNumber: item.request.requestNumber,
        title: item.request.title,
        requester: item.request.requester,
        items: [],
      });
    }
    requestMap.get(item.requestId)!.items.push(item);
  });

  const preselected = Array.from(requestMap.values());

  return (
    <CreatePOFormMulti
      availableRequests={[] as any}
      preselected={preselected as any}
    />
  );
}
