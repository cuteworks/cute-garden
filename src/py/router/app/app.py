# ######################################################################################################################
# Application routes handle URLs for the main JS application..
# ######################################################################################################################

from ..generic import generic_path_render

def app():
    return generic_path_render("app/app.html")

