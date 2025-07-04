import logging
import sys
from datetime import datetime

def setup_logger():
    logger = logging.getLogger("muni_courses")
    logger.setLevel(logging.INFO)
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logger()
logger.info(f"Logger initialized at {datetime.now().isoformat()}")