from flask import Blueprint
from flask import jsonify
from flask import request

# taken dashboard_service into analyze_routes
from services.dashboard_service import (
    get_summary,
    get_consumption_trend,
    get_anomalies
)

analyze_bp = Blueprint(
    "analyze",
    __name__
)


@analyze_bp.route(
    "/analyze",
    methods=["GET"]
)
def analyze():

    resource_type = request.args.get(
        "type",
        "energy"
    )

    sub_utility = request.args.get(
        "sub_utility"
    )

    summary = get_summary(
        resource_type,
        sub_utility
    )

    trend = get_consumption_trend(
        resource_type,
        sub_utility
    )

    anomaly = get_anomalies(
        resource_type,
        sub_utility
    )

    response = {

        "days": [
            item["date"]
            for item in trend
        ],

        "actual": [
            item["consumption"]
            for item in trend
        ],

        "predictions": [],

        "threshold":
        anomaly["threshold"],

        "model_trained_on":
        summary["days_count"],

        "summary":
        summary,

        "anomalies":
        anomaly["anomalies"]
    }

    return jsonify(
        response
    )

