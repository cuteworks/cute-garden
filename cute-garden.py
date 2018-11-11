from flask import Flask

from src.router.routes import init_all_routes

app = Flask(__name__)

init_all_routes(app)

if __name__ == '__main__':
    app.run()
