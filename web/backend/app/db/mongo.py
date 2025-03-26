from typing import List
import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

class MongoDBLogger():
    """MongoDB Atlas implementation of the database logger."""
    
    _instance = None
    client = None
    db = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one database connection."""
        if cls._instance is None:
            cls._instance = super(MongoDBLogger, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize the MongoDB connection if not already initialized."""
        if self._initialized:
            return
            
        load_dotenv()
        self._initialized = True
        self.init_db()
    
    def init_db(self):
        """Initialize the connection to MongoDB Atlas."""
        try:
            connection_string = os.getenv("MONGO_CONNECTION_STRING")
            if not connection_string:
                logging.error("MongoDB connection string not found in environment variables")
                raise ValueError("MongoDB connection string not found")
            
            self.client = MongoClient(connection_string)
            self.db = self.client.get_database("course_feedback")
            
            # Create indexes for efficient queries
            self.db.feedback.create_index([("user_id", pymongo.ASCENDING)])
            self.db.feedback.create_index([("course", pymongo.ASCENDING)])
            
            logging.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def log_feedback(self, liked: List[str], disliked: List[str], course: str, like: bool, user_id: str, model: str):
        """
        Log user feedback about course recommendations.
        
        Args:
            liked: List of liked recommendations
            disliked: List of disliked recommendations
            course: Course ID for which recommendations were given
            like: Overall satisfaction with recommendations
            user_id: Unique identifier of the user
        """
        try:
            feedback_doc = {
                "user_id": user_id,
                "course": course,
                "liked_recommendations": liked,
                "disliked_recommendations": disliked,
                "like": like,
                "model": model,
                "timestamp": datetime.now()
            }
            
            result = self.db.feedback.insert_one(feedback_doc)
            logging.info(f"Feedback logged with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logging.error(f"Failed to log feedback: {str(e)}")
            raise

if __name__ == "__main__":
    logger = MongoDBLogger()
    logger.log_feedback(["CS101", "MATH101"], ["ART101"], "CS201", True, "user123", "keywords")
