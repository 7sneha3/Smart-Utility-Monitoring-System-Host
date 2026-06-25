from database.mongodb import utility_collection

sample = {
    "utility_id": "U1",
    "sub_utility": "Main Grid Supply",
    "resource_type": "energy",
    "date": "2025-01-01",
    "unit": "kWh",
    "consumption": 500
}

result = utility_collection.insert_one(sample)

print("Inserted ID:", result.inserted_id)