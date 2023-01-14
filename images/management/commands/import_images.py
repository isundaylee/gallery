import datetime
import glob
import json
import logging
import os
import pathlib
from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from images.models import Repository, Image

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("settings_json_path", type=str)
        parser.add_argument("--clear", action="store_true")

    def handle(self, settings_json_path: str, clear: bool, **options: Any) -> None:
        with open(settings_json_path) as f:
            settings = json.load(f)

        if clear:
            logger.info("Deleting all repos and images")
            Repository.objects.all().delete()
            Image.objects.all().delete()

        name: str
        path: str
        for name, path in settings["repositories"].items():
            existing_repos = Repository.objects.filter(name=name).all()

            assert len(existing_repos) <= 1

            if existing_repos:
                logger.warning("Skipping already-existing repo %s", name)
                continue

            logger.info("Creating repo %s -> %s", name, path)
            Repository.objects.create(name=name, path=path)

        for repo in Repository.objects.all():
            logger.info("Importing images from %s", repo.name)
            existing_filenames = {i.filename for i in repo.image_set.all()}

            for f in glob.glob(os.path.join(repo.path, "**", "*"), recursive=True):
                filename = str(pathlib.Path(f).relative_to(pathlib.Path(repo.path)))

                if filename in existing_filenames:
                    continue

                logger.info("Creating image %s in repo %s", filename, repo.name)
                repo.image_set.create(
                    filename=filename,
                    file_mtime=datetime.datetime.utcfromtimestamp(
                        os.stat(f).st_mtime
                    ).replace(tzinfo=datetime.timezone.utc),
                    import_time=datetime.datetime.utcnow().replace(
                        tzinfo=datetime.timezone.utc
                    ),
                )
