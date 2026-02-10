from app import app
from db import get_db

with app.app_context():
    try:
        db = get_db()
        print(f"DB Object: {db}")
        # list_collection_names is a PyMongo method
        cols = db.list_collection_names()
        print(f"Collections: {cols}")
        print("Verification Successful")
    except Exception as e:
        print(f"Verification Failed: {e}")
