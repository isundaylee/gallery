"""Shared duplicate-detection logic.

Used by both the ``find_duplicates`` management command (CLI report) and the
``/api/duplicates`` endpoints (the frontend merge page). Keeping it in one place
means the command and the API always agree on what counts as a duplicate.
"""

from collections import defaultdict
from itertools import combinations

import numpy as np
from django.db import transaction

from images.models import DismissedDuplicate, Image


class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, x):
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        self.parent[self.find(a)] = self.find(b)

    def groups(self):
        """All connected components with more than one member."""
        clusters = defaultdict(list)
        for x in self.parent:
            clusters[self.find(x)].append(x)
        return [g for g in clusters.values() if len(g) > 1]


def visible_hashed_rows():
    """Hashed, non-merged images as plain dicts (the dedup candidate set)."""
    return list(
        Image.objects.filter(merged_into__isnull=True)
        .exclude(sha256__isnull=True)
        .values("id", "filename", "sha256", "phash", "views", "import_time")
    )


def exact_groups(rows):
    """Groups of rows (by id) that share an identical sha256."""
    by_sha = defaultdict(list)
    for r in rows:
        by_sha[r["sha256"]].append(r["id"])
    return [ids for ids in by_sha.values() if len(ids) > 1]


def hamming_pairs(rows, threshold):
    """Pairs (id_a, id_b, distance) whose phash Hamming distance <= threshold.

    Brute-force n^2 over a numpy bit-matrix — sub-second at ~10k images.
    """
    rows = [r for r in rows if r["phash"]]
    if len(rows) < 2:
        return []

    ids = np.array([r["id"] for r in rows])
    vals = np.array([int(r["phash"], 16) for r in rows], dtype=np.uint64)
    bits = np.unpackbits(vals.view(np.uint8).reshape(-1, 8), axis=1)  # n x 64

    n = len(ids)
    pairs = []
    for i in range(n):
        dist = (bits[i] ^ bits).sum(axis=1)
        for j in np.where((dist <= threshold) & (np.arange(n) > i))[0]:
            pairs.append((int(ids[i]), int(ids[j]), int(dist[j])))
    return pairs


def dismissed_pairs():
    """Set of (a, b) image-id pairs (a < b) marked as not-duplicates."""
    return set(DismissedDuplicate.objects.values_list("image_a_id", "image_b_id"))


def _candidate_edges(rows, threshold):
    """All duplicate edges (a, b) from exact and near matching."""
    for ids in exact_groups(rows):
        for other in ids[1:]:
            yield ids[0], other
    for a, b, _ in hamming_pairs(rows, threshold):
        yield a, b


def find_clusters(threshold=8):
    """Clusters of duplicate images (exact + near combined via union-find).

    Edges the user dismissed as not-duplicates are skipped. Returns a list of
    clusters; each cluster is a list of row dicts sorted by ascending
    import_time, so the first element is the keeper (earliest import).
    """
    rows = visible_hashed_rows()
    by_id = {r["id"]: r for r in rows}
    dismissed = dismissed_pairs()

    uf = UnionFind()
    for a, b in _candidate_edges(rows, threshold):
        if (min(a, b), max(a, b)) not in dismissed:
            uf.union(a, b)

    clusters = []
    for group in uf.groups():
        members = sorted(
            (by_id[i] for i in group), key=lambda r: (r["import_time"], r["id"])
        )
        clusters.append(members)

    clusters.sort(key=len, reverse=True)
    return clusters


@transaction.atomic
def merge_images(image_ids):
    """Merge duplicate images, keeping the earliest-imported as the original.

    Tags are unioned onto the keeper, views are summed, and ``reviewed`` is OR-ed.
    The other rows get ``merged_into`` set (hiding them everywhere) but are kept on
    disk and in the DB so re-imports never re-create them. Returns the keeper.
    """
    images = list(Image.objects.filter(id__in=image_ids, merged_into__isnull=True))
    if len(images) < 2:
        raise ValueError("Need at least two un-merged images to merge")

    keeper = min(images, key=lambda i: (i.import_time, i.id))
    for other in images:
        if other.id == keeper.id:
            continue
        keeper.views += other.views
        keeper.tags.add(*other.tags.all())
        if other.reviewed:
            keeper.reviewed = True
        other.merged_into = keeper
        other.save(update_fields=["merged_into"])

    keeper.save(update_fields=["views", "reviewed"])
    return keeper


def dismiss_duplicates(image_ids):
    """Mark every pair among ``image_ids`` as not-duplicates, so the cluster
    stops being shown. Returns the number of images dismissed together."""
    ids = sorted(set(image_ids))
    for a, b in combinations(ids, 2):
        DismissedDuplicate.objects.get_or_create(image_a_id=a, image_b_id=b)
    return len(ids)
