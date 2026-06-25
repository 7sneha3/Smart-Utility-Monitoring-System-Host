from flask import Blueprint
from flask import request
from flask import jsonify
from database.mongodb import utility_collection
import os
import pandas as pd


from services.file_service import (
    allowed_file,
    read_file
)

from services.cleaning_service import (
    normalize_columns,
    standardize_dates,
    remove_duplicates,
    remove_missing
)

from services.classification_service import (
    classify_resource
)

from services.aggregation_service import (
    aggregate_data
)

from services.mongo_service import (
    save_dataframe
)

upload_bp = Blueprint(
    "upload",
    __name__
)

@upload_bp.route(
    "/upload",
    methods=["POST"]
)
def upload_file():

    if "file" not in request.files:

        return jsonify({
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":

        return jsonify({
            "error": "Empty file"
        }), 400

    if not allowed_file(file.filename):

        return jsonify({
            "error": "Invalid file type"
        }), 400

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    filepath = os.path.join(
        "uploads",
        file.filename
    )

    file.save(filepath)

    df = read_file(filepath)
    original_count = len(df)

    print(df.head())
    print(df.columns)
    df = normalize_columns(df)
    print(df["date"].head(20))
    print(df["date"].dtype)

    for d in df["date"].head(20):
        print(d, type(d))
        

    df = standardize_dates(df)

    df = remove_duplicates(df)

    df = remove_missing(df)

    df = classify_resource(df)

    # VALIDATION BLOCK to count valid, invalid entries
    df["consumption"] = pd.to_numeric(
        df["consumption"],
        errors="coerce"
    )

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "consumption",
            "date"
        ]
    )

    df["date"] = (
        df["date"]
        .dt.strftime("%Y-%m-%d")
    )

    df = df[
        df["consumption"] >= 0
    ]

    clean_count = len(df)

    invalid_rows = (
        original_count -
        clean_count
    )

    # df = aggregate_data(df)

    print("Before aggregation:", len(df))

    df = aggregate_data(df)

    print("After aggregation:", len(df))

    utility_collection.delete_many({})

    print("SAVE DATAFRAME CALLED")
    total_records = save_dataframe(df)

    return jsonify({

        "status": "success",

        "records": total_records,

        "valid_rows":
            clean_count,

        "invalid_rows":
            invalid_rows,

        "energy_records":
            len(
                df[
                    df["resource_type"]
                    == "energy"
                ]
            ),

        "water_records":
            len(
                df[
                    df["resource_type"]
                    == "water"
                ]
            )
    })