import json
from google import genai
from google.genai import types
import random

from dotenv import load_dotenv
load_dotenv()
import os

def generate():
    # Initialize the client
    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash"

    # Configuration for the generate_content method
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type=genai.types.Type.OBJECT,
            properties={
                "keywords": genai.types.Schema(
                    type=genai.types.Type.ARRAY,
                    items=genai.types.Schema(
                        type=genai.types.Type.STRING,
                    ),
                ),
            },
        ),
        system_instruction=[
            types.Part.from_text(
                text=(
                    "You are creating a university course recommender system "
                    "and need to extract 15 keywords from course description. "
                    "The descriptions are inconsistent and aren't processed. "
                    "The keywords need to be maximally 3 words long and have to "
                    "be in lower case. You shouldn't just use frequency-based "
                    "extraction but also use domain specific keywords. Apply "
                    "stemming and lemmatization. Don't use common stopwords."
                )
            ),
        ],
    )

    print("Loading data ...")
    with open("./data/formatted/fi.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data)} items.")

    results = []

    print("Generating keywords ...")
    # for course in data:
    for i, course in enumerate(random.sample(data, 10)):
        # Build the content for the prompt
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=str(course))],
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

        # Parse the response (assumed valid JSON with { "keywords": [...] })
        try:
            response_json = json.loads(response_text)
            course["keywords"] = response_json.get("keywords", [])
        except json.JSONDecodeError:
            # In case the model returns something unexpected
            course["keywords"] = []

        # Append updated item to the results list
        results.append(course)
        print(f"Processed item {i+1}/{len(data)}")


    # Finally, write out the updated items to generated.json
    with open("./data/generated/fi.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("Done! Updated JSON with keywords is saved to './data/generated/fi.json'.")

if __name__ == "__main__":
    generate()
