"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";
export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer
            role="contentinfo"
            className="bg-[#fafafa] text-[#660000] text-[14px] border-t border-[#660000] px-4 pt-8 pb-3"
        >
            {/* Лого */}
            <div className="flex justify-center mb-4">
                <Image
                    src="/OtherPics/logo.svg"
                    alt="POJ PRO"
                    width={160}
                    height={54}
                    className="object-contain transition-transform duration-200 hover:scale-[1.05]"
                    style={{ width: '160px', height: '54px' }}
                    loading="lazy"
                    fetchPriority="low"
                    sizes="160px"
                />
            </div>

            {/* Маркетинговый текст */}
            <div className="text-center text-[14px] mx-auto mb-6 max-w-[600px] leading-[1.4] px-3">
                <p>{t("footer.marketingText")}</p>
            </div>
            <div className="text-center text-[15px] font-bold mb-6">
                <strong>{t("footer.tagline")}</strong>
            </div>

            {/* Колонки */}
            <div className="max-w-[1200px] mx-auto w-full bg-[#fafafa]">
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Навигация */}
                    <nav aria-label="Навигация по сайту" className="flex-1 min-w-[200px] max-w-sm px-3">
                        <h4 className="text-center text-[16px] font-semibold mb-2">
                            {t("footer.navigation.title")}
                        </h4>
                        <ul className="list-none m-0 p-0 space-y-1">
                            <li className="text-center">
                                <Link
                                    href="/"
                                    title={t("footer.navigation.homeTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.navigation.home")}
                                </Link>
                            </li>

                            <li className="text-center">
                                <Link
                                    href="/catalog"
                                    title={t("footer.navigation.catalogTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.navigation.catalog")}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link
                                    href="/about"
                                    title={t("footer.navigation.aboutTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.navigation.about")}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link
                                    href="/contacts"
                                    title={t("footer.navigation.contactsTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.navigation.contacts")}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Телефоны */}
                    <section aria-label="Контактные телефоны" className="flex-1 min-w-[200px] max-w-sm px-3">
                        <h4 className="text-center text-[16px] font-semibold mb-2">
                            {t("footer.phones.title")}
                        </h4>
                        <ul className="list-none m-0 p-0 space-y-1">
                            {[
                                "+998 99 393 66 16",
                                "+998 99 309 10 01",
                                "+998 71 253 66 16",
                                "+998 90 979 12 18",
                            ].map((tel) => (
                                <li key={tel} className="text-center">
                                    <a
                                        href={`tel:${tel.replace(/\s+/g, "")}`}
                                        title={`${t("footer.phones.call")} ${tel}`}
                                        className="hover:opacity-70 transition-opacity"
                                    >
                                        {tel}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Социальные сети */}
                    <section aria-label="Наши социальные сети" className="flex-1 min-w-[200px] max-w-sm px-3">
                        <h4 className="text-center text-[16px] font-semibold mb-2">
                            {t("footer.social.title")}
                        </h4>
                        <ul className="list-none m-0 p-0 space-y-1">
                            <li className="text-center">
                                <a
                                    href="https://www.instagram.com/security_system_tashkent/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={t("footer.social.instagramTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.social.instagram")}
                                </a>
                            </li>
                            <li className="text-center">
                                <a
                                    href="https://t.me/pojsystema"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={t("footer.social.telegramTitle")}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    {t("footer.social.telegram")}
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </footer>
    );
}
