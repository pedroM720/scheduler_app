from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
import bcrypt
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List

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

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Vite fallback port
    "http://127.0.0.1:5174",  # Vite fallback port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# model for requesting data validation 
class GroupCreate(BaseModel):
    group_name: str
    password: str

class GroupJoin(BaseModel):
    group_name: str
    password: str
    username: str

class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime

class AvailabilityCreate(BaseModel):
    user_name: str
    group_name: str
    password: str
    slots: List[TimeSlot]

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
    response = supabase.rpc("increment_counter", {"row_id": group_id}).execute()
    
    # Optional: fetch new count to return to user
    # (or just return success message to save bandwidth)
    return {"message": "Counter incremented safely"}


# --- 1. Helper: Find Intersection of Two Lists of Slots ---
def get_intersection(slots_a, slots_b):
    # Takes two lists of time slots and returns the times that exist in BOTH.

    intersections = []
    i, j = 0, 0
    
    # Sort slots
    slots_a.sort(key=lambda x: x['start_time'])
    slots_b.sort(key=lambda x: x['start_time'])

    while i < len(slots_a) and j < len(slots_b):
        # Determine the start and end of the potential overlap
        start = max(slots_a[i]['start_time'], slots_b[j]['start_time'])
        end = min(slots_a[i]['end_time'], slots_b[j]['end_time'])

        if start < end:
            intersections.append({'start_time': start, 'end_time': end})

        # Move the pointer of the slot that ends first
        if slots_a[i]['end_time'] < slots_b[j]['end_time']:
            i += 1
        else:
            j += 1
            
    return intersections

@app.post("/availability")
def add_availability(data: AvailabilityCreate):
    # A. Auth Check
    group_res = supabase.table("groups").select("id, password").eq("name", data.group_name).execute()
    if not group_res.data or not verify_password(data.password, group_res.data[0]["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    group_id = group_res.data[0]["id"]
    
    # B. Find User ID
    user_res = supabase.table("users").select("id").eq("name", data.user_name).eq("group_id", group_id).execute()
    if not user_res.data:
        raise HTTPException(status_code=404, detail="User not found in this group")
    
    user_id = user_res.data[0]["id"]

    # C. Prepare Data for Bulk Insert
    records = [
        {
            "user_id": user_id,
            "start_time": slot.start_time.isoformat(),
            "end_time": slot.end_time.isoformat()
        }
        for slot in data.slots
    ]

    # D. Insert
    insert_res = supabase.table("availability").insert(records).execute()
    return {"message": f"Added {len(records)} slots for {data.user_name}"}

# --- 3. Endpoint: Get Group Overlap ---
@app.get("/groups/{group_name}/overlap")
def get_group_overlap(group_name: str):
    # A. Get Group ID
    group_res = supabase.table("groups").select("id").eq("name", group_name).execute()
    if not group_res.data:
        raise HTTPException(status_code=404, detail="Group not found")
    group_id = group_res.data[0]['id']

    # B. Get all users in the group
    users_res = supabase.table("users").select("id").eq("group_id", group_id).execute()
    if not users_res.data:
        return {"overlap": []} # No users, no overlap
    
    # C. Get availability for all users
    # We fetch ALL slots for this group in one query for efficiency
    user_ids = [u['id'] for u in users_res.data]
    slots_res = supabase.table("availability").select("*").in_("user_id", user_ids).execute()
    all_slots = slots_res.data

    # D. Group slots by User ID
    # user_slots = { "user_uuid": [ {start, end}, {start, end} ] }
    user_slots_map = {}
    for slot in all_slots:
        # Convert string ISO dates back to datetime objects for comparison
        slot['start_time'] = datetime.fromisoformat(slot['start_time'])
        slot['end_time'] = datetime.fromisoformat(slot['end_time'])
        
        uid = slot['user_id']
        if uid not in user_slots_map:
            user_slots_map[uid] = []
        user_slots_map[uid].append(slot)

    # E. Calculate Intersection of ALL users
    # Start with the first user's slots as the baseline "common time"
    if not user_slots_map:
        return {"overlap": []}
    
    first_user_id = list(user_slots_map.keys())[0]
    common_slots = user_slots_map[first_user_id]

    # Compare iteratively with every other user
    # (Common Intersect User2) -> NewCommon
    # (NewCommon Intersect User3) -> FinalCommon ...
    for uid in user_slots_map:
        if uid == first_user_id: continue
        common_slots = get_intersection(common_slots, user_slots_map[uid])
        
        # Optimization: If common slots become empty, we can stop early
        if not common_slots:
            break

    return {"overlap": common_slots}

"""
FASTAPI  backend designed for user management, groups, share count, and database endpoints
implements models for data validations an API endpoints
"""