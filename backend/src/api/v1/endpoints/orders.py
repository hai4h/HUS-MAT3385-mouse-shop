from fastapi import APIRouter, Depends, HTTPException
from typing import List
from src.core.security import get_current_user
from src.db.database import get_db_connection
from src.models.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate, OrderStatusUpdateSchema

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
        
        # Initialize promotion and coupon variables
        promotion_id = None
        promotion_discount = 0
        coupon_id = None 
        coupon_discount = 0
        total_amount = 0
        
        # Check if all products are in stock and calculate initial total
        for item in order.items:
            cursor.execute(
                "SELECT stock_quantity, price, product_id FROM products WHERE product_id = %s",
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
            
            # Calculate item subtotal
            item_subtotal = float(product['price']) * item.quantity
            total_amount += item_subtotal

            # Check for active promotions
            cursor.execute("""
                SELECT p.* FROM promotions p
                JOIN product_promotions pp ON p.promotion_id = pp.promotion_id
                WHERE pp.product_id = %s
                AND p.is_active = 1
                AND p.start_date <= NOW()
                AND p.end_date >= NOW()
                ORDER BY p.discount_value DESC
                LIMIT 1
            """, (product['product_id'],))
            
            promotion = cursor.fetchone()
            if promotion:
                # Calculate promotion discount
                if promotion['discount_type'] == 'percentage':
                    item_discount = item_subtotal * (float(promotion['discount_value']) / 100)
                else:
                    item_discount = float(promotion['discount_value']) * item.quantity

                # Apply max discount limit if exists
                if promotion['max_discount_amount']:
                    item_discount = min(item_discount, float(promotion['max_discount_amount']))

                promotion_discount += item_discount
                promotion_id = promotion['promotion_id']

        # Apply coupon if provided
        if order.coupon_id:
            cursor.execute(
                """SELECT * FROM coupons 
                   WHERE coupon_id = %s 
                   AND is_active = 1
                   AND start_date <= NOW()
                   AND end_date >= NOW()""",
                (order.coupon_id,)
            )
            coupon = cursor.fetchone()
            
            if coupon:
                # Check usage limits
                cursor.execute(
                    """SELECT COUNT(*) as use_count 
                       FROM coupon_usage_history 
                       WHERE coupon_id = %s AND user_id = %s""",
                    (coupon['coupon_id'], current_user["user_id"])
                )
                usage = cursor.fetchone()
                
                if usage['use_count'] < coupon['user_usage_limit']:
                    # Calculate coupon discount
                    if coupon['discount_type'] == 'percentage':
                        coupon_discount = (total_amount - promotion_discount) * (float(coupon['discount_value']) / 100)
                    else:
                        coupon_discount = float(coupon['discount_value'])

                    # Apply max discount limit if exists
                    if coupon['max_discount_amount']:
                        coupon_discount = min(coupon_discount, float(coupon['max_discount_amount']))

                    coupon_id = coupon['coupon_id']

        # Calculate final total
        final_total = total_amount - promotion_discount - coupon_discount
        
        # Create order with promotion and coupon details
        cursor.execute(
            """INSERT INTO orders 
               (user_id, total_amount, status, shipping_address, note,
                promotion_id, discount_amount, coupon_id, coupon_discount)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (current_user["user_id"], final_total, "pending", order.shipping_address, order.note,
             promotion_id, promotion_discount, coupon_id, coupon_discount)
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

        # Record coupon usage if applied
        if coupon_id:
            cursor.execute(
                """INSERT INTO coupon_usage_history 
                   (coupon_id, user_id, order_id, discount_amount)
                   VALUES (%s, %s, %s, %s)""",
                (coupon_id, current_user["user_id"], order_id, coupon_discount)
            )
            
            # Update coupon used count
            cursor.execute(
                """UPDATE coupons 
                   SET used_count = used_count + 1 
                   WHERE coupon_id = %s""",
                (coupon_id,)
            )

        # Update promotion usage if applied
        if promotion_id:
            cursor.execute(
                """UPDATE promotions 
                   SET used_count = used_count + 1 
                   WHERE promotion_id = %s""",
                (promotion_id,)
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
    """Get all orders for current user or all orders if admin"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        if current_user["role"] == "admin":
            # Admin gets all orders
            cursor.execute(
                """SELECT o.*, GROUP_CONCAT(p.name) as products 
                   FROM orders o
                   JOIN order_details od ON o.order_id = od.order_id
                   JOIN products p ON od.product_id = p.product_id
                   GROUP BY o.order_id
                   ORDER BY o.order_date DESC"""
            )
        else:
            # Regular users get only their orders
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
            """SELECT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.shipping_address,
                o.note,
                o.order_date,
                o.updated_at,
                o.promotion_id,
                o.discount_amount,
                o.coupon_id,
                o.coupon_discount,
                GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.order_id = %s AND o.user_id = %s
               GROUP BY 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.shipping_address,
                o.note,
                o.order_date,
                o.updated_at,
                o.promotion_id,
                o.discount_amount,
                o.coupon_id,
                o.coupon_discount""",
            (order_id, current_user["user_id"])
        )
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return order
    finally:
        cursor.close()
        conn.close()

@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    current_user = Depends(get_current_user)
):
    """Cancel a pending order"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start transaction
        conn.start_transaction()
        
        # First, check if order exists and belongs to current user
        cursor.execute(
            """SELECT * FROM orders 
               WHERE order_id = %s AND user_id = %s AND status = 'pending'""",
            (order_id, current_user["user_id"])
        )
        order = cursor.fetchone()
        
        # If no order found, raise 404
        if not order:
            raise HTTPException(
                status_code=404, 
                detail="No pending order found with this ID"
            )
        
        # Update order status to cancelled
        cursor.execute(
            """UPDATE orders 
               SET status = 'cancelled' 
               WHERE order_id = %s""",
            (order_id,)
        )
        
        # Restore product quantities
        cursor.execute(
            """UPDATE products p
               JOIN order_details od ON p.product_id = od.product_id
               SET p.stock_quantity = p.stock_quantity + od.quantity
               WHERE od.order_id = %s""",
            (order_id,)
        )
        
        # Revert coupon usage if applicable
        cursor.execute(
            """SELECT coupon_id FROM orders 
               WHERE order_id = %s AND coupon_id IS NOT NULL""",
            (order_id,)
        )
        coupon = cursor.fetchone()
        
        if coupon and coupon['coupon_id']:
            # Decrement coupon used count
            cursor.execute(
                """UPDATE coupons 
                   SET used_count = used_count - 1 
                   WHERE coupon_id = %s""",
                (coupon['coupon_id'],)
            )
            
            # Remove coupon usage history
            cursor.execute(
                """DELETE FROM coupon_usage_history 
                   WHERE order_id = %s""",
                (order_id,)
            )
        
        # Commit the transaction
        conn.commit()
        
        # Fetch and return the updated order
        cursor.execute(
            """SELECT o.*, GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.order_id = %s
               GROUP BY o.order_id""",
            (order_id,)
        )
        updated_order = cursor.fetchone()
        
        return updated_order
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/details/{order_id}", response_model=List[dict]) 
async def get_order_details_by_order(
    order_id: int,
    current_user = Depends(get_current_user)
):
    """Get order details including product IDs for a specific order"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # First verify order belongs to user
        cursor.execute(
            """SELECT user_id FROM orders WHERE order_id = %s""", 
            (order_id,)
        )
        order = cursor.fetchone()
        
        if not order or order['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=404, detail="Order not found")
            
        # Get order details with product info
        cursor.execute(
            """SELECT od.*, p.name as product_name 
               FROM order_details od
               JOIN products p ON od.product_id = p.product_id
               WHERE od.order_id = %s""",
            (order_id,)
        )
        details = cursor.fetchall()
        
        return details
    finally:
        cursor.close()
        conn.close()

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int, 
    status_update: OrderStatusUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    """Update order status (admin only)"""
    # Validate that only admin can update status
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Only administrators can update order status"
        )

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Start transaction
        conn.start_transaction()
        
        # First, check if order exists
        cursor.execute(
            "SELECT * FROM orders WHERE order_id = %s", 
            (order_id,)
        )
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(
                status_code=404, 
                detail="Order not found"
            )

        # Update order status
        cursor.execute(
            """UPDATE orders 
               SET status = %s, 
                   updated_at = CURRENT_TIMESTAMP 
               WHERE order_id = %s""",
            (status_update.status, order_id)
        )

        # Special handling for cancelled orders
        if status_update.status == 'cancelled':
            # Restore product stock
            cursor.execute(
                """UPDATE products p
                   JOIN order_details od ON p.product_id = od.product_id
                   SET p.stock_quantity = p.stock_quantity + od.quantity
                   WHERE od.order_id = %s""",
                (order_id,)
            )

            # Remove any coupon usage if applicable
            cursor.execute(
                """DELETE FROM coupon_usage_history 
                   WHERE order_id = %s""",
                (order_id,)
            )

        # Commit the transaction
        conn.commit()
        
        # Fetch updated order details
        cursor.execute(
            """SELECT o.*, GROUP_CONCAT(p.name) as products
               FROM orders o
               JOIN order_details od ON o.order_id = od.order_id
               JOIN products p ON od.product_id = p.product_id
               WHERE o.order_id = %s
               GROUP BY o.order_id""",
            (order_id,)
        )
        updated_order = cursor.fetchone()
        
        return updated_order
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()