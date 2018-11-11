# ######################################################################################################################
# Generic top-level routes like the splash screen.
# ######################################################################################################################

from flask import render_template


def splash():
    """
    The splash screen for the CuteKitchen homepage.
    :return: The rendered template.
    """
    return generic_path_render("outside/splash/splash.html")


def privacy():
    """
    The privacy policy for CuteKitchen.
    :return: The rendered template.
    """
    return generic_path_render("outside/privacy/privacy.html")


def terms():
    """
    The terms of use for CuteKitchen.
    :return: The rendered template.
    """
    return generic_path_render("outside/terms/terms.html")


def license():
    """
    The license for CuteKitchen.
    :return: The rendered template.
    """
    return generic_path_render("outside/license/license.html")


def generic_path_render(file):
    """
    A generic renderer for a static page.
    :param file: The filename to render.
    :return: The rendered template for a static page.
    """
    return render_template(file)
