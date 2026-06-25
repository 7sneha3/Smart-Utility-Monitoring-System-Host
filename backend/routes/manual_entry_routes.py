from flask import Blueprint
from flask import request
from flask import jsonify

from database.mongodb import utility_collection

manual_entry_bp = Blueprint(
    "manual_entry",
    __name__
)


UTILITY_MAPPING = {

    "U1": {
        "type": "energy",
        "sub_utility": "Main Grid Supply",
        "unit": "kWh"
    },

    "U2": {
        "type": "energy",
        "sub_utility": "Backup Diesel Generator",
        "unit": "kWh"
    },

    "U3": {
        "type": "energy",
        "sub_utility": "Solar Panels",
        "unit": "kWh"
    },

    "U4": {
        "type": "water",
        "sub_utility": "Municipal Water Supply",
        "unit": "kL"
    },

    "U5": {
        "type": "water",
        "sub_utility": "Groundwater Borewell",
        "unit": "kL"
    },

    "U6": {
        "type": "water",
        "sub_utility": "Process Cooling Water",
        "unit": "kL"
    },

    "U7": {
        "type": "water",
        "sub_utility": "Wastewater Discharge",
        "unit": "kL"
    }
}


@manual_entry_bp.route(
    "/manual-entry",
    methods=["POST"]
)
def manual_entry():

    data = request.json

    if not data:

        return jsonify({
            "error": "No data received"
        }), 400

    utility_id = data.get(
        "utility_id"
    )

    if utility_id not in UTILITY_MAPPING:

        return jsonify({
            "error": "Invalid Utility ID"
        }), 400

    consumption = data.get(
        "consumption"
    )

    if consumption is None:

        return jsonify({
            "error": "Consumption value required"
        }), 400

    utility_info = UTILITY_MAPPING[
        utility_id
    ]

    date = data.get(
        "date"
    )

    document = {

        "utility_id":
        utility_id,

        "sub_utility":
        utility_info[
            "sub_utility"
        ],

        "resource_type":
        utility_info[
            "type"
        ],

        "date":
        date,

        "month":
        data.get(
            "month"
        ),

        "year":
        data.get(
            "year"
        ),

        "unit":
        utility_info[
            "unit"
        ],

        "consumption":
        float(
            consumption
        )
    }

    result = (
        utility_collection
        .insert_one(
            document
        )
    )

    return jsonify({

        "status":
        "success",

        "message":
        "Manual entry saved",

        "id":
        str(
            result.inserted_id
        )
    })