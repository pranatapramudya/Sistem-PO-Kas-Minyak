import { cookies } from "next/headers";
import { COOKIE_NAME, getSessionData, DEFAULT_TENANT_ID } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
  const session = await getSessionData(sessionToken);
  const tenantId = session.valid && session.tenantId ? session.tenantId : DEFAULT_TENANT_ID;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      companyName: true,
      ownerName: true,
      identifier: true,
      phone: true,
      address: true,
      npwp: true,
      tagline: true,
    },
  });

  return <SettingsClient initialTenant={tenant} />;
}