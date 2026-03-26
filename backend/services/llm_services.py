from bytez import Bytez
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("BYTEZ_API_KEY")

sdk = Bytez(API_KEY)

model = sdk.model("mistralai/Mistral-7B-Instruct-v0.3")      #gpt-4o-mini

def generate(prompt):

    result = model.run([
        {
            "role": "user",
            "content": prompt
        }
    ])

    if result.error:
        raise Exception(result.error)

    return result.output["content"]
