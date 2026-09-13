"""Central logging configuration for the service."""

import logging


def configure_logging(debug: bool = False) -> None:
    """Configure a consistent, safe default log format once at startup."""
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
