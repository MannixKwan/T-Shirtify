import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrderDetailContainer = styled.div`
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

const OrderHeader = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
`;

const OrderTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 16px 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const OrderInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
`;

const OrderStatusBadge = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'cancelled') return '#fee2e2';
    if (props.status === 'delivered') return '#d1fae5';
    if (props.status === 'shipped') return '#dbeafe';
    return '#fef3c7';
  }};
  color: ${props => {
    if (props.status === 'cancelled') return '#991b1b';
    if (props.status === 'delivered') return '#065f46';
    if (props.status === 'shipped') return '#1e40af';
    return '#92400e';
  }};
`;

const ProgressBarContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
`;

const ProgressBarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const ProgressSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 40px;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    height: 4px;
    background: #e5e7eb;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    z-index: 1;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
`;

const StepIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#9ca3af'};
  box-shadow: ${props => props.active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'};
  transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
`;

const StepLabel = styled.span`
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#667eea' : '#9ca3af'};
  text-align: center;
`;

const OrderContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const OrderItemsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  flex-shrink: 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ItemHeader = styled.div`
  margin-bottom: 12px;
`;

const ItemName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.9rem;
  color: #6b7280;
`;

const ItemDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ItemPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
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
  padding: 20px 0;
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

const ShippingInfo = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-top: 24px;
`;

const ShippingAddress = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
  white-space: pre-line;
  line-height: 1.8;
  color: #374151;
  font-size: 0.95rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 24px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

// Map database status to progress stages
const getOrderStage = (status) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return { stage: 'ordered', progress: 33, label: 'Ordered' };
    case 'shipped':
      return { stage: 'shipping', progress: 66, label: 'Shipping' };
    case 'delivered':
      return { stage: 'delivered', progress: 100, label: 'Delivered' };
    case 'cancelled':
      return { stage: 'cancelled', progress: 0, label: 'Cancelled' };
    default:
      return { stage: 'ordered', progress: 33, label: 'Ordered' };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getOrderDetails(id);
      setOrder(response.order);
      setItems(response.items || []);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(err.response?.data?.error || 'Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OrderDetailContainer>
        <LoadingContainer>Loading order details...</LoadingContainer>
      </OrderDetailContainer>
    );
  }

  if (error || !order) {
    return (
      <OrderDetailContainer>
        <BackButton onClick={() => navigate('/orders')}>
          <FaArrowLeft />
          Back to Orders
        </BackButton>
        <ErrorMessage>{error || 'Order not found'}</ErrorMessage>
      </OrderDetailContainer>
    );
  }

  const stage = getOrderStage(order.status);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = parseFloat(order.total_amount || 0);

  return (
    <OrderDetailContainer>
      <BackButton onClick={() => navigate('/orders')}>
        <FaArrowLeft />
        Back to Orders
      </BackButton>

      <OrderHeader>
        <OrderTitle>Order #{order.id}</OrderTitle>
        <OrderStatusBadge status={order.status}>
          {formatStatus(order.status)}
        </OrderStatusBadge>
        
        <OrderInfoGrid>
          <InfoItem>
            <InfoLabel>
              <FaCalendarAlt style={{ marginRight: '8px' }} />
              Order Date
            </InfoLabel>
            <InfoValue>{formatDate(order.created_at)}</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel>
              <FaBox style={{ marginRight: '8px' }} />
              Items
            </InfoLabel>
            <InfoValue>{items.length} item{items.length !== 1 ? 's' : ''}</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel>
              <FaCreditCard style={{ marginRight: '8px' }} />
              Payment Status
            </InfoLabel>
            <InfoValue style={{ 
              color: order.payment_status === 'paid' ? '#059669' : '#dc2626',
              textTransform: 'capitalize'
            }}>
              {order.payment_status || 'Pending'}
            </InfoValue>
          </InfoItem>
        </OrderInfoGrid>
      </OrderHeader>

      {order.status !== 'cancelled' && (
        <ProgressBarContainer>
          <ProgressBarTitle>Order Progress</ProgressBarTitle>
          <ProgressSteps progress={stage.progress}>
            <ProgressStep>
              <StepIcon active={stage.stage === 'ordered' || stage.stage === 'shipping' || stage.stage === 'delivered'}>
                <FaBox />
              </StepIcon>
              <StepLabel active={stage.stage === 'ordered' || stage.stage === 'shipping' || stage.stage === 'delivered'}>
                Ordered
              </StepLabel>
            </ProgressStep>
            <ProgressStep>
              <StepIcon active={stage.stage === 'shipping' || stage.stage === 'delivered'}>
                <FaShippingFast />
              </StepIcon>
              <StepLabel active={stage.stage === 'shipping' || stage.stage === 'delivered'}>
                Shipping
              </StepLabel>
            </ProgressStep>
            <ProgressStep>
              <StepIcon active={stage.stage === 'delivered'}>
                <FaCheckCircle />
              </StepIcon>
              <StepLabel active={stage.stage === 'delivered'}>
                Delivered
              </StepLabel>
            </ProgressStep>
          </ProgressSteps>
        </ProgressBarContainer>
      )}

      {order.status === 'cancelled' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '20px',
          background: '#fee2e2',
          borderRadius: '12px',
          color: '#991b1b',
          marginBottom: '24px'
        }}>
          <FaTimesCircle style={{ fontSize: '1.5rem' }} />
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>This order has been cancelled</span>
        </div>
      )}

      <OrderContent>
        <div>
          <OrderItemsSection>
            <SectionTitle>Order Items ({items.length})</SectionTitle>
            {items.map((item, index) => (
              <OrderItem key={index}>
                <ItemImage>
                  {item.design_url ? (
                    <img 
                      src={item.design_url.startsWith('http') ? item.design_url : `${API_BASE_URL}${item.design_url}`}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaBox style={{ color: '#9ca3af', fontSize: '2rem' }} />
                  )}
                </ItemImage>
                <ItemInfo>
                  <ItemHeader>
                    <ItemName>{item.name || 'Product'}</ItemName>
                    <ItemDetails>
                      <ItemDetail>
                        <strong>Size:</strong> {item.size}
                      </ItemDetail>
                      <ItemDetail>
                        <strong>Quantity:</strong> {item.quantity}
                      </ItemDetail>
                      <ItemDetail>
                        <strong>Price:</strong> ${parseFloat(item.price_per_unit || 0).toFixed(2)} each
                      </ItemDetail>
                    </ItemDetails>
                  </ItemHeader>
                  <ItemFooter>
                    <div></div>
                    <ItemPrice>${parseFloat(item.total_price || 0).toFixed(2)}</ItemPrice>
                  </ItemFooter>
                </ItemInfo>
              </OrderItem>
            ))}
          </OrderItemsSection>

          <ShippingInfo>
            <SectionTitle>
              <FaMapMarkerAlt style={{ marginRight: '12px' }} />
              Shipping Address
            </SectionTitle>
            <ShippingAddress>{order.shipping_address}</ShippingAddress>
          </ShippingInfo>
        </div>

        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          
          <SummaryRow>
            <SummaryLabel>Subtotal ({items.length} items)</SummaryLabel>
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

          <ActionButton to="/orders">
            View All Orders
          </ActionButton>
        </OrderSummary>
      </OrderContent>
    </OrderDetailContainer>
  );
};

export default OrderDetailPage;

