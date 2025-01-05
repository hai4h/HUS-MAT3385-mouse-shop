from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.order import OrderCreate, OrderResponse

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    current_user = Depends(get_current_user)
):
    """Create a new order from cart items"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start transaction
        conn.start_transaction()
        
        # Check if all products are in stock
        for item in order.items:
            cursor.execute(
                "SELECT stock_quantity, price FROM products WHERE product_id = %s",
                (item.product_id,)
            )
            product = cursor.fetchone()
            
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            if product['stock_quantity'] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for product {item.product_id}"
                )
        
        # Calculate total amount
        total_amount = 0
        for item in order.items:
            cursor.execute(
                "SELECT price FROM products WHERE product_id = %s",
                (item.product_id,)
            )
            product = cursor.fetchone()
            total_amount += float(product['price']) * item.quantity
        
        # Create order
        cursor.execute(
            """INSERT INTO orders 
               (user_id, total_amount, status, shipping_address)
               VALUES (%s, %s, %s, %s)""",
            (current_user["user_id"], total_amount, "pending", order.shipping_address)
        )
        order_id = cursor.lastrowid
        
        # Create order details and update stock
        for item in order.items:
            cursor.execute(
                "SELECT price FROM products WHERE product_id = %s",
                (item.product_id,)
            )
            product = cursor.fetchone()
            subtotal = float(product['price']) * item.quantity
            
            # Create order detail
            cursor.execute(
                """INSERT INTO order_details 
                   (order_id, product_id, quantity, unit_price, subtotal)
                   VALUES (%s, %s, %s, %s, %s)""",
                (order_id, item.product_id, item.quantity, product['price'], subtotal)
            )
            
            # Update stock quantity
            cursor.execute(
                """UPDATE products 
                   SET stock_quantity = stock_quantity - %s 
                   WHERE product_id = %s""",
                (item.quantity, item.product_id)
            )
        
        # Clear cart after successful order
        cursor.execute(
            "SELECT cart_id FROM carts WHERE user_id = %s",
            (current_user["user_id"],)
        )
        cart = cursor.fetchone()
        if cart:
            cursor.execute(
                "DELETE FROM cart_items WHERE cart_id = %s",
                (cart['cart_id'],)
            )
        
        # Commit transaction
        conn.commit()
        
        # Get complete order details
        cursor.execute(
            """SELECT o.*, GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.order_id = %s
               GROUP BY o.order_id""",
            (order_id,)
        )
        new_order = cursor.fetchone()
        
        return new_order
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(current_user = Depends(get_current_user)):
    """Get all orders for current user"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """SELECT o.*, GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.user_id = %s
               GROUP BY o.order_id
               ORDER BY o.order_date DESC""",
            (current_user["user_id"],)
        )
        orders = cursor.fetchall()
        return orders
    finally:
        cursor.close()
        conn.close()

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: int,
    current_user = Depends(get_current_user)
):
    """Get detailed information about a specific order"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """SELECT o.*, GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.order_id = %s AND o.user_id = %s""",
            (order_id, current_user["user_id"])
        )
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return order
    finally:
        cursor.close()
        conn.close()