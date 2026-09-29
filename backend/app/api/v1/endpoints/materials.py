from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import PackagingMaterial
from app.schemas.material import MaterialResponse

router = APIRouter()


@router.get("", response_model=List[MaterialResponse])
def get_materials(
    polymer_family: Optional[str] = None,
    gas_barrier_class: Optional[str] = None,
    recyclability: Optional[str] = None,
    is_biodegradable: Optional[bool] = None,
    is_breathable: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(PackagingMaterial)

    if polymer_family:
        query = query.filter(PackagingMaterial.polymer_family == polymer_family)
    if gas_barrier_class:
        query = query.filter(PackagingMaterial.gas_barrier_class == gas_barrier_class)
    if recyclability:
        query = query.filter(PackagingMaterial.recyclability == recyclability)
    if is_biodegradable is not None:
        query = query.filter(PackagingMaterial.is_biodegradable == is_biodegradable)
    if is_breathable is not None:
        query = query.filter(PackagingMaterial.is_breathable == is_breathable)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(
            PackagingMaterial.name.ilike(s),
            PackagingMaterial.material_code.ilike(s),
            PackagingMaterial.structure.ilike(s)
        ))

    return query.order_by(PackagingMaterial.material_code.asc()).offset(skip).limit(limit).all()


@router.get("/{material_id}", response_model=MaterialResponse)
def get_material_by_id(material_id: int, db: Session = Depends(get_db)):
    mat = db.query(PackagingMaterial).filter(PackagingMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail=f"Packaging material with id {material_id} not found")
    return mat
