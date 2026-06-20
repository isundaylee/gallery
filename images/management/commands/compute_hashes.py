import logging
import os
from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from images.duplicates import auto_merge_exact
from images.hashing import hash_file
from images.models import Image

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--recompute",
            action="store_true",
            help="Recompute hashes for every image, not just those missing one.",
        )

    def handle(self, recompute: bool, **options: Any) -> None:
        images = Image.objects.all()
        if not recompute:
            images = images.filter(phash__isnull=True)

        total = images.count()
        logger.info("Hashing %d image(s)", total)

        done = 0
        for image in images.iterator():
            path = os.path.join(image.repository.path, image.filename)
            try:
                image.sha256, image.phash = hash_file(path)
            except Exception as e:
                logger.warning("Skipping %s: %s", path, e)
                continue

            image.save(update_fields=["sha256", "phash"])
            done += 1
            if done % 500 == 0:
                logger.info("Hashed %d/%d", done, total)

        logger.info("Done: hashed %d/%d image(s)", done, total)

        merged = auto_merge_exact()
        if merged:
            logger.info("Auto-merged %d exact duplicate(s)", merged)
