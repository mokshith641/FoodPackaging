import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal
from app.models.models import User, Recommendation, FoodCommodity, PackagingMaterial

def inspect():
    db = SessionLocal()
    print("=" * 70)
    print(" PACKSCI AI — DATABASE INSPECTION TOOL")
    print("=" * 70)

    # 1. Inspect Users Table
    users = db.query(User).all()
    print(f"\n[1] USERS TABLE (`users`) — Total: {len(users)}")
    print(f"{'ID':<5} | {'Name':<25} | {'Email':<30} | {'Admin':<6}")
    print("-" * 70)
    for u in users:
        print(f"{u.id:<5} | {u.name:<25} | {u.email:<30} | {str(u.is_admin):<6}")

    # 2. Inspect Recommendations Table
    recs = db.query(Recommendation).all()
    print(f"\n[2] RECOMMENDATIONS TABLE (`recommendations`) — Total: {len(recs)}")
    print(f"{'ID':<5} | {'User ID':<8} | {'Commodity':<20} | {'Top Material':<25} | {'Score':<6}")
    print("-" * 70)
    for r in recs:
        u_id = str(r.user_id) if r.user_id is not None else "Guest"
        mat = r.top_material_name or "N/A"
        score = f"{r.top_score}/100" if r.top_score else "N/A"
        print(f"{r.id:<5} | {u_id:<8} | {r.commodity_name[:19]:<20} | {mat[:24]:<25} | {score:<6}")

    # 3. Inspect Commodities Table
    commodities = db.query(FoodCommodity).all()
    print(f"\n[3] FOOD COMMODITIES TABLE (`commodities`) — Total: {len(commodities)}")
    print(f"{'ID':<5} | {'Commodity Name':<30} | {'Category':<22} | {'Moisture %':<10}")
    print("-" * 70)
    for c in commodities[:6]:
        moist = f"{c.moisture_pct}%" if c.moisture_pct is not None else "N/A"
        print(f"{c.id:<5} | {c.name[:29]:<30} | {c.category[:21]:<22} | {moist:<10}")
    if len(commodities) > 6:
        print(f"... and {len(commodities) - 6} more commodities in database.")

    # 4. Inspect Materials Table
    materials = db.query(PackagingMaterial).all()
    print(f"\n[4] PACKAGING MATERIALS TABLE (`materials`) — Total: {len(materials)}")
    print(f"{'Code':<6} | {'Material Name':<35} | {'OTR':<10} | {'WVTR':<10}")
    print("-" * 70)
    for m in materials[:6]:
        print(f"{m.material_code:<6} | {m.name[:34]:<35} | {m.otr_ref:<10} | {m.wvtr_ref:<10}")
    if len(materials) > 6:
        print(f"... and {len(materials) - 6} more packaging materials in database.")

    print("\n" + "=" * 70)
    db.close()

if __name__ == "__main__":
    inspect()
