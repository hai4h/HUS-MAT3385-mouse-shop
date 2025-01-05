from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.image import ImageCreate, ImageResponse, ProductImages

router = APIRouter()

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

        # Save file and get URL (implement your file storage logic here)
        # For example, save to local storage or cloud storage
        file_url = f"/images/products/{product_id}/{file.filename}"  # Example URL
        
        # Insert image record
        cursor.execute(
            """INSERT INTO product_images 
               (product_id, image_url, is_primary) 
               VALUES (%s, %s, %s)""",
            (product_id, file_url, is_primary)
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
        # Check if image exists
        cursor.execute(
            "SELECT * FROM product_images WHERE image_id = %s",
            (image_id,)
        )
        image = cursor.fetchone()
        
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # Delete image
        cursor.execute(
            "DELETE FROM product_images WHERE image_id = %s",
            (image_id,)
        )
        
        conn.commit()
        
        # Implement file deletion from storage here
        
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