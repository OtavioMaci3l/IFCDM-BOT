import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import database
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("API_KEY_GEMINI"))

global thread
thread = []

persona = "Você é o assitente do IF Carmo de Minas, amigavel, direto ao ponto, sem apresentações ou despedidas, use Markdown"

def directorIA(prompt):
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    instructions = f""" Analize o texto e responda, sepadado por espaços, qual ou quais IA serão chamadas para obter informações para responder o usuario, ultilize apenas as categories {database} e nuca deixe null; Texto: "{prompt}". """
    result = model.generate_content(instructions)
    return result.text

def categoriesFormater(directions):
    directionsIA = []
    for category in database:
        if category in directions:
            directionsIA.append(category)
    return directionsIA

def searchIA(directions, prompt):
    search = ""
    for direction in directions:
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        instructions = f""" Busque no texto: "{database[direction]}" informações úteis para responder a pergunta: "{prompt}" Regras: "Apenas trasncreva o que encontrar que será útil para responder o prompt, não invente informações ou resum, transcreva da forma na qual foi encontrado". """
        result = model.generate_content(instructions)
        search += f"""\n{direction} :\n{result.text}"""
    return search

def responseIA(prompt, search):
    model = genai.GenerativeModel("gemini-2.5-flash-lite")
    instructions = f"""Perosna: {persona}. \nInformações buscadas préviamente através de uma prévia interpretação da pergunta que podem ser importantes para responder o prompt enviado pelo usuário: "{search}". \nPrompt enviado pelo usuário: "{prompt}". """
    result = model.generate_content(instructions)
    return result.text

state = ""

def sendPrompt(prompt):
    global state
    #prompt = str(input())
    print("\n\nPROMPT> ",prompt,"\n\n")
    state = "Enviado\n"

    directions = directorIA(prompt)
    directionsFormated = categoriesFormater(directions)
    print("\n\nDIRECTIONSFORMATED> ",directionsFormated,"\n\n")
    state = "Direcionado: \n\n{}\n".format(directionsFormated)

    search = searchIA(directionsFormated, prompt)
    print("\n\nSEACRCH> ",search,"\n\n")
    state = "Informações encontradas: \n\n{}\n".format(search)

    response = responseIA(prompt, search)
    print("\n\nRESPONSE> ",response,"\n\n")
    state = "Resposta concluida"

    return response

@app.get("/state")
def get_state():
    return {"state": state}

@app.get("/")
def getThread():
    return {"thread": thread}

@app.post("/send/{prompt}")
def send_prompt(prompt: str):
    thread.append({"role":"user", "content": prompt})
    response = sendPrompt(prompt)
    thread.append({"role":"assitent","content": response})
    return {"response": response}

@app.post("/trash")
def trash():
    global thread
    thread.clear()
    return {"message":"thread deletada"}