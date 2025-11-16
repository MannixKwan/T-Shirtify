import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  padding: 8px 0;
  transition: color 0.2s ease;
  
  &:hover {
    color: #5a67d8;
  }
`;

const CartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const CartIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const CartTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CartItem = styled.div`
  display: flex;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const ItemImage = styled.div`
  width: 120px;
  height: 120px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    margin-right: 0;
  }
`;

const TshirtImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DesignOverlay = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  object-fit: contain;
  pointer-events: none;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemInfo = styled.div``;

const ItemName = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const ItemSize = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
`;

const SizeLabel = styled.span`
  color: #6b7280;
`;

const SizeSelect = styled.select`
  padding: 6px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ItemPrice = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8fafc;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  height: 36px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
`;

const SummaryLabel = styled.span`
  color: #6b7280;
  font-size: 1rem;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
  padding: 16px 0;
  border-top: 2px solid #e5e7eb;
  border-bottom: 2px solid #e5e7eb;
`;

const TotalLabel = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
`;

const TotalValue = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ContinueShoppingButton = styled(Link)`
  display: block;
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-top: 16px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8fafc;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const EmptyCartIcon = styled.div`
  width: 100px;
  height: 100px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #9ca3af;
  font-size: 2.5rem;
`;

const EmptyCartTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const EmptyCartText = styled.p`
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, getCartItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const cartItems = cart.items || [];

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleSizeChange = async (itemId, newSize) => {
    await updateCartItem(itemId, undefined, newSize);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  const subtotal = cart.subtotal || 0;
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <CartContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back to Products
        </BackButton>
        
        <EmptyCart>
          <EmptyCartIcon>
            <FaShoppingCart />
          </EmptyCartIcon>
          <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
          <EmptyCartText>
            Looks like you haven't added any items to your cart yet.
          </EmptyCartText>
          <ContinueShoppingButton to="/">
            Start Shopping
          </ContinueShoppingButton>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Products
      </BackButton>

      <CartHeader>
        <CartIcon>
          <FaShoppingCart />
        </CartIcon>
        <CartTitle>Shopping Cart ({getCartItemCount()} items)</CartTitle>
      </CartHeader>

      <CartContent>
        <CartItems>
          {cartItems.map((item) => (
            <CartItem key={`${item.id}-${item.size}`}>
              <ItemImage>
                <TshirtImage 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCA0MEg5MFY4MEgzMFY0MFoiIGZpbGw9IiNGMUY1RjkiLz4KPHBhdGggZD0iTTM2IDQ4SDQ4VjcySDM2VjQ4WiIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNNzIgNDhIODRWNzJINzJWNDhaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                  alt="T-shirt"
                />
                {item.image && (
                  <DesignOverlay 
                    src={item.image}
                    alt={item.name}
                  />
                )}
              </ItemImage>
              
              <ItemDetails>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemSize>
                    <SizeLabel>Size:</SizeLabel>
                    <SizeSelect
                      value={item.size}
                      onChange={(e) => handleSizeChange(item.id, e.target.value)}
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </SizeSelect>
                  </ItemSize>
                  <ItemPrice>${parseFloat(item.price || 0).toFixed(2)} each</ItemPrice>
                </ItemInfo>
                
                <ItemControls>
                  <QuantityControls>
                    <QuantityButton
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </QuantityButton>
                    <QuantityInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <QuantityButton
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </QuantityButton>
                  </QuantityControls>
                  
                  <RemoveButton onClick={() => handleRemoveItem(item.id)}>
                    <FaTrash />
                    Remove
                  </RemoveButton>
                </ItemControls>
              </ItemDetails>
            </CartItem>
          ))}
        </CartItems>

        <CartSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          
          <SummaryRow>
            <SummaryLabel>Subtotal ({getCartItemCount()} items)</SummaryLabel>
            <SummaryValue>${subtotal.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Shipping</SummaryLabel>
            <SummaryValue>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </SummaryValue>
          </SummaryRow>
          
          <SummaryRow>
            <SummaryLabel>Tax</SummaryLabel>
            <SummaryValue>${tax.toFixed(2)}</SummaryValue>
          </SummaryRow>
          
          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>${total.toFixed(2)}</TotalValue>
          </TotalRow>
          
          <CheckoutButton onClick={handleCheckout} disabled={cartItems.length === 0}>
            <FaCreditCard />
            Proceed to Checkout
          </CheckoutButton>
          
          <ContinueShoppingButton to="/">
            Continue Shopping
          </ContinueShoppingButton>
        </CartSummary>
      </CartContent>
    </CartContainer>
  );
};

export default CartPage;