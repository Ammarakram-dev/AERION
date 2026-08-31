from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.services.fortyguard import create_heatmap, get_activity_status
from app.services.intelligence.engine import analyze_heat_data


app = FastAPI(
    title="AERION API",
    description="AI Heat Intelligence & Decision System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HeatmapRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: str
    time: str
    granularity: str = "100m"


@app.get("/")
async def root():
    return {
        "name": "AERION",
        "status": "online",
        "message": "AI Heat Intelligence & Decision System ready.",
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "AERION",
        "intelligence": "ready",
        "fortyguard": "connected",
    }


@app.post("/api/heatmap")
async def heatmap(request: HeatmapRequest):
    try:
        result = await create_heatmap(
            latitude=request.latitude,
            longitude=request.longitude,
            date=request.date,
            time=request.time,
            granularity=request.granularity,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "FortyGuard heatmap request failed.",
                "error": str(error),
            },
        )


@app.get("/api/heatmap/status/{activity_id}")
async def heatmap_status(activity_id: str):
    try:
        return await get_activity_status(activity_id)

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "FortyGuard status request failed.",
                "error": str(error),
            },
        )


@app.post("/api/intelligence")
async def intelligence(request: HeatmapRequest):
    try:
        heatmap_result = await create_heatmap(
            latitude=request.latitude,
            longitude=request.longitude,
            date=request.date,
            time=request.time,
            granularity=request.granularity,
        )

        activity_id = heatmap_result.get("data", {}).get("activity_id")

        if not activity_id:
            activity_id = heatmap_result.get("activity_id")

        if not activity_id:
            return {
                "status": "submitted",
                "message": "FortyGuard heatmap request submitted.",
                "fortyguard": heatmap_result,
            }

        status_result = await get_activity_status(activity_id)

        analysis = analyze_heat_data(status_result)

        return {
            "status": "completed",
            "activity_id": activity_id,
            "fortyguard": status_result,
            "aerion": analysis,
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AERION intelligence pipeline failed.",
                "error": str(error),
            },
        )