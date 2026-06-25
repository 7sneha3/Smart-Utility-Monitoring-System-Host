# services/cleaning_service.py

import pandas as pd


COLUMN_MAPPING = {

    "Utility_ID": "utility_id",
    "utility_id": "utility_id",

    "Sub_Utility": "sub_utility",
    "sub_utility": "sub_utility",

    "Timestamp": "date",
    "timestamp": "date",
    "Date": "date",
    "DATE": "date",

    "Value": "consumption",
    "value": "consumption",
    "Consumption": "consumption",
    "consumption": "consumption",

    "Unit": "unit",
    "unit": "unit"
}


def normalize_columns(df):

    df.rename(
        columns=COLUMN_MAPPING,
        inplace=True
    )

    return df


def standardize_dates(df):
    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    df["date"] = (
        df["date"]
        .dt.strftime("%Y-%m-%d")
    )

    return df

def remove_duplicates(df):

    return df.drop_duplicates()


def remove_missing(df):

    return df.dropna(
        subset=[
            "utility_id",
            "date",
            "consumption"
        ]
    )