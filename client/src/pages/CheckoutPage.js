import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCreditCard, FaLock, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, authAPI } from '../services/api';

const CheckoutContainer = styled.div`
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

const CheckoutTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 40px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const CheckoutForm = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
`;

const FormSection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderSummary = styled.div`
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

const OrderItems = styled.div`
  margin-bottom: 24px;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ItemDetails = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
`;

const SummaryLabel = styled.span`
  color: #6b7280;
  font-size: 0.95rem;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
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

const PlaceOrderButton = styled.button`
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

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 12px;
  text-align: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
`;

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  // Load profile data if user is authenticated
  useEffect(() => {
    if (isAuthenticated && !profileLoaded) {
      loadProfile();
    }
  }, [isAuthenticated, profileLoaded]);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getMe();
      const profile = response.user;
      
      if (profile) {
        setShippingInfo({
          fullName: profile.name || user?.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zip_code || '',
          country: profile.country || 'United States'
        });
        setProfileLoaded(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // Don't show error, just use defaults
    }
  };

  const cartItems = cart.items || [];
  const subtotal = cart.subtotal || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || 
        !shippingInfo.zipCode) {
      setError('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Format shipping address
      const shippingAddress = `${shippingInfo.fullName}\n${shippingInfo.address}\n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}\n${shippingInfo.country}\nPhone: ${shippingInfo.phone}`;

      // Get payment method from profile or default to credit_card
      const paymentMethod = user?.payment_method || 'credit_card';
      
      // Prepare order data
      const orderData = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      };

      // If not authenticated, include cart items and customer info
      if (!isAuthenticated) {
        orderData.cart_items = cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size
        }));
        orderData.email = shippingInfo.email;
        orderData.full_name = shippingInfo.fullName;
      }

      // Create order
      const response = await ordersAPI.createOrder(orderData);
      
      // Clear cart
      await clearCart();
      
      // Redirect to order detail page
      if (response.orderId) {
        navigate(`/orders/${response.orderId}`, { 
          state: { message: 'Order placed successfully!' } 
        });
      } else {
        // Fallback to orders page if orderId is not available
        navigate('/orders', { 
          state: { message: 'Order placed successfully!' } 
        });
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <CheckoutContainer>
        <BackButton onClick={() => navigate('/cart')}>
          <FaArrowLeft />
          Back to Cart
        </BackButton>
        <CheckoutTitle>Your cart is empty</CheckoutTitle>
        <p>Please add items to your cart before checkout.</p>
      </CheckoutContainer>
    );
  }

  return (
    <CheckoutContainer>
      <BackButton onClick={() => navigate('/cart')}>
        <FaArrowLeft />
        Back to Cart
      </BackButton>

      <CheckoutTitle>Checkout</CheckoutTitle>
      
      {!isAuthenticated && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#0369a1'
        }}>
          <strong>Guest Checkout</strong> - You're checking out as a guest. 
          You can <Link to="/register" style={{ color: '#667eea', textDecoration: 'underline' }}>create an account</Link> to track your orders and save your information for faster checkout next time.
        </div>
      )}

      <CheckoutContent>
        <CheckoutForm>
          <form onSubmit={handlePlaceOrder}>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormSection>
              <SectionTitle>
                <FaUser />
                Contact Information
              </SectionTitle>
              
              <FormGroup>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Row>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <FaMapMarkerAlt />
                Shipping Address
              </SectionTitle>
              
              <FormGroup>
                <Label>Street Address *</Label>
                <TextArea
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>State *</Label>
                  <Input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup>
                  <Label>ZIP Code *</Label>
                  <Input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Row>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <FaCreditCard />
                Payment Information
              </SectionTitle>
              
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Payment processing will be integrated in the next phase. For now, orders will be created and you can complete payment later.
              </p>
              
              {isAuthenticated && (
                <p style={{ 
                  color: '#667eea', 
                  marginTop: '16px', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaUser />
                  <Link to="/profile" style={{ color: '#667eea', textDecoration: 'underline' }}>
                    Update your profile
                  </Link> to save this information for faster checkout next time.
                </p>
              )}
            </FormSection>
          </form>
        </CheckoutForm>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          
          <OrderItems>
            {cartItems.map((item) => (
              <OrderItem key={`${item.id}-${item.size}`}>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemDetails>
                    Size: {item.size} × {item.quantity}
                  </ItemDetails>
                </ItemInfo>
                <ItemPrice>
                  ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                </ItemPrice>
              </OrderItem>
            ))}
          </OrderItems>

          <SummaryRow>
            <SummaryLabel>Subtotal</SummaryLabel>
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

          <PlaceOrderButton
            onClick={handlePlaceOrder}
            disabled={loading || cartItems.length === 0}
          >
            <FaLock />
            {loading ? 'Placing Order...' : 'Place Order'}
          </PlaceOrderButton>

          <SecurityNote>
            <FaLock />
            Your payment information is secure and encrypted
          </SecurityNote>
        </OrderSummary>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

export default CheckoutPage;

