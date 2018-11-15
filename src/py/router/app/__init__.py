from flask import Flask

from . import app

def init_routes(flask_app: Flask):
    flask_app.add_url_rule("/app", "app", methods=["GET", "POST"], view_func=app.app)
