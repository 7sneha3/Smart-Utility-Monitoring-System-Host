from services.file_service import read_file
from services.cleaning_service import (
    normalize_columns,
    standardize_dates,
    remove_duplicates,
    remove_missing
)
from services.classification_service import classify_resource
from services.aggregation_service import aggregate_data

# Replace with your actual file path
file_path = r"D:\FINAL YR PRJ\backend\uploads\January energy data.xlsx"

df = read_file(file_path)

print("\nORIGINAL DATA")
print(df.head())

df = normalize_columns(df)

df = standardize_dates(df)

df = remove_duplicates(df)

df = remove_missing(df)

df = classify_resource(df)

df = aggregate_data(df)

print("\nFINAL PROCESSED DATA")
print(df.head())

print("\nTOTAL RECORDS:")
print(len(df))

print(df.info())
print("\n")
print(df["resource_type"].value_counts())
