import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")

FORTYGUARD_HEATMAP_URL = (
    "https://api.fortyguard.com/v1/heatmap"
)

FORTYGUARD_STATUS_URL = (
    "https://api.fortyguard.com/v1/status"
)

TIMEOUT = 60.0


def get_headers() -> dict[str, str]:
    if not FORTYGUARD_API_KEY:
        raise RuntimeError(
            "FORTYGUARD_API_KEY is missing from backend/.env"
        )

    return {
        "api-key": FORTYGUARD_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def build_polygon(
    latitude: float,
    longitude: float,
    size: float = 0.01,
) -> dict[str, Any]:

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [longitude - size, latitude - size],
                            [longitude + size, latitude - size],
                            [longitude + size, latitude + size],
                            [longitude - size, latitude + size],
                            [longitude - size, latitude - size],
                        ]
                    ],
                },
            }
        ],
    }


async def create_heatmap(
    latitude: float,
    longitude: float,
    date: str,
    time: str,
    granularity: str = "100m",
) -> dict[str, Any]:

    payload = {
        "polygon_aoi": build_polygon(
            latitude=latitude,
            longitude=longitude,
        ),
        "date_time": {
            "start_date": date,
            "start_time": time,
            "filter_type": 1,
        },
        "granularity": int(
            granularity.replace("m", "")
        ),
    }

    async with httpx.AsyncClient(
        timeout=TIMEOUT
    ) as client:

        response = await client.post(
            FORTYGUARD_HEATMAP_URL,
            headers=get_headers(),
            json=payload,
        )

        response.raise_for_status()

        return response.json()


async def get_activity_status(
    activity_id: str,
) -> dict[str, Any]:

    async with httpx.AsyncClient(
        timeout=TIMEOUT
    ) as client:

        response = await client.get(
            f"{FORTYGUARD_STATUS_URL}/{activity_id}",
            headers={
                "api-key": FORTYGUARD_API_KEY,
                "Accept": "application/json",
            },
        )

        response.raise_for_status()

        return response.json()