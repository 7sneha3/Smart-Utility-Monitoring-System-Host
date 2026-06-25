from pymongo import MongoClient

client = MongoClient(
    "mongodb://localhost:27017/"
)

db = client["smart_utility_db"]

utility_collection = db["utility_consumption"]