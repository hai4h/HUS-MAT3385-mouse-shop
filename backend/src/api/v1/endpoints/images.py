from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
import os
import shutil
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.image import ImageCreate, ImageResponse, ProductImages

router = APIRouter()

# Constants
UPLOAD_DIR = os.path.join("static", "products")
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file: UploadFile) -> bool:
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset file pointer
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE/1024/1024}MB"
        )
    
    return True

def save_image(file: UploadFile, product_id: int, is_primary: bool = False) -> str:
    """Save image file and return the relative path"""
    # Create product directory if it doesn't exist
    product_dir = os.path.join(UPLOAD_DIR, str(product_id))
    os.makedirs(product_dir, exist_ok=True)
    
    # Generate filename
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"main{ext}" if is_primary else f"thumb_{file.filename}"
    file_path = os.path.join(product_dir, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return os.path.join("/static/products", str(product_id), filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

@router.get("/product/{product_id}", response_model=ProductImages)
async def get_product_images(product_id: int):
    """Get all images for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if product exists
        cursor.execute(
            "SELECT product_id FROM products WHERE product_id = %s",
            (product_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Get product images
        cursor.execute(
            """SELECT * FROM product_images 
               WHERE product_id = %s 
               ORDER BY is_primary DESC, image_id ASC""",
            (product_id,)
        )
        images = cursor.fetchall()
        
        # Organize images by type
        primary_image = next((img for img in images if img['is_primary']), None)
        thumbnails = [img for img in images if not img['is_primary']]
        
        return {
            "primary_image": primary_image,
            "thumbnails": thumbnails,
            "total_images": len(images)
        }
        
    finally:
        cursor.close()
        conn.close()

@router.post("/product/{product_id}", response_model=ImageResponse)
async def upload_product_image(
    product_id: int,
    is_primary: bool = False,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a new product image (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload images")
    
    # Validate image
    validate_image(file)
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if product exists
        cursor.execute(
            "SELECT product_id FROM products WHERE product_id = %s",
            (product_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
            
        # If uploading primary image, unset any existing primary image
        if is_primary:
            cursor.execute(
                """UPDATE product_images 
                   SET is_primary = FALSE 
                   WHERE product_id = %s AND is_primary = TRUE""",
                (product_id,)
            )
            
        # Save file and get URL
        image_url = save_image(file, product_id, is_primary)
        
        # Insert image record
        cursor.execute(
            """INSERT INTO product_images 
               (product_id, image_url, is_primary) 
               VALUES (%s, %s, %s)""",
            (product_id, image_url, is_primary)
        )
        
        conn.commit()
        
        # Get created image
        cursor.execute(
            "SELECT * FROM product_images WHERE image_id = LAST_INSERT_ID()"
        )
        new_image = cursor.fetchone()
        
        return new_image
        
    finally:
        cursor.close()
        conn.close()

@router.delete("/{image_id}")
async def delete_product_image(
    image_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a product image (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete images")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get image info
        cursor.execute(
            "SELECT * FROM product_images WHERE image_id = %s",
            (image_id,)
        )
        image = cursor.fetchone()
        
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # Delete file from filesystem
        file_path = os.path.join(os.getcwd(), image['image_url'].lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)
            
        # Delete database record
        cursor.execute(
            "DELETE FROM product_images WHERE image_id = %s",
            (image_id,)
        )
        
        conn.commit()
        
        return {"message": "Image deleted successfully"}
        
    finally:
        cursor.close()
        conn.close()

@router.put("/{image_id}/set-primary")
async def set_primary_image(
    image_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Set an image as primary (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can modify images")
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if image exists
        cursor.execute(
            "SELECT * FROM product_images WHERE image_id = %s",
            (image_id,)
        )
        image = cursor.fetchone()
        
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # Unset current primary image for this product
        cursor.execute(
            """UPDATE product_images 
               SET is_primary = FALSE 
               WHERE product_id = %s AND is_primary = TRUE""",
            (image['product_id'],)
        )
        
        # Set new primary image
        cursor.execute(
            "UPDATE product_images SET is_primary = TRUE WHERE image_id = %s",
            (image_id,)
        )
        
        conn.commit()
        
        return {"message": "Primary image updated successfully"}
        
    finally:
        cursor.close()
        conn.close()