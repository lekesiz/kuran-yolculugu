import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 py-10">
      <div className="container flex flex-col gap-6 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <div className="max-w-md space-y-2">
          <p className="font-serif text-base font-semibold text-foreground">
            Kur'an'ı Anlama Yolculuğu
          </p>
          <p className="leading-relaxed">
            Nüzul sırasına göre, tarihsel bağlamıyla ve dört mealin karşılaştırmasıyla okumak
            için hazırlanmış bir çalışma defteri. Kesin hüküm koyma iddiası taşımaz; okuyanı
            kaynaklara ve kendi vicdanına yönlendirir.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Kaynaklar</p>
          <ul className="space-y-1">
            <li>
              <a
                href="https://kuran.diyanet.gov.tr"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-foreground">
                Diyanet İşleri Başkanlığı — Kur'an-ı Kerim
              </a>
            </li>
            <li>
              <a
                href="https://www.kuranokuyan.com"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-foreground">
                kuranokuyan.com — Prof. Dr. Mehmet Okuyan
              </a>
            </li>
            <li>
              <Link href="/hakkinda" className="transition-colors hover:text-foreground">
                Yöntem ve kaynak politikası
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
