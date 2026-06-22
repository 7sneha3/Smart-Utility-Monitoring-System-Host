from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["smart_utility"]

collection = db["utility_data"]

def clear_records(resource_type=None):

    if resource_type:
        collection.delete_many({"resource_type": resource_type})
    else:
        collection.delete_many({})

def insert_records(records):
    collection.insert_many(records)