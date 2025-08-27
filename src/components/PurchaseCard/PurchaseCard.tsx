import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import styles from "./PurchaseCard.module.css";

export default function PurchaseCard({ price, onAdd }:{ price?: string|number; onAdd:()=>void }) {
  return (
    <Card className={styles.card}>
      <div className={styles.row}>
        <div className={styles.price}>{formatUZS(price)}</div>
        <div className={styles.qty}>
          <label>Qty</label>
          <input type="number" min={1} defaultValue={1} />
        </div>
      </div>
      <Button size="lg" onClick={onAdd}>В корзину</Button>
      <ul className={styles.bullets}>
        <li>Доставка по Узбекистану</li>
        <li>Гарантия качества</li>
        <li>Официальные сертификаты</li>
      </ul>
    </Card>
  );
}
function formatUZS(val: string | number | undefined){
  if (val==null) return "—";
  const n = typeof val === "number" ? val : Number(String(val).replace(/[^\d]/g,''));
  return n ? new Intl.NumberFormat("ru-RU").format(n).replace(/\s/g,"\u00A0")+" UZS" : "—";
}
