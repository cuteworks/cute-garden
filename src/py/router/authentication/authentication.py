# ######################################################################################################################
# Authentication routes handle login, logout, registration, password recovery, etc. Typically we don't have an existing
# user session yet.
# ######################################################################################################################

from ..generic import generic_path_render

def login():
    pass


def register():
    return generic_path_render("authentication/register/register.html")


def logout():
    pass
