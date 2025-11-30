import asyncio
import os
from dotenv import load_dotenv
from app.services.gemini_service import GeminiService

# Load env vars
load_dotenv()

async def test_generation():
    print("Testing Gemini Service...")
    try:
        service = GeminiService()
        print("Service initialized.")
        
        prompt = "Generate 3 coding challenges for Python beginners. Return JSON array."
        print(f"Sending prompt: {prompt}")
        
        result = await service.generate_json(
            prompt=prompt,
            temperature=0.9,
            max_output_tokens=1000
        )
        
        print("Success!")
        print(result)
        
    except Exception as e:
        print(f"Error occurred: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_generation())
