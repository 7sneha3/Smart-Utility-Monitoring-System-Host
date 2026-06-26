from database.mongodb import utility_collection
import statistics

def get_summary(resource_type=None, sub_utility=None):

    query = {}

    if resource_type:
        query["resource_type"] = resource_type

    if sub_utility:
        query["sub_utility"] = sub_utility

    utility_collection.find(query)

    pipeline = [
        {
            "$match": query
        },
        {
            "$group": {
                "_id": "$date",
                "consumption": {
                    "$sum": "$consumption"
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    daily_data = list(
        utility_collection.aggregate(
            pipeline
        )
    )

    if not daily_data:

        return {
            "total_consumption": 0,
            "average_consumption": 0,
            "max_consumption": 0,
            "min_consumption": 0,
            "days_count": 0
        }

    consumptions = [
        item["consumption"]
        for item in daily_data
    ]

    print("SUMMARY QUERY =", query)
    print("SUMMARY COUNT =", len(daily_data))

    return {

        "total_consumption":
            round(
                sum(consumptions),
                2
            ),

        "average_consumption":
            round(
                sum(consumptions)
                /
                len(consumptions),
                2
            ),

        "max_consumption":
            round(
                max(consumptions),
                2
            ),

        "min_consumption":
            round(
                min(consumptions),
                2
            ),

        "days_count":
            len(daily_data)
    }

import json
import os

def get_consumption_trend(resource_type, sub_utility=None):

    if resource_type == "energy":
        filename = "energy_trend.json"
    else:
        filename = "water_trend.json"

    path = os.path.join(
        "demo_data",
        filename
    )

    with open(path, "r") as f:
        return json.load(f)
    
def get_anomalies(resource_type=None, sub_utility=None):

    query = {}

    if resource_type:
        query["resource_type"] = resource_type

    if sub_utility:
        query["sub_utility"] = sub_utility

    utility_collection.find(query)

    pipeline = [
        {
            "$match": query
        },
        {
            "$group": {
                "_id": "$date",
                "consumption": {
                    "$sum": "$consumption"
                }
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        }
    ]

    daily_data = list(
        utility_collection.aggregate(
            pipeline
        )
    )

    if not daily_data:

        return {
            "threshold": 0,
            "anomaly_count": 0,
            "graph_data": [],
            "anomalies": []
        }


    consumptions = [
        item["consumption"]
        for item in daily_data
    ]

    # Not enough data for anomaly detection
    if len(consumptions) < 3:

        return {

            "threshold": round(
                max(consumptions),
                2
            ),

            "anomaly_count": 0,

            "graph_data": [
                {
                    "date": item["_id"],
                    "consumption": round(
                        item["consumption"],
                        2
                    ),
                    "threshold": round(
                        max(consumptions),
                        2
                    )
                }
                for item in daily_data
            ],

            "anomalies": []
        }

    mean_value = statistics.mean(
        consumptions
    )

    std_value = statistics.stdev(
        consumptions
    )

    threshold = (
        mean_value +
        (2 * std_value)
    )

    graph_data = []

    anomalies = []

    for item in daily_data:

        record = {

            "date": item["_id"],

            "consumption": round(
                item["consumption"],
                2
            ),

            "threshold": round(
                threshold,
                2
            )
        }

        graph_data.append(record)

        if item["consumption"] > threshold:

            anomalies.append({
                "date": item["_id"],
                "consumption": round(
                    item["consumption"],
                    2
                )
            })

    return {

        "threshold": round(
            threshold,
            2
        ),

        "anomaly_count": len(
            anomalies
        ),

        "graph_data": graph_data,

        "anomalies": anomalies
    }

def calculate_anomalies_from_records(records):

    daily_map = {}

    for r in records:

        date = r["date"]

        if date not in daily_map:
            daily_map[date] = 0

        daily_map[date] += float(
            r["consumption"]
        )

    consumptions = list(
        daily_map.values()
    )

    if len(consumptions) < 3:

        threshold = max(
            consumptions
        )

        return {
            "threshold": threshold,
            "anomalies": []
        }

    mean_value = statistics.mean(
        consumptions
    )

    std_value = statistics.stdev(
        consumptions
    )

    threshold = (
        mean_value +
        2 * std_value
    )

    anomalies = []

    for date, value in daily_map.items():

        if value > threshold:

            anomalies.append({

                "date": date,

                "consumption": value,

                "threshold": threshold,

                "excess":
                    value - threshold
            })

    print("DASHBOARD THRESHOLD =", threshold)
    print("DASHBOARD anomalies =", anomalies)

    return {

        "threshold":
            round(threshold, 2),

        "anomalies":
            anomalies
    }

