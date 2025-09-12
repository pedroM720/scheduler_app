from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# supabase connect
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

#password management
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    
@app.get("/")
def root():
    return {"message": "FastAPI is running 🚀"}

@app.post("/create-group")
def create_group(group_name: str, password: str):
    hashed_pw = hash_password(password)
    group = supabase.table("groups").insert({"name": group_name, "password": hashed_pw}).execute()
    return {"group_id": group.data[0]["id"]}