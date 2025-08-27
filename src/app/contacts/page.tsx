import styles from './page.module.css';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import { COMPANY, waLink, tgLink } from '@/config/company';

export const dynamic = 'force-static';
export const revalidate = 60;

export const metadata = {
  title: 'Контакты — POJ PRO',
  description: 'Адрес офиса, телефон, WhatsApp, Telegram и e-mail. Схема проезда.',
  alternates: { canonical: 'https://www.poj-pro.uz/contacts' },
  openGraph: { title: 'Контакты — POJ PRO', url: 'https://www.poj-pro.uz/contacts' }
};

export default function ContactsPage(){
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${COMPANY.geo.lng-0.01}%2C${COMPANY.geo.lat-0.01}%2C${COMPANY.geo.lng+0.01}%2C${COMPANY.geo.lat+0.01}&layer=mapnik&marker=${COMPANY.geo.lat}%2C${COMPANY.geo.lng}`;

  return (
    <main className="container" role="main">
      <h1>Контакты</h1>

      <div className={styles.grid}>
        {/* Левая колонка: карта */}
        <section className={styles.mapWrap} aria-label="Карта проезда">
          <div className={styles.mapAspect}>
            <iframe
              data-testid="map"
              className={styles.mapFrame}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Карта POJ PRO"
            />
          </div>
        </section>

        {/* Правая колонка: контакты */}
        <aside className={styles.block} aria-label="Способы связи">
          <div className={styles.head}>{COMPANY.name}</div>

          <div className={styles.row}>
            <div className={styles.label}>Телефон</div>
            <div className={styles.value}>
              <a data-testid="tel" href={`tel:${COMPANY.phoneE164}`}>{COMPANY.phoneHuman}</a>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>E-mail</div>
            <div className={styles.value}>
              <a data-testid="mailto" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>WhatsApp</div>
            <div className={styles.value}>
              <a data-testid="wa" href={waLink(COMPANY.whatsappE164)} target="_blank" rel="noopener noreferrer">Написать в WhatsApp</a>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>Telegram</div>
            <div className={styles.value}>
              <a data-testid="tg" href={tgLink(COMPANY.telegramHandle)} target="_blank" rel="noopener noreferrer">@{COMPANY.telegramHandle}</a>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.label}>Адрес</div>
            <div className={styles.value}>
              {COMPANY.address.streetAddress}, {COMPANY.address.addressLocality}, {COMPANY.address.postalCode}
            </div>
          </div>

          <div className={styles.hours}>
            <div className={styles.label}>График</div>
            <ul>
              {COMPANY.openingHours.map((h, i)=>(
                <li key={i}>
                  {h.dayOfWeek.join(', ').replaceAll('Monday','Пн').replaceAll('Tuesday','Вт').replaceAll('Wednesday','Ср')
                    .replaceAll('Thursday','Чт').replaceAll('Friday','Пт').replaceAll('Saturday','Сб').replaceAll('Sunday','Вс')}
                  : {h.opens}–{h.closes}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actions}>
            <a className={styles.badge} href="/poj-pro.vcf" download data-testid="vcard">Скачать vCard</a>
            <a className={styles.badge} href={COMPANY.url} target="_blank" rel="noopener noreferrer">Сайт</a>
          </div>
        </aside>
      </div>

      <LocalBusinessJsonLd />
    </main>
  );
}
