import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions)) as { user?: { id?: string } } | null;
  if (!(session?.user?.id)) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, telegramUsername: true, city: true, followersApprox: true },
  });
  if (!user) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-mb-black text-mb-white">
      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Профиль</h1>
        <div className="rounded-lg border border-mb-gray/20 p-4">
          <div className="mb-3 text-sm text-mb-gray">Подписчиков: {user.followersApprox ?? 0}</div>
          <ProfileForm initial={{
            name: user.name ?? "",
            username: user.telegramUsername ?? "",
            city: user.city ?? "",
            followers: user.followersApprox ?? 0,
          }} />
        </div>
      </div>
    </div>
  );
}



