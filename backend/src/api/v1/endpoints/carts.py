from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.cart import CartItemCreate, CartItem, Cart

router = APIRouter()

@router.post("/add-to-cart", response_model=CartItem)
async def add_to_cart(
    cart_item: CartItemCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if product exists and has enough stock
        cursor.execute(
            "SELECT stock_quantity FROM products WHERE product_id = %s",
            (cart_item.product_id,)
        )
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product['stock_quantity'] < cart_item.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock")

        # Get or create cart for user
        cursor.execute(
            "SELECT cart_id FROM carts WHERE user_id = %s",
            (current_user['user_id'],)
        )
        cart = cursor.fetchone()
        
        if not cart:
            cursor.execute(
                "INSERT INTO carts (user_id) VALUES (%s)",
                (current_user['user_id'],)
            )
            conn.commit()
            cart_id = cursor.lastrowid
        else:
            cart_id = cart['cart_id']

        # Check if product already exists in cart
        cursor.execute(
            """SELECT cart_item_id, quantity 
               FROM cart_items 
               WHERE cart_id = %s AND product_id = %s""",
            (cart_id, cart_item.product_id)
        )
        existing_item = cursor.fetchone()

        if existing_item:
            # Update quantity if product already in cart
            new_quantity = existing_item['quantity'] + cart_item.quantity
            cursor.execute(
                """UPDATE cart_items 
                   SET quantity = %s 
                   WHERE cart_item_id = %s""",
                (new_quantity, existing_item['cart_item_id'])
            )
        else:
            # Add new item to cart
            cursor.execute(
                """INSERT INTO cart_items (cart_id, product_id, quantity)
                   VALUES (%s, %s, %s)""",
                (cart_id, cart_item.product_id, cart_item.quantity)
            )

        conn.commit()

        # Get updated cart item
        cursor.execute(
            """SELECT ci.*, p.name, p.price
               FROM cart_items ci
               JOIN products p ON ci.product_id = p.product_id
               WHERE ci.cart_id = %s AND ci.product_id = %s""",
            (cart_id, cart_item.product_id)
        )
        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()

@router.get("/cart", response_model=Cart)
async def get_cart(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get user's cart
        cursor.execute(
            "SELECT cart_id FROM carts WHERE user_id = %s",
            (current_user['user_id'],)
        )
        cart = cursor.fetchone()
        
        if not cart:
            return {"items": [], "total": 0}

        # Get cart items with product details
        cursor.execute(
            """SELECT ci.*, p.name, p.price
               FROM cart_items ci
               JOIN products p ON ci.product_id = p.product_id
               WHERE ci.cart_id = %s""",
            (cart['cart_id'],)
        )
        items = cursor.fetchall()
        
        # Calculate total
        total = sum(item['price'] * item['quantity'] for item in items)
        
        return {"items": items, "total": total}

    finally:
        cursor.close()
        conn.close()

@router.delete("/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify item belongs to user's cart
        cursor.execute(
            """SELECT ci.cart_item_id 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id 
            WHERE ci.cart_item_id = %s 
            AND c.user_id = %s""",
            (cart_item_id, current_user['user_id'])
        )
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Cart item not found")

        cursor.execute(
            "DELETE FROM cart_items WHERE cart_item_id = %s",
            (cart_item_id,)
        )
        conn.commit()
        
        return {"message": "Item removed from cart"}

    finally:
        cursor.close()
        conn.close()

@router.put("/{cart_item_id}", response_model=CartItem)
async def update_cart_item(
    cart_item_id: int,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verify item belongs to user's cart
        cursor.execute(
            """SELECT ci.*, p.stock_quantity 
               FROM cart_items ci
               JOIN carts c ON ci.cart_id = c.cart_id
               JOIN products p ON ci.product_id = p.product_id
               WHERE ci.cart_item_id = %s AND c.user_id = %s""",
            (cart_item_id, current_user['user_id'])
        )
        cart_item = cursor.fetchone()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
            
        # Check if requested quantity is valid
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
            
        if quantity > cart_item['stock_quantity']:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # Update quantity
        cursor.execute(
            "UPDATE cart_items SET quantity = %s WHERE cart_item_id = %s",
            (quantity, cart_item_id)
        )
        conn.commit()
        
        # Get updated cart item with product details
        cursor.execute(
            """SELECT ci.*, p.name, p.price
               FROM cart_items ci
               JOIN products p ON ci.product_id = p.product_id
               WHERE ci.cart_item_id = %s""",
            (cart_item_id,)
        )
        updated_item = cursor.fetchone()
        
        return updated_item

    finally:
        cursor.close()
        conn.close()