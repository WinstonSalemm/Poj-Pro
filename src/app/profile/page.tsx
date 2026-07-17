import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import {
  ensureUserPersonalPromo,
  PERSONAL_PROMO_DISCOUNT_PERCENT,
} from "@/lib/personalPromo";
import ProfilePromoCard from "@/components/profile/ProfilePromoCard";

export const metadata: Metadata = {
  title: "Профиль | POJ PRO",
  description: "Личный кабинет и персональный промокод на скидку 5%",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/profile")}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      personalPromoCode: true,
      createdAt: true,
      isAdmin: true,
    },
  });

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/profile")}`);
  }

  const promoCode = await ensureUserPersonalPromo(user.id);
  const displayName = user.name?.trim() || user.email.split("@")[0] || "Пользователь";

  return (
    <div className="min-h-[60vh] bg-[#F8F9FA]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#660000]/70">
            Личный кабинет
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#660000] sm:text-3xl">Профиль</h1>
          <p className="mt-2 text-sm text-gray-600">
            Данные аккаунта и персональный промокод на скидку {PERSONAL_PROMO_DISCOUNT_PERCENT}%.
          </p>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_4px_16px_rgba(102,0,0,0.04)] sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
              Аккаунт
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Имя</dt>
                <dd className="mt-1 text-base font-medium text-gray-900">{displayName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="mt-1 break-all text-base font-medium text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Дата регистрации</dt>
                <dd className="mt-1 text-base font-medium text-gray-900">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              {user.isAdmin ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500">Роль</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-lg bg-[#660000]/8 px-2.5 py-1 text-sm font-semibold text-[#660000]">
                      Администратор
                    </span>
                    <Link
                      href="/admin"
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#660000] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#8B0000]"
                    >
                      Открыть админ-панель
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <ProfilePromoCard code={promoCode} discountPercent={PERSONAL_PROMO_DISCOUNT_PERCENT} />

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Как воспользоваться скидкой</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-700">
              <li>Скопируйте промокод выше.</li>
              <li>
                На сайте - введите его при оформлении заказа. В магазине - покажите код на экране
                или назовите продавцу.
              </li>
              <li>
                Скидка {PERSONAL_PROMO_DISCOUNT_PERCENT}% применяется к сумме заказа. Промокод
                привязан к вашему аккаунту и действует постоянно.
              </li>
            </ol>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#660000] px-4 text-sm font-semibold text-white hover:bg-[#8B0000]"
              >
                Перейти в каталог
              </Link>
              <Link
                href="/cart"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Открыть корзину
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
