# services/classification_service.py

import pandas as pd
from config.utility_mapping import UTILITY_MAPPING


def classify_resource(df):

    date_series = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["month"] = date_series.dt.month

    df["year"] = date_series.dt.year

    df["resource_type"] = df[
        "utility_id"
    ].apply(
        lambda x:
        UTILITY_MAPPING.get(
            str(x),
            {}
        ).get(
            "type",
            "unknown"
        )
    )

    return df