from typing import List, Optional
import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
from app.logger import logger

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
                logger.error("MongoDB connection string not found in environment variables")
                raise ValueError("MongoDB connection string not found")

            self.client = MongoClient(connection_string)
            self.db = self.client.get_database("course_feedback")

            # Create indexes for efficient queries
            self.db.recommendation_feedback.create_index([("user_id", pymongo.ASCENDING)])
            self.db.recommendation_feedback.create_index([("course", pymongo.ASCENDING)])
            self.db.user_feedback.create_index([("faculty", pymongo.ASCENDING)])

            logger.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def log_recommendation_feedback(self, liked: List[str], disliked: List[str], skipped: List[str], course: str, action: str, user_id: str, model: str):
        """
        Log user feedback about course recommendations.

        Args:
            liked: List of liked recommendations
            disliked: List of disliked recommendations
            skipped: List of skipped recommendations
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
                "skipped_recommendations": skipped,
                "action": action,
                "model": model,
                "timestamp": datetime.now()
            }

            result = self.db.recommendation_feedback.insert_one(feedback_doc)
            logger.info(f"Feedback logged with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Failed to log feedback: {str(e)}")
            raise

    def log_user_feedback(self, text: Optional[str], rating: Optional[int], faculty: Optional[str], user_id: str):
        """
        Log general user feedback about the system.

        Args:
            text: Feedback text from the user
            rating: Numerical rating (1-5)
            faculty: Faculty the feedback is related to
            user_id: Unique identifier of the user
        """
        try:
            feedback_doc = {
                "text": text,
                "rating": rating,
                "faculty": faculty,
                "user_id": user_id,
                "timestamp": datetime.now()
            }

            result = self.db.user_feedback.insert_one(feedback_doc)
            logger.info(f"User feedback logged with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Failed to log user feedback: {str(e)}")
            raise