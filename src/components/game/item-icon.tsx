import {
  BookOpen,
  Boxes,
  Compass,
  Droplets,
  Flame,
  FlaskConical,
  Hammer,
  HeartPulse,
  Package,
  Shield,
  Sparkles,
  Sword,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

const RULES: [RegExp, LucideIcon][] = [
  [/(бит|нож|топор|копь|меч|лук|стрел|оружи| weapon)/i, Sword],
  [/(курт|бронь|защит|шлем|перчат|сапог|одежд| armor)/i, Shield],
  [/(бинт|аптеч|лекар|еда|тушён|хлеб|галет|чай|кофе|вода|бутыл)/i, HeartPulse],
  [/(спич|зажигал|фонар|ламп|костёр|огонь|свет)/i, Flame],
  [/(фляг|фильтр|вод)/i, Droplets],
  [/(реагент|апулин|хими|яд| Antisept)/i, FlaskConical],
  [/(карт|компас|блокнот)/i, Compass],
  [/(дневник|запис|бумаг|газет|blocknote|блокнот)/i, BookOpen],
  [/(инструмент|молот|пил|лOM|лом|отвёрт|ключ|скотч|проволок)/i, Wrench],
  [/(материал|доск|гвозд|угол|брус|брезент|ресурс)/i, Hammer],
  [/(убежищ|построй|баррикад|контейнер|палатк)/i, Boxes],
  [/(наград|награда|редк|артефакт|уникаль)/i, Sparkles],
]

export function ItemIcon({
  item,
  size = 18,
}: {
  item: { name: string; type?: string | null; slot?: string | null; description?: string | null; rarity?: string | null }
  size?: number
}) {
  const haystack = `${item.name} ${item.type ?? ''} ${item.slot ?? ''} ${item.description ?? ''}`
  const Icon = RULES.find(([pattern]) => pattern.test(haystack))?.[1] ?? Package
  const rare = /редк|эпич|легенд|уникаль/i.test(`${item.rarity ?? ''} ${item.name}`)
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md border ${rare ? 'border-accent/50 bg-accent/10 text-accent' : 'border-border bg-surface-raised text-muted-foreground'}`}
      style={{ width: size + 12, height: size + 12 }}
      aria-hidden
    >
      <Icon size={size} strokeWidth={1.8} />
    </span>
  )
}
