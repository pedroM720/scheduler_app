from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
import bcrypt
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# loads env vars
load_dotenv()

# supabase connect
# Safely get the Supabase URL and Key from the environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check if the variables are set
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in the .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

# model for requesting data validation 
class GroupCreate(BaseModel):
    group_name: str
    password: str

class GroupJoin(BaseModel):
    group_name: str
    password: str
    username: str

# password management logic
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
# we hash a password bc duh, to verify a password we check it against the correct pass that is hashed
def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
# basic logic to check if Fast API is running, endpoints    

@app.get("/")
def root():
    return {"message": "FastAPI is running 🚀"}


# create group logic, 
@app.post("/create-group")
def create_group(group_data: GroupCreate):
    hashed_pw = hash_password(group_data.password)
    
    try:
        # insert new group
       group_response = supabase.table("groups").insert({
            "name": group_data.group_name,
            "password": hashed_pw
        }).execute()
       
       if not group_response.data:
            raise HTTPException(status_code=500, detail="Failed to make group")
       
       new_group_id = group_response.data[0]["id"]

       #initialize the counter for new group
       
       counter_response = supabase.table("counters").insert({
            "group_id": new_group_id,
            "count": 0
        }).execute()
       
       if not counter_response.data:
            # Optional: Add logic to delete the created group for consistency
            raise HTTPException(status_code=500, detail="Failed to initialize counter for group")
       return {"message": "Group created successfully", "group_id": new_group_id}
    
    except Exception as e:
        if 'duplicate key value violates unique constraint' in str(e):
            raise HTTPException(status_code=409, detail="A group with this name already exists.")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


# new endpoint for joining group
@app.post("/join-group")
def join_group(join_data: GroupJoin):
    """
    Allows a user to join an existing group if the password is correct.
    """
    # 1. Find the group
    group_res = supabase.table("groups").select("*").eq("name", join_data.group_name).execute()
    if not group_res.data:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group = group_res.data[0]
    
    # 2. Verify the password
    if not verify_password(join_data.password, group["password"]):
        raise HTTPException(status_code=401, detail="Invalid password")
        
    # 3. Add user to the 'users' table
    user_res = supabase.table("users").insert({
        "name": join_data.username,
        "group_id": group["id"]
    }).execute()
    
    if not user_res.data:
        raise HTTPException(status_code=500, detail="Failed to add user to group")
        
    return {"message": f"User '{join_data.username}' added to group '{join_data.group_name}'"}

#Endpoint to get the current count for a group
@app.get("/counter/{group_id}")
def get_counter(group_id: str):
    """
    Retrieves the current count for a given group.
    """
    counter_res = supabase.table("counters").select("count").eq("group_id", group_id).execute()
    
    if not counter_res.data:
        raise HTTPException(status_code=404, detail="Counter for this group not found")
        
    return {"group_id": group_id, "count": counter_res.data[0]["count"]}

# Endpoint to increment the count
@app.post("/counter/increment/{group_id}")
def increment_counter(group_id: str):
    """
    Increments the counter for a given group by 1.
    """
    # First, get the current count
    get_res = supabase.table("counters").select("count").eq("group_id", group_id).execute()
    
    if not get_res.data:
        raise HTTPException(status_code=404, detail="Counter for this group not found")
        
    current_count = get_res.data[0]["count"]
    new_count = current_count + 1
    
    # Now, update the count
    update_res = supabase.table("counters").update({"count": new_count}).eq("group_id", group_id).execute()
    
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update counter")
        
    return {"message": "Counter incremented", "new_count": new_count}


"""
FASTAPI  backend designed for user management, groups, share count, and database endpoints
implements models for data validations an API endpoints
"""