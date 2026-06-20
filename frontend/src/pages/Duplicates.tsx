import { useEffect, useState } from 'react'
import {
  dismissDuplicates,
  getDuplicates,
  imageDataUrl,
  mergeDuplicates,
  type DuplicateImage,
} from '../api'
import PageShell from '../components/PageShell'
import { EmptyState, Loading } from '../components/States'

export default function Duplicates() {
  const [clusters, setClusters] = useState<DuplicateImage[][] | null>(null)
  // Duplicate ids the user has unchecked, so they are left out of a merge.
  const [excluded, setExcluded] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState<{
    index: number
    action: 'merge' | 'dismiss'
  } | null>(null)

  const load = () => getDuplicates().then((d) => setClusters(d.clusters))

  useEffect(() => {
    load()
  }, [])

  const toggle = (id: number) =>
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const onMerge = async (cluster: DuplicateImage[], index: number) => {
    const keeper = cluster.find((i) => i.is_keeper)
    if (!keeper) return
    const dupIds = cluster
      .filter((i) => !i.is_keeper && !excluded.has(i.id))
      .map((i) => i.id)
    if (dupIds.length === 0) return

    setBusy({ index, action: 'merge' })
    try {
      await mergeDuplicates([keeper.id, ...dupIds])
      await load()
    } finally {
      setBusy(null)
    }
  }

  const onDismiss = async (cluster: DuplicateImage[], index: number) => {
    setBusy({ index, action: 'dismiss' })
    try {
      await dismissDuplicates(cluster.map((i) => i.id))
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (clusters === null) {
    return (
      <PageShell title="Duplicates">
        <Loading />
      </PageShell>
    )
  }

  return (
    <PageShell title="Duplicates">
      {clusters.length === 0 ? (
        <EmptyState message="No duplicates found. 🎉" />
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-gray-500">
            Each group looks like the same image. Merging keeps the
            earliest-imported copy and folds the others’ tags and views into it.
            Near-duplicates can be false positives (e.g. screenshots that share a
            layout) — uncheck any image you want to keep separate before merging.
          </p>

          {clusters.map((cluster, index) => {
            const includedDups = cluster.filter(
              (i) => !i.is_keeper && !excluded.has(i.id),
            ).length

            return (
              <div
                key={cluster.map((i) => i.id).join('-')}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {cluster.length} images
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy?.index === index}
                      onClick={() => onDismiss(cluster, index)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy?.index === index && busy.action === 'dismiss'
                        ? 'Dismissing…'
                        : 'Not duplicates'}
                    </button>
                    <button
                      type="button"
                      disabled={includedDups === 0 || busy?.index === index}
                      onClick={() => onMerge(cluster, index)}
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy?.index === index && busy.action === 'merge'
                        ? 'Merging…'
                        : `Merge ${includedDups} into keeper`}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {cluster.map((img) => {
                    const included = !img.is_keeper && !excluded.has(img.id)
                    return (
                      <div key={img.id} className="w-40">
                        <button
                          type="button"
                          disabled={img.is_keeper}
                          onClick={() => toggle(img.id)}
                          className={`block w-full overflow-hidden rounded-lg ring-2 transition ${
                            img.is_keeper
                              ? 'ring-green-500'
                              : included
                                ? 'ring-brand'
                                : 'opacity-50 ring-gray-200'
                          }`}
                        >
                          <img
                            src={imageDataUrl(img.id)}
                            alt={img.filename}
                            className="aspect-square w-full object-cover"
                          />
                        </button>
                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span
                            className={`font-medium ${
                              img.is_keeper
                                ? 'text-green-600'
                                : included
                                  ? 'text-brand'
                                  : 'text-gray-400'
                            }`}
                          >
                            {img.is_keeper
                              ? 'Keeper'
                              : included
                                ? '✓ Merge'
                                : 'Keep separate'}
                          </span>
                          <span className="text-gray-400">{img.views} views</span>
                        </div>
                        <div
                          className="truncate text-xs text-gray-400"
                          title={img.filename}
                        >
                          {img.filename}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
