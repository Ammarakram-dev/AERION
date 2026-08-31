import os
from dotenv import load_dotenv

load_dotenv()

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")

if not FORTYGUARD_API_KEY:
    raise RuntimeError("FORTYGUARD_API_KEY is not configured")