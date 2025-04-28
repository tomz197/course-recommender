import pymongo
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging


class MongoDBReader():
    """MongoDB Atlas implementation of the database reader."""

    _instance = None
    client = None
    db = None

    def __new__(cls):
        """Singleton pattern to ensure only one database connection."""
        if cls._instance is None:
            cls._instance = super(MongoDBReader, cls).__new__(cls)
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
            self.db.recommendation_feedback.create_index([("user_id", pymongo.ASCENDING)])
            self.db.recommendation_feedback.create_index([("course", pymongo.ASCENDING)])
            self.db.user_feedback.create_index([("faculty", pymongo.ASCENDING)])

            logging.info("Successfully connected to MongoDB Atlas")
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    def get_user_recommendation_feedbacks(self):
        """
        Get user feedback about course recommendations.
        """
        try:
            result = self.db.user_recommendation_feedback.find()
            return result
        except Exception as e:
            logging.error(f"Failed to get recommendation feedbacks: {str(e)}")
            raise
    
    def get_bot_recommendation_feedbacks(self):
        """
        Get bot feedback about course recommendations.
        """
        try:
            result = self.db.bot_recommendation_feedback.find()
            return result
        except Exception as e:
            logging.error(f"Failed to get recommendation feedbacks: {str(e)}")
            raise

    def get_user_feedbacks(self):
        """
        Get general user feedback about the system.
        """
        try:
            result = self.db.user_feedback.find()
            return result
        except Exception as e:
            logging.error(f"Failed to get user feedbacks: {str(e)}")
            raise


if __name__ == "__main__":
    logger = MongoDBReader()
    print(logger.get_user_recommendation_feedbacks())
    print(logger.get_user_feedbacks())
