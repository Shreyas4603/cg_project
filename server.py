from fastapi import FastAPI, UploadFile, File, Form,Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from pydantic import BaseModel
from typing import List
from ultralytics import YOLO
import cv2
import requests
from io import BytesIO
import base64
import random
import json

# from yolov8 import YOLOv8
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3000/register",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def priority(t,n):
    return 1.5*t + 1*n
order = []

class ImageData(BaseModel):
    images: List[str]


@app.get("/")
def read_root():
    return {"message": "Hello, World"}


@app.get("/get-data")
def read_root():
    with open("data.json", "r") as jsonFile:
        data = json.load(jsonFile)
    return JSONResponse({"lane":data['lane'],"green_time":data['green_time']})

@app.post("/upload")
async def upload_images(data: ImageData):  # Expect a JSON object with an 'images' key
    vehicle_counts = []
    
    for image_str in data.images:
        # Decode the base64 string to get the raw bytes
        decoded_image = base64.b64decode(image_str)
        
        # Convert the decoded image bytes into a NumPy array
        image = cv2.imdecode(np.frombuffer(decoded_image, np.uint8), -1)
        
        # Load the YOLOv8 model
        model = YOLO('yolov8x.pt')
        
        # Run the model on the image
        results = model(image)
        
        # Filter results for vehicle classes
        vehicle_classes = [2, 3, 5, 7]  # Example class IDs for car, bus, truck, and motorcycle
        vehicle_count = sum(1 for result in results[0].boxes if result.cls in vehicle_classes)
        
        vehicle_counts.append(vehicle_count)

    green_lane_number, green_time = test(vehicle_counts)

    with open('data.json','w') as jsonFile:
        json.dump({"vc":"","lane":"","green_time":""},jsonFile)
        

    with open("data.json", "r") as jsonFile:
        data = json.load(jsonFile)
    data["vc"] = vehicle_counts
    data["lane"] = green_lane_number
    data["green_time"] = green_time

    with open("data.json", "w") as jsonFile:
        json.dump(data, jsonFile)


    # Return the counts of vehicles detected for each image
    return JSONResponse(content={"messages": [{"count": vc} for  vc in  vehicle_counts], "lane":green_lane_number, "green_time":green_time}, status_code=200)


time_arr = [1,1,1,1]

def test(vehicle_counts):
    # Weights for the priority index calculation....
    alpha = 0.55 # number of vehicles
    beta = 0.45   # waiting time
    green_time = 0
    active_lanes = [0,1,2,3]
    # Example data for the lanes
    lanes = {
        0: {'vehicles': vehicle_counts[0], 'waiting_time': time_arr[0]},
        1: {'vehicles': vehicle_counts[1], 'waiting_time': time_arr[1]},
        2: {'vehicles': vehicle_counts[2],  'waiting_time': time_arr[2]},
        3: {'vehicles': vehicle_counts[3],  'waiting_time': time_arr[3]}
    }

    # Calculate the priority index for each lane
    priority_indices = {}
    total_vehicles = sum(lane['vehicles'] for lane in lanes.values())
    total_waiting_time = sum(lane['waiting_time'] for lane in lanes.values())

    # Doing normalization hereeee!!!
    for lane, data in lanes.items():
        V_i = data['vehicles'] / total_vehicles
        W_i = data['waiting_time'] / total_waiting_time
        PI_i = alpha * V_i + beta * W_i
        priority_indices[lane] = PI_i

    # Determine the lane with the highest priority index
    green_lane = max(priority_indices, key=priority_indices.get)
    green_time = priority_indices[green_lane]*100
    green_time = round(green_time)
    print("green time is",green_time)
    active_lanes.remove(green_lane)

    for i in active_lanes:
        time_arr[i]+=green_time

    time_arr[green_lane] = 0

    # Output the chosen lane to turn green
    print(f"Lane {green_lane} should turn green next.")
    print(active_lanes)
    print(lanes)
    return green_lane,green_time