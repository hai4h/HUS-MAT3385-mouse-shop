import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from src.api.v1.router import api_router

load_dotenv()

app = FastAPI(
    title="Mouse Shop API",
    description="API for Mouse Shop e-commerce platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://0.0.0.0:3000",
        "http://0.0.0.0:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(api_router)

os.makedirs("static/products", exist_ok=True)