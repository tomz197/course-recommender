import json
from google import genai
from google.genai import types
import random

from dotenv import load_dotenv
load_dotenv()
import os

INPUT_FILE = "./data/formatted/fi.json"
OUTPUT_FILE = "./data/generated/fi.json"

# Initialize the client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
)


def generate():
    print("Loading data ...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} items.")

    results = []

    print("Generating keywords ...")
    # for course in data:
    for i, course in enumerate(data):
        response_text = generate_keywords(course)

        # Extract keywords from the response
        course["KEYWORDS"] = extract_keywords(response_text)
        course["DESCRIPTION"] = extract_description(response_text)
        course["RATINGS"] = extract_ratings(response_text)

        # Append updated item to the results list
        results.append(course)
        print(f"Processed item {i+1}/{len(data)}")


    # Finally, write out the updated items to generated.json
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Done! Updated JSON with keywords is saved to '{OUTPUT_FILE}'.")

def extract_keywords(response_text):
    response_json = json.loads(response_text)
    return response_json.get("keywords", [])

def extract_description(response_text):
    response_json = json.loads(response_text)
    return response_json.get("description", "")

def extract_ratings(response_text):
    response_json = json.loads(response_text)
    return response_json.get("ratings", {})


def generate_keywords(input) -> str:
    model = "gemini-2.0-flash"

    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_NONE",  # Block none
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_NONE",  # Block none
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_NONE",  # Block none
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_NONE",  # Block none
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_CIVIC_INTEGRITY",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
        ],
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            enum = [],
            required = ["keywords", "description", "ratings"],
            properties = {
                "keywords": genai.types.Schema(
                    type = genai.types.Type.ARRAY,
                    items = genai.types.Schema(
                        type = genai.types.Type.STRING,
                    ),
                ),
                "description": genai.types.Schema(
                    type = genai.types.Type.STRING,
                ),
                "ratings": genai.types.Schema(
                    type = genai.types.Type.OBJECT,
                    enum = [],
                    required = ["theoretical_vs_practical", "usefulness", "interest", "stem_vs_humanities", "abstract_vs_specific", "difficulty", "multidisciplinary", "project_based", "creative"],
                    properties = {
                        "theoretical_vs_practical": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "usefulness": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "interest": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "stem_vs_humanities": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "abstract_vs_specific": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "difficulty": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "multidisciplinary": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "project_based": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                        "creative": genai.types.Schema(
                            type = genai.types.Type.STRING,
                        ),
                    },
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(text="""# You are creating a university course recommender system. You'll be given a JSON with all of the information you need.
---
## Task 1:
Extract 15 keywords from course description. The descriptions are inconsistent and aren't processed. The keywords need to be maximally 3 word long and have to be in lower case. You shouldn't just use frequency-based extraction but also use domain-specific keywords. Don't use common stopwords.

---

## Task 2:
Generate a short, max. 50 word description. Consider the target audience (students seeking recommendations).

---

## Task 3:
Rate the course on the following scales (0–10). Base ratings only on the provided JSON. Do not use prior knowledge. Consider the target audience (students seeking recommendations). Use the criteria below to ensure consistent ratings for student recommendations:
### Rating Criteria
 - theoretical_vs_practical
    - 0 = Entirely theoretical (e.g., pure mathematics)
    - 10 = Entirely practical (e.g., lab-based engineering)
 - usefulness
    - 0 = Not useful for career/real-world application (e.g., niche theory)
    - 10 = Highly useful (e.g., job-ready skills)
 - interest
    - 0 = Likely boring to most students
    - 10 = Highly engaging/interesting
 - stem_vs_humanities
    - 0 = STEM-focused (e.g., computer science)
    - 10 = Humanities-focused (e.g., philosophy)
 - abstract_vs_specific
    - 0 = Abstract/conceptual (e.g., theoretical physics)
    - 10 = Concrete/specific (e.g., accounting)
 - difficulty
    - 0 = Easy (minimal prerequisites)
    - 10 = Very hard (advanced prerequisites, complex content)
 - multidisciplinary
    - 0 = Focused on a single discipline
    - 10 = Integrates multiple fields (e.g., bioethics)
 - project_based
    - 0 = No projects/assignments
    - 10 = Heavily project-driven
 - creative
    - 0 = Requires no creativity (e.g., rote memorization)
    - 10 = Encourages creative thinking (e.g., design courses)"""),
        ],
    )

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=str(input))],
        ),
    ]

    # Collect the response text from streaming
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        response_text += chunk.text

    return response_text


if __name__ == "__main__":
    generate()
