# core/gemini.py
import os
from langchain_core.messages import HumanMessage
from langchain_core.language_models import BaseChatModel
from langchain_core.tools import Tool
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import sys
import os

# Load the .env file from the project root
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
print(f"Loading .env from {dotenv_path}")
load_dotenv(dotenv_path=dotenv_path, verbose=True)
print(f"GOOGLE_API_KEY present: {'GOOGLE_API_KEY' in os.environ}")


class GeminiService:
    def __init__(self, model_name: str = "gemini-pro", temperature: float = 0.7):
        if not os.getenv("GOOGLE_API_KEY"):
            raise ValueError("Missing GOOGLE_API_KEY in environment")

        self.model_name = model_name
        self.llm: BaseChatModel = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature
        )
        self.parser = StrOutputParser()

    def run_prompt(self, system_prompt: str, user_input: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])

        chain = prompt | self.llm | self.parser
        return chain.invoke({"input": user_input})

    def run_raw(self, prompt_text: str) -> str:
        """Run a plain text prompt."""
        return self.llm.invoke([HumanMessage(content=prompt_text)]).content

    def as_tool(self, name="gemini_tool", description="LLM-based assistant"):
        """Wrap Gemini as a LangChain Tool for agent use."""
        return Tool(
            name=name,
            func=self.run_raw,
            description=description
        )
