import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer(){
  return (
    <footer className={styles.wrap} role="contentinfo">
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.brand}>POJ PRO</div>
            <p className={styles.muted}>Пожарная безопасность и оборудование.</p>
          </div>

          <div>
            <div className={styles.head} data-testid="footer-catalog">Каталог</div>
            <ul className={styles.list}>
              <li><Link href="/catalog">Все категории</Link></li>
              <li><Link href="/catalog/fire-extinguishers">Огнетушители</Link></li>
              <li><Link href="/catalog/hoses">Рукава и арматура</Link></li>
              <li><Link href="/catalog/alarm">Сигнализация</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.head} data-testid="footer-docs">Документы</div>
            <ul className={styles.list}>
              <li><Link href="/documents">Сертификаты</Link></li>
              <li><Link href="/documents">Нормативы</Link></li>
            </ul>
          </div>

          <div>
            <div className={styles.head} data-testid="footer-contacts">Контакты</div>
            <ul className={styles.list}>
              <li><a href="tel:+998000000000">+998 (00) 000-00-00</a></li>
              <li><a href="mailto:info@poj-pro.uz">info@poj-pro.uz</a></li>
              <li><Link href="/contacts">Адрес и карта</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} POJ PRO</span>
          <div className={styles.bottomLinks}>
            <Link href="/policy">Политика конфиденциальности</Link>
            <Link href="/terms">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
