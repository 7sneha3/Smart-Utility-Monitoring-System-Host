from flask import Blueprint
from flask import jsonify
from flask import request

from services.forecast_service import (
    get_forecast
)

forecast_bp = Blueprint(
    "forecast",
    __name__
)

@forecast_bp.route(
    "/forecast",
    methods=["GET"]
)
def forecast():

    resource_type = request.args.get(
        "type",
        "energy"
    )

    sub_utility = request.args.get(
        "sub_utility"
    )

    days = int(
        request.args.get(
            "days",
            7
        )
    )

    result = get_forecast(
        resource_type,
        sub_utility,
        days
    )

    return jsonify(
        result
    )