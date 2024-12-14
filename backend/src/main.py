from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
import os

# Import schemas, database
from .schemas import TechnicalSpec, User, UserCreate, Product, ProductCreate, Token, TokenData
from .database import get_db_connection
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Main app
        "http://localhost:3001"   # Admin app
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Attempting to verify token:", token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print("Decoded token payload:", payload)
        if username is None:
            raise credentials_exception
    except JWTError as e:
        print("JWT Error:", str(e))
        raise credentials_exception
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
async def root():
    return {"message": "Nhin cai cho j"}

# Authentication endpoints
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (form_data.username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={
        "sub": user["username"],
        "user_id": user["user_id"],
        "role": user["role"]
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "username": user["username"],
        "role": user["role"]
    }

# User endpoints
@app.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if email or username exists
    cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", 
                  (user.email, user.username))
    if cursor.fetchone():
        raise HTTPException(status_code=400, 
                          detail="Email or username already registered")
    
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        """INSERT INTO users 
           (username, email, password_hash, full_name, role) 
           VALUES (%s, %s, %s, %s, %s)""",
        (user.username, user.email, hashed_password, user.full_name, "user")
    )
    conn.commit()
    
    new_user_id = cursor.lastrowid
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (new_user_id,))
    new_user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return new_user

@app.get("/users/", response_model=List[User])
async def list_users(current_user: User = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()
    return users

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int, current_user: User = Depends(get_current_user)):
    # In ra để debug
    print(f"Request for user_id: {user_id}")
    print(f"Current user: {current_user}")

    if current_user["role"] != "admin" and current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Product endpoints
@app.post("/products/", response_model=Product)
async def create_product(
   request: Request,
   current_user: User = Depends(get_current_user)
):
   if current_user["role"] != "admin":
       raise HTTPException(status_code=403, detail="Not authorized")
   
   # Lấy body của request
   body = await request.json()
   
   # Validate product data
   product_data = body.get("product", {})
   required_product_fields = ["name", "description", "price", "stock_quantity", 
                            "hand_size", "grip_style", "is_wireless", "brand"]
   
   missing_product_fields = [field for field in required_product_fields 
                           if field not in product_data or product_data[field] is None]
   
   if missing_product_fields:
       raise HTTPException(
           status_code=400,
           detail={
               "error": "Missing required product fields",
               "missing_fields": missing_product_fields
           }
       )
       
   # Validate specs data
   specs_data = body.get("specs", {})
   required_specs_fields = ["dpi", "weight_g", "length_mm", "width_mm", "height_mm",
                          "sensor_type", "polling_rate", "switch_type", 
                          "switch_durability", "connectivity", "battery_life",
                          "cable_type", "rgb_lighting", "programmable_buttons",
                          "memory_profiles"]
                          
   missing_specs_fields = [field for field in required_specs_fields 
                         if field not in specs_data or specs_data[field] is None]
   
   if missing_specs_fields:
       raise HTTPException(
           status_code=400,
           detail={
               "error": "Missing required technical specification fields",
               "missing_fields": missing_specs_fields
           }
       )

   # Create product model
   product = ProductCreate(**product_data)
   specs = TechnicalSpec(**specs_data)
   
   conn = get_db_connection()
   cursor = conn.cursor(dictionary=True)
   
   try:
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
       
       cursor.execute(
           """SELECT p.*, t.*
              FROM products p
              LEFT JOIN technical_specs t ON p.product_id = t.product_id
              WHERE p.product_id = %s""",
           (new_product_id,)
       )
       new_product = cursor.fetchone()
       return new_product

   finally:
       cursor.close()
       conn.close()

@app.get("/products/", response_model=List[Product])
async def list_products(
    hand_size: Optional[str] = None,
    grip_style: Optional[str] = None,
    is_wireless: Optional[bool] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = """SELECT p.*, t.*
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

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        """SELECT p.*, t.*
           FROM products p
           LEFT JOIN technical_specs t ON p.product_id = t.product_id
           WHERE p.product_id = %s AND p.is_active = TRUE""",
        (product_id,)
    )
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_id}", response_model=Product)
async def update_product(
   product_id: int,  
   product: ProductCreate,
   specs: TechnicalSpec,
   current_user: User = Depends(get_current_user)
):
   if current_user["role"] != "admin":
       raise HTTPException(status_code=403, detail="Not authorized")

   # Validate product data
   if not all([
       product.name, product.description, product.price > 0,
       product.stock_quantity > 0, product.hand_size,
       product.grip_style, isinstance(product.is_wireless, bool),
       product.brand
   ]):
       raise HTTPException(
           status_code=400,
           detail="All product fields must be provided with valid values"
       )

   # Validate technical specs
   if not all([
       specs.dpi > 0, specs.weight_g > 0,
       specs.length_mm > 0, specs.width_mm > 0,
       specs.height_mm > 0, specs.sensor_type,
       specs.polling_rate > 0, specs.switch_type,
       specs.switch_durability > 0, specs.connectivity,
       specs.battery_life >= 0, specs.cable_type,
       isinstance(specs.rgb_lighting, bool),
       specs.programmable_buttons >= 0, specs.memory_profiles
   ]):
       raise HTTPException(
           status_code=400,
           detail="All technical specification fields must be provided with valid values"
       )
   
   conn = get_db_connection()
   cursor = conn.cursor(dictionary=True)
   
   try:
       # Check product exists - Make sure to fetch the result
       cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
       result = cursor.fetchone()  # Important: fetch the result
       if not result:
           raise HTTPException(status_code=404, detail="Product not found")

       # Check duplicate name - Make sure to fetch the result
       cursor.execute("SELECT product_id FROM products WHERE name = %s AND product_id != %s", 
                     (product.name, product_id))
       if cursor.fetchone():  # Important: fetch the result
           raise HTTPException(status_code=400, detail="Product name already exists")

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

       # Update technical specs
       cursor.execute(
           """INSERT INTO technical_specs
           (product_id, dpi, weight_g, length_mm, width_mm, height_mm,
           sensor_type, polling_rate, switch_type, switch_durability,
           connectivity, battery_life, cable_type, rgb_lighting,
           programmable_buttons, memory_profiles)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
           %s, %s, %s)
           ON DUPLICATE KEY UPDATE
           dpi=VALUES(dpi), weight_g=VALUES(weight_g),
           length_mm=VALUES(length_mm), width_mm=VALUES(width_mm),
           height_mm=VALUES(height_mm), sensor_type=VALUES(sensor_type),
           polling_rate=VALUES(polling_rate),
           switch_type=VALUES(switch_type),
           switch_durability=VALUES(switch_durability),
           connectivity=VALUES(connectivity),
           battery_life=VALUES(battery_life),
           cable_type=VALUES(cable_type),
           rgb_lighting=VALUES(rgb_lighting),
           programmable_buttons=VALUES(programmable_buttons),
           memory_profiles=VALUES(memory_profiles)""",
           (product_id, specs.dpi, specs.weight_g, specs.length_mm,
           specs.width_mm, specs.height_mm, specs.sensor_type,
           specs.polling_rate, specs.switch_type, specs.switch_durability,
           specs.connectivity, specs.battery_life, specs.cable_type,
           specs.rgb_lighting, specs.programmable_buttons,
           specs.memory_profiles)
       )

       conn.commit()

       # Get updated product - Make sure to fetch the result
       cursor.execute(
           """SELECT p.*, t.*
           FROM products p
           LEFT JOIN technical_specs t ON p.product_id = t.product_id
           WHERE p.product_id = %s""",
           (product_id,)
       )
       updated_product = cursor.fetchall()  # Đọc tất cả kết quả
       if not updated_product:
           raise HTTPException(status_code=404, detail="Updated product not found")

       return updated_product[0]  # Trả về kết quả đầu tiên

   except Exception as e:
       conn.rollback()
       raise HTTPException(
           status_code=400,
           detail=f"Error updating product: {str(e)}"
       )
   finally:
       # Đảm bảo đọc hết kết quả trước khi đóng cursor
       while cursor.fetchone(): 
           pass
       cursor.close()  
       conn.close()
       
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)