import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import Base, engine
from backend.seed_data import seed_database
from backend.routers import medicines, inventory, transfers, warehouses, auth_routes, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created and seeded
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title="PharmaTrack ERP & Supply Chain Distribution Platform API",
    description="Enterprise Pharmacy ERP with FEFO Batch Management, Inter-Warehouse Transfers, and Multi-Role RBAC.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_routes.router)
app.include_router(medicines.router)
app.include_router(warehouses.router)
app.include_router(inventory.router)
app.include_router(transfers.router)
app.include_router(analytics.router)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "PharmaTrack ERP Backend", "version": "1.0.0"}

# Serve frontend build in production if available
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
