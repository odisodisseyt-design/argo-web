import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/ui/button'
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
  const [showAll, setShowAll] = useState(false)

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
  const current = nodes.find((node) => node.current)
  const viewBox = !showAll && current
    ? `${current.x - 170} ${current.y - 185} 340 370`
    : `0 0 ${basemap.width} ${basemap.height}`
  const roads = Object.entries(basemap.roads ?? {}) as [string, unknown][]

  return (
    <Page className="max-w-5xl">
      <PageHeader
        eyebrow="Карта"
        title="Москва"
        description="Только открытые места и дороги, которые известны твоему персонажу."
        actions={
          current ? (
            <Button size="sm" variant="secondary" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Ко мне' : 'Вся Москва'}
            </Button>
          ) : undefined
        }
      />
      <div className="hud-panel overflow-hidden">
        <svg
          viewBox={viewBox}
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
          {showAll && basemap.labels.map((label) => (
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
          {nodes.flatMap((node) => node.connections.map((targetId) => {
            const target = nodes.find((item) => item.id === targetId)
            if (!target) return []
            return [<line
              key={`${node.id}-${targetId}`}
              x1={node.x} y1={node.y} x2={target.x} y2={target.y}
              stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1.6}
              strokeDasharray="5 4"
            />]
          }))}
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
              {(showAll || node.current) && (
                <text
                  x={node.x + 10}
                  y={node.y - 6}
                  fontSize={showAll ? 9 : 14}
                  fill="var(--foreground)"
                  stroke="var(--surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontWeight={node.current ? 700 : 400}
                >
                  {node.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-primary" /> ты</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-accent" /> был здесь</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded-full border border-accent bg-surface" /> дорога известна</span>
        <span className="flex items-center gap-2"><span className="h-0.5 w-5 border-t border-dashed border-accent" /> маршрут</span>
      </div>
      <p className="text-xs text-muted-foreground">Подложка: {basemap.attribution ?? '© OpenStreetMap contributors'}</p>
    </Page>
  )
}
