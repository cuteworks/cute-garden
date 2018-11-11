# ######################################################################################################################
# The setup logic for all application routes.
# ######################################################################################################################

from flask import Flask

from . import init_routes
from . import authentication


def init_all_routes(flask_app: Flask) -> None:
    """
    Sets up the application routes on the Flask object by looking into each area package's __init__.py and running its
    route initialization.
    :param flask_app: The Flask application.
    """
    init_routes(flask_app)
    authentication.init_routes(flask_app)
