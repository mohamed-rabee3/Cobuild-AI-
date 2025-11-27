"""Prompt templates for challenges generation."""


def get_challenges_prompt(
    count: int,
    difficulty: str,
    language: str,
    existing_titles: list
) -> str:
    """Generate coding challenges prompt."""
    existing_formatted = "\n".join([f"- {title}" for title in existing_titles]) if existing_titles else "None"
    
    return f"""You are a programming challenge designer for {language}.

Generate {count} coding challenges with difficulty: {difficulty}

IMPORTANT: Avoid these existing challenge titles:
{existing_formatted}

Requirements for each challenge:
1. **Function-based**: Student implements a single function
2. **No interactive input**: Function takes parameters, returns result (NO input() calls)
3. **Clear specification**: Describe what the function should do
4. **Test cases**: Provide 5-8 test cases (mix of visible and hidden)
5. **Realistic**: Common programming problems suitable for practice

Difficulty guidelines:
- **Easy**: Basic operations (math, strings, simple logic)
  - Examples: sum numbers, reverse string, find max
- **Medium**: Data structures, algorithms, moderate logic
  - Examples: palindrome check, binary search, count occurrences
- **Hard**: Complex algorithms, edge cases, optimization
  - Examples: Fibonacci with memoization, graph problems

For each challenge, provide:
- Unique title (not in existing_titles)
- **Comprehensive description in Arabic (3-5 paragraphs)**:
  1. **Problem overview**: What the function does (2-3 sentences)
  2. **Examples**: 1-2 concrete input/output examples (2 sentences)
  3. **Constraints** (optional): Edge cases or important notes (1 sentence)
  - Use Markdown formatting (use **bold** for key terms)
  - Mix Arabic with English technical terms when needed
- Function signature for {language}
- 5-8 test cases (3-4 visible, 2-4 hidden)

Test case format:
- `input`: Function call as string (e.g., "sum_two(2, 3)")
- `expected`: Expected output as string (e.g., "5")
- `hidden`: Boolean (true = not shown to student)

Respond ONLY with valid JSON array:
[
  {{
    "title": string (unique, concise),
    "description": string (Arabic Markdown, 3-5 comprehensive paragraphs),
    "function_signature": string (language-specific),
    "test_cases": [
      {{
        "input": string,
        "expected": string,
        "hidden": boolean
      }}
    ]
  }}
]

Language syntax:
- Python: "def function_name(params):"
- JavaScript: "function functionName(params) {{"
- C++: "returnType function Name(params) {{"

Description language: Arabic
Code: English"""
