from database.mongodb import utility_collection
import pandas as pd

# def save_dataframe(df):

#     records = df.to_dict(
#         orient="records"
#     )

#     utility_collection.delete_many({})

#     utility_collection.insert_many(
#         records
#     )

#     return len(records)

def save_dataframe(df):

    print("BEFORE DELETE =", utility_collection.count_documents({}))

    utility_collection.delete_many({})

    print("AFTER DELETE =", utility_collection.count_documents({}))

    df["consumption"] = pd.to_numeric(
        df["consumption"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["consumption"]
    )

    records = df.to_dict(orient="records")

    utility_collection.insert_many(records)

    print("AFTER INSERT =", utility_collection.count_documents({}))

    return len(records)
