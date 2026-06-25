from flask import Blueprint
from flask import jsonify
from flask import request

from services.dashboard_service import (
    get_summary,
    get_consumption_trend,
    get_anomalies
)

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

@dashboard_bp.route(
    "/dashboard/summary",
    methods=["GET"]
)
def dashboard_summary():

    resource_type = request.args.get(
        "resource_type"
    )

    summary = get_summary(
        resource_type
    )

    return jsonify(summary)

@dashboard_bp.route(
    "/dashboard/consumption-trend",
    methods=["GET"]
)
def consumption_trend():

    resource_type = request.args.get(
        "resource_type"
    )

    data = get_consumption_trend(
        resource_type
    )

    return jsonify(data)

@dashboard_bp.route(
    "/dashboard/anomalies",
    methods=["GET"]
)
def dashboard_anomalies():

    resource_type = request.args.get(
        "resource_type"
    )

    result = get_anomalies(
        resource_type
    )

    return jsonify(result)