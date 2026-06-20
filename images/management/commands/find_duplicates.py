import logging
from collections import defaultdict
from typing import Any

import numpy as np
from django.core.management.base import BaseCommand, CommandParser

from images.models import Image

logger = logging.getLogger(__name__)


class _UnionFind:
    def __init__(self) -> None:
        self.parent: dict[int, int] = {}

    def find(self, x: int) -> int:
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        self.parent[self.find(a)] = self.find(b)

    def groups(self) -> list[list[int]]:
        clusters: dict[int, list[int]] = defaultdict(list)
        for x in self.parent:
            clusters[self.find(x)].append(x)
        return [g for g in clusters.values() if len(g) > 1]


class Command(BaseCommand):
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--threshold",
            type=int,
            default=8,
            help="Max Hamming distance (bits) to treat phashes as near-dups. "
            "0 = identical phash, 5-8 is the practical range.",
        )
        parser.add_argument(
            "--exact-only",
            action="store_true",
            help="Only report byte-identical (sha256) duplicates.",
        )

    def handle(self, threshold: int, exact_only: bool, **options: Any) -> None:
        images = list(
            Image.objects.exclude(sha256__isnull=True).values_list(
                "id", "filename", "sha256", "phash"
            )
        )
        if not images:
            self.stdout.write(
                "No hashed images found. Run `manage.py compute_hashes` first."
            )
            return

        self._report_exact(images)
        if not exact_only:
            self._report_near(images, threshold)

    def _report_exact(self, images: list[tuple]) -> None:
        by_sha: dict[str, list[tuple[int, str]]] = defaultdict(list)
        for id_, filename, sha256, _ in images:
            by_sha[sha256].append((id_, filename))

        groups = [g for g in by_sha.values() if len(g) > 1]
        self.stdout.write(f"\n=== Exact duplicates (identical bytes): {len(groups)} group(s) ===")
        for group in sorted(groups, key=len, reverse=True):
            self.stdout.write(f"  {len(group)} files:")
            for id_, filename in group:
                self.stdout.write(f"    [{id_}] {filename}")

    def _report_near(self, images: list[tuple], threshold: int) -> None:
        rows = [(id_, filename, phash) for id_, filename, _, phash in images if phash]
        if not rows:
            return

        ids = np.array([r[0] for r in rows])
        names = {r[0]: r[1] for r in rows}
        vals = np.array([int(r[2], 16) for r in rows], dtype=np.uint64)
        bits = np.unpackbits(vals.view(np.uint8).reshape(-1, 8), axis=1)  # n x 64

        uf = _UnionFind()
        dists: dict[tuple[int, int], int] = {}
        n = len(ids)
        for i in range(n):
            dist = (bits[i] ^ bits).sum(axis=1)
            for j in np.where((dist <= threshold) & (np.arange(n) > i))[0]:
                a, b = int(ids[i]), int(ids[j])
                uf.union(a, b)
                dists[(a, b)] = int(dist[j])

        groups = uf.groups()
        self.stdout.write(
            f"\n=== Near-duplicates (phash Hamming <= {threshold}): {len(groups)} cluster(s) ==="
        )
        for group in sorted(groups, key=len, reverse=True):
            self.stdout.write(f"  {len(group)} images:")
            for id_ in sorted(group):
                self.stdout.write(f"    [{id_}] {names[id_]}")
