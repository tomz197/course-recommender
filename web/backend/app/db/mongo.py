from typing import List, Optional
import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime
from app.logger import logger
from app.types import RecommendationFeedbackLog, UserFeedbackLog

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
            if os.getenv("ENVIRONMENT") == "dev":
                self.db = self.client.get_database("course_feedback_dev")
            else:
                self.db = self.client.get_database("course_feedback")

            # Create indexes for efficient queries
            self.db.recommendation_feedback.create_index([("user_id", pymongo.ASCENDING)])
            self.db.recommendation_feedback.create_index([("course", pymongo.ASCENDING)])
            self.db.user_feedback.create_index([("faculty", pymongo.ASCENDING)])

            logger.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def log_recommendation_feedbacks(self, log: RecommendationFeedbackLog, collection):
        try:
            feedback_doc = {
                "user_id": log.user_id,
                "course": log.course,
                "liked_recommendations": log.liked,
                "disliked_recommendations": log.disliked,
                "skipped_recommendations": log.skipped,
                "action": log.action,
                "model": log.model,
                "recommended_from": log.recommended_from,
                "timestamp": datetime.now()
            }

            result = collection.insert_one(feedback_doc)
            logger.info(f"Feedback logged with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Failed to log feedback: {str(e)}")
            raise
    
    def log_recommendation_feedback(self, log: RecommendationFeedbackLog):
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
        return self.log_recommendation_feedbacks(log, self.db.recommendation_feedback)
    
    def log_bot_recommendation_feedback(self, log: RecommendationFeedbackLog):
        """
        Log bot feedback about course recommendations.

        Args:
            liked: List of liked recommendations
            disliked: List of disliked recommendations
            skipped: List of skipped recommendations
            course: Course ID for which recommendations were given
            like: Overall satisfaction with recommendations
            user_id: Unique identifier of the user
        """
        return self.log_recommendation_feedbacks(log, self.db.bot_recommendation_feedback)

    def log_user_feedback(self, log: UserFeedbackLog):
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
                "text": log.text,
                "faculty": log.faculty,
                "user_id": log.user_id,
                "phrases": log.phrases,
                "model": log.model,
                "timestamp": datetime.now()
            }

            result = self.db.user_feedback.insert_one(feedback_doc)
            logger.info(f"User feedback logged with ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"Failed to log user feedback: {str(e)}")
            raise