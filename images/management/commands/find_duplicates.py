from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from images.duplicates import (
    UnionFind,
    exact_groups,
    hamming_pairs,
    visible_hashed_rows,
)


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
        rows = visible_hashed_rows()
        if not rows:
            self.stdout.write(
                "No hashed images found. Run `manage.py compute_hashes` first."
            )
            return

        names = {r["id"]: r["filename"] for r in rows}

        groups = exact_groups(rows)
        self.stdout.write(
            f"\n=== Exact duplicates (identical bytes): {len(groups)} group(s) ==="
        )
        for group in sorted(groups, key=len, reverse=True):
            self.stdout.write(f"  {len(group)} files:")
            for id_ in group:
                self.stdout.write(f"    [{id_}] {names[id_]}")

        if exact_only:
            return

        uf = UnionFind()
        for a, b, _ in hamming_pairs(rows, threshold):
            uf.union(a, b)
        clusters = uf.groups()
        self.stdout.write(
            f"\n=== Near-duplicates (phash Hamming <= {threshold}): "
            f"{len(clusters)} cluster(s) ==="
        )
        for cluster in sorted(clusters, key=len, reverse=True):
            self.stdout.write(f"  {len(cluster)} images:")
            for id_ in sorted(cluster):
                self.stdout.write(f"    [{id_}] {names[id_]}")
