from flask import Blueprint, jsonify
from config.utility_mapping import UTILITY_MAPPING

utility_bp = Blueprint(
    "utility",
    __name__
)


@utility_bp.route("/utilities")
def get_utilities():

    utilities = []

    for utility_id, info in UTILITY_MAPPING.items():

        utilities.append({
            "utility_id": utility_id,
            "sub_utility": info["sub_utility"],
            "resource_type": info["type"]
        })

    return jsonify(utilities)