from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import FoodCommodity
from app.schemas.commodity import CommodityResponse

router = APIRouter()


@router.get("", response_model=List[CommodityResponse])
def get_commodities(
    category: Optional[str] = None,
    is_respiring: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(FoodCommodity)

    if category:
        query = query.filter(FoodCommodity.category == category)
    if is_respiring is not None:
        query = query.filter(FoodCommodity.is_respiring == is_respiring)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(FoodCommodity.name.ilike(s), FoodCommodity.commodity_code.ilike(s)))

    return query.order_by(FoodCommodity.name.asc()).offset(skip).limit(limit).all()


@router.get("/{commodity_id}", response_model=CommodityResponse)
def get_commodity_by_id(commodity_id: int, db: Session = Depends(get_db)):
    comm = db.query(FoodCommodity).filter(FoodCommodity.id == commodity_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail=f"Food commodity with id {commodity_id} not found")
    return comm
