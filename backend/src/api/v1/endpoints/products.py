from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Optional
from src.core.security import get_current_user
from src.models.schemas.product import Product, ProductCreate, ProductWithSpecs
from src.models.schemas.technical_specs import TechnicalSpec
from src.models.schemas.user import User
from src.db.database import get_db_connection


router = APIRouter()

@router.post("/", response_model=Product)
async def create_product(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Lấy và validate body của request
        body = await request.json()
        if not isinstance(body, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid request body format - must be a JSON object"
            )

        # Validate product data structure
        product_data = body.get("product")
        specs_data = body.get("specs")
        
        if not product_data or not specs_data:
            raise HTTPException(
                status_code=400,
                detail="Request body must contain both 'product' and 'specs' objects"
            )

        # Check for duplicate product name
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Case-insensitive check for existing product name
            cursor.execute(
                "SELECT product_id FROM products WHERE LOWER(name) = LOWER(%s)",
                (product_data.get("name", ""),)
            )
            existing_product = cursor.fetchone()
            
            if existing_product:
                raise HTTPException(
                    status_code=400,
                    detail=f"A product with the name '{product_data.get('name')}' already exists"
                )

            # Validate product fields
            required_product_fields = {
                "name": str,
                "description": str,
                "price": (int, float),
                "stock_quantity": int,
                "hand_size": str,
                "grip_style": str,
                "is_wireless": bool,
                "brand": str
            }

            product_errors = []
            for field, expected_type in required_product_fields.items():
                value = product_data.get(field)
                if value is None:
                    product_errors.append(f"Missing required field: {field}")
                elif not isinstance(value, expected_type):
                    product_errors.append(f"Invalid type for {field}: expected {expected_type.__name__}, got {type(value).__name__}")
                elif isinstance(value, str) and not value.strip():
                    product_errors.append(f"Field {field} cannot be empty")
                elif field in ["price", "stock_quantity"] and value <= 0:
                    product_errors.append(f"Field {field} must be greater than 0")
                elif field == "hand_size" and value not in ["small", "medium", "large"]:
                    product_errors.append("hand_size must be one of: small, medium, large")
                elif field == "grip_style" and value not in ["palm", "claw", "fingertip"]:
                    product_errors.append("grip_style must be one of: palm, claw, fingertip")

            # Validate specs fields
            required_specs_fields = {
                "dpi": int,
                "weight_g": (int, float),
                "length_mm": (int, float),
                "width_mm": (int, float),
                "height_mm": (int, float),
                "sensor_type": str,
                "polling_rate": int,
                "switch_type": str,
                "switch_durability": int,
                "connectivity": str,
                "battery_life": int,
                "cable_type": str,
                "rgb_lighting": bool,
                "programmable_buttons": int,
                "memory_profiles": str
            }

            specs_errors = []
            for field, expected_type in required_specs_fields.items():
                value = specs_data.get(field)
                if value is None:
                    specs_errors.append(f"Missing required field: {field}")
                elif not isinstance(value, expected_type):
                    specs_errors.append(f"Invalid type for {field}: expected {expected_type.__name__}, got {type(value).__name__}")
                elif isinstance(value, str) and not value.strip():
                    specs_errors.append(f"Field {field} cannot be empty")
                elif field in ["dpi", "polling_rate", "switch_durability", "battery_life", "programmable_buttons"] and value <= 0:
                    specs_errors.append(f"Field {field} must be greater than 0")
                elif field in ["weight_g", "length_mm", "width_mm", "height_mm"] and value <= 0:
                    specs_errors.append(f"Field {field} must be greater than 0")

            # If any validation errors occurred, return them all at once
            all_errors = product_errors + specs_errors
            if all_errors:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": "Validation failed",
                        "errors": all_errors
                    }
                )

            # Create product model
            product = ProductCreate(**product_data)
            specs = TechnicalSpec(**specs_data)

            # Insert product
            cursor.execute(
                """INSERT INTO products 
                   (name, description, price, stock_quantity, hand_size, 
                    grip_style, is_wireless, brand)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (product.name, product.description, product.price, 
                 product.stock_quantity, product.hand_size, product.grip_style,
                 product.is_wireless, product.brand)
            )
            conn.commit()
            new_product_id = cursor.lastrowid
            
            # Insert technical specs
            cursor.execute(
                """INSERT INTO technical_specs
                   (product_id, dpi, weight_g, length_mm, width_mm, height_mm,
                    sensor_type, polling_rate, switch_type, switch_durability,
                    connectivity, battery_life, cable_type, rgb_lighting,
                    programmable_buttons, memory_profiles)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                           %s, %s, %s)""",
                (new_product_id, specs.dpi, specs.weight_g, specs.length_mm,
                 specs.width_mm, specs.height_mm, specs.sensor_type,
                 specs.polling_rate, specs.switch_type, specs.switch_durability,
                 specs.connectivity, specs.battery_life, specs.cable_type,
                 specs.rgb_lighting, specs.programmable_buttons,
                 specs.memory_profiles)
            )
            conn.commit()
            
            # Fetch the newly created product with its specs
            cursor.execute(
                """SELECT p.*, t.*
                   FROM products p
                   LEFT JOIN technical_specs t ON p.product_id = t.product_id
                   WHERE p.product_id = %s""",
                (new_product_id,)
            )
            new_product = cursor.fetchone()
            return new_product

        except HTTPException:
            raise
        except Exception as e:
            conn.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        finally:
            cursor.close()
            conn.close()

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get("/", response_model=List[Product])
async def list_products(
    hand_size: Optional[str] = None,
    grip_style: Optional[str] = None,
    is_wireless: Optional[bool] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """SELECT DISTINCT p.*, t.*
               FROM products p
               LEFT JOIN technical_specs t ON p.product_id = t.product_id
               WHERE p.is_active = TRUE"""
    params = []
    
    if hand_size:
        query += " AND p.hand_size = %s"
        params.append(hand_size)
    if grip_style:
        query += " AND p.grip_style = %s"
        params.append(grip_style)
    if is_wireless is not None:
        query += " AND p.is_wireless = %s"
        params.append(is_wireless)
    if brand:
        query += " AND p.brand = %s"
        params.append(brand)
    if min_price:
        query += " AND p.price >= %s"
        params.append(min_price)
    if max_price:
        query += " AND p.price <= %s"
        params.append(max_price)
    
    cursor.execute(query, params)
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return products

@router.get("/{product_id}", response_model=ProductWithSpecs)
async def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT 
                p.*,
                t.dpi, t.weight_g, t.length_mm, t.width_mm, t.height_mm,
                t.sensor_type, t.polling_rate, t.switch_type, t.switch_durability,
                t.connectivity, t.battery_life, t.cable_type, t.rgb_lighting,
                t.programmable_buttons, t.memory_profiles
            FROM products p
            LEFT JOIN technical_specs t ON p.product_id = t.product_id
            WHERE p.product_id = %s AND p.is_active = TRUE
            """,
            (product_id,)
        )
        product = cursor.fetchone()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return product
    finally:
        cursor.close()
        conn.close()

@router.put("/{product_id}", response_model=Product)
async def update_product(
   product_id: int,  
   product: ProductCreate,
   specs: TechnicalSpec,
   current_user: User = Depends(get_current_user)
):
   if current_user["role"] != "admin":
       raise HTTPException(status_code=403, detail="Not authorized")

   conn = get_db_connection()
   cursor = conn.cursor(dictionary=True)
   
   try:
       # Check if product exists
       cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
       if not cursor.fetchone():
           raise HTTPException(status_code=404, detail="Product not found")

       # Update product
       cursor.execute(
           """UPDATE products 
           SET name=%s, description=%s, price=%s, stock_quantity=%s,
           hand_size=%s, grip_style=%s, is_wireless=%s, brand=%s,
           updated_at=CURRENT_TIMESTAMP 
           WHERE product_id=%s""",
           (product.name, product.description, product.price,
           product.stock_quantity, product.hand_size, product.grip_style,
           product.is_wireless, product.brand, product_id)
       )

       # Update technical specs - Sửa thành UPDATE thay vì INSERT
       cursor.execute(
           """UPDATE technical_specs
           SET dpi=%s, weight_g=%s, length_mm=%s, width_mm=%s,
           height_mm=%s, sensor_type=%s, polling_rate=%s,
           switch_type=%s, switch_durability=%s, connectivity=%s,
           battery_life=%s, cable_type=%s, rgb_lighting=%s,
           programmable_buttons=%s, memory_profiles=%s
           WHERE product_id=%s""",
           (specs.dpi, specs.weight_g, specs.length_mm,
           specs.width_mm, specs.height_mm, specs.sensor_type,
           specs.polling_rate, specs.switch_type, specs.switch_durability,
           specs.connectivity, specs.battery_life, specs.cable_type,
           specs.rgb_lighting, specs.programmable_buttons,
           specs.memory_profiles, product_id)
       )

       conn.commit()

       # Get updated product
       cursor.execute(
           """SELECT p.*, t.*
           FROM products p
           LEFT JOIN technical_specs t ON p.product_id = t.product_id
           WHERE p.product_id = %s""",
           (product_id,)
       )
       updated_product = cursor.fetchone()

       if not updated_product:
           raise HTTPException(status_code=404, detail="Updated product not found")

       return updated_product

   except Exception as e:
       conn.rollback()
       raise HTTPException(
           status_code=400,
           detail=f"Error updating product: {str(e)}"
       )
   finally:
       cursor.close()
       conn.close()