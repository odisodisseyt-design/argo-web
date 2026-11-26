import { Link, useNavigate } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { Notice } from '@/components/ui/notice'
import { useCampaigns, useMapState } from '@/features/game/queries'

const ROAD_STYLE: Record<string, { width: number; color: string }> = {
  motorway: { width: 2.4, color: 'var(--accent)' },
  trunk: { width: 1.8, color: 'var(--muted-foreground)' },
  primary: { width: 1.4, color: 'var(--muted-foreground)' },
  secondary: { width: 1.1, color: 'var(--muted-foreground)' },
}

export default function MapPage() {
  const campaigns = useCampaigns('active')
  const navigate = useNavigate()
  const campaignId = campaigns.data?.[0]?.id ?? ''
  const map = useMapState(campaignId)

  const goTo = (name: string) => {
    sessionStorage.setItem('argo-next-command', `Идти в ${name}`)
    navigate(`/play/${campaignId}`)
  }

  if (campaigns.isLoading || map.isLoading) {
    return <Page><p className="text-sm text-muted-foreground">Загружаю карту Москвы…</p></Page>
  }
  if (!campaignId || !map.data) {
    return (
      <Page>
        <Notice tone="integration" title="Нет активной игры">
          Сначала <Link to="/campaigns" className="text-primary hover:underline">создай кампанию</Link>.
        </Notice>
      </Page>
    )
  }

  const { basemap, nodes } = map.data
  const roads = Object.entries(basemap.roads ?? {}) as [string, unknown][]

  return (
    <Page className="max-w-5xl">
      <PageHeader
        eyebrow="Карта"
        title="Москва"
        description="Только открытые места и дороги, которые известны твоему персонажу."
      />
      <div className="hud-panel overflow-hidden">
        <svg
          viewBox={`0 0 ${basemap.width} ${basemap.height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Карта Москвы"
        >
          <rect width={basemap.width} height={basemap.height} fill="var(--surface)" />
          {basemap.water && (
            <path d={basemap.water} fill="none" stroke="var(--primary)" strokeOpacity={0.35} strokeWidth={2} />
          )}
          {basemap.rail && (
            <path d={basemap.rail} fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.45} strokeWidth={0.9} strokeDasharray="3 3" />
          )}
          {roads.map(([kind, paths]) => {
            const style = ROAD_STYLE[kind] ?? { width: 0.8, color: 'var(--muted-foreground)' }
            return (
              <path key={kind} d={String(paths)} fill="none" stroke={style.color} strokeOpacity={0.4} strokeWidth={style.width} />
            )
          })}
          {basemap.labels.map((label) => (
            <text
              key={label.text}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              fontSize={9}
              fill="var(--muted-foreground)"
              opacity={0.55}
            >
              {label.text}
            </text>
          ))}
          {nodes.map((node) => (
            <g key={node.id} onClick={() => !node.current && goTo(node.name)} className={node.current ? '' : 'cursor-pointer'}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.current ? 7 : 4}
                fill={node.current ? 'var(--primary)' : node.visited ? 'var(--accent)' : 'var(--surface)'}
                stroke={node.current ? 'var(--primary)' : 'var(--accent)'}
                strokeWidth={1.5}
              />
              <text x={node.x + 8} y={node.y + 3} fontSize={9} fill="var(--foreground)">
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">Подложка: {basemap.attribution ?? '© OpenStreetMap contributors'}</p>
    </Page>
  )
}
