import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBox, FaShippingFast, FaCheckCircle, FaArrowLeft, FaTimesCircle, FaEye } from 'react-icons/fa';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersContainer = styled.div`
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

const OrdersHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const OrdersIcon = styled.div`
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

const OrdersTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const OrderDate = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 4px 0;
`;

const OrderTotal = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  color: #667eea;
  margin: 8px 0 0 0;
`;

const OrderStatusBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
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
  margin: 24px 0;
`;

const ProgressBarTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
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
    height: 3px;
    background: #e5e7eb;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20px;
    left: 0;
    height: 3px;
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#9ca3af'};
  box-shadow: ${props => props.active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'};
  transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
`;

const StepLabel = styled.span`
  font-size: 0.85rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#667eea' : '#9ca3af'};
  text-align: center;
`;

const OrderItems = styled.div`
  margin-top: 20px;
`;

const OrderItemsTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  background: #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.p`
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemDetails = styled.p`
  color: #6b7280;
  font-size: 0.85rem;
  margin: 0;
`;

const ItemPrice = styled.p`
  font-weight: 600;
  color: #667eea;
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const EmptyOrders = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const EmptyOrdersIcon = styled.div`
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

const EmptyOrdersTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const EmptyOrdersText = styled.p`
  color: #6b7280;
  margin: 0 0 24px 0;
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

const ViewDetailsButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  margin-top: 20px;
  
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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getUserOrders();
      const ordersList = response.orders || [];
      setOrders(ordersList);
      
      // Extract items from orders (if included in response)
      const detailsMap = {};
      ordersList.forEach(order => {
        if (order.items) {
          detailsMap[order.id] = order.items;
        }
      });
      setOrderDetails(detailsMap);
    } catch (err) {
      console.error('Error loading orders:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load orders. Please try again.';
      setError(errorMessage);
      
      // If it's an authentication error, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <OrdersContainer>
        <LoadingContainer>Loading your orders...</LoadingContainer>
      </OrdersContainer>
    );
  }

  if (error) {
    return (
      <OrdersContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Go Back
        </BackButton>
      </OrdersContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <OrdersContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back to Home
        </BackButton>
        
        <EmptyOrders>
          <EmptyOrdersIcon>
            <FaBox />
          </EmptyOrdersIcon>
          <EmptyOrdersTitle>No orders yet</EmptyOrdersTitle>
          <EmptyOrdersText>
            You haven't placed any orders yet. Start shopping to see your orders here!
          </EmptyOrdersText>
          <Link to="/" style={{ 
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'transform 0.2s ease',
          }}>
            Start Shopping
          </Link>
        </EmptyOrders>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Home
      </BackButton>

      <OrdersHeader>
        <OrdersIcon>
          <FaBox />
        </OrdersIcon>
        <OrdersTitle>My Orders ({orders.length})</OrdersTitle>
      </OrdersHeader>

      <OrdersList>
        {orders.map((order) => {
          const stage = getOrderStage(order.status);
          const items = orderDetails[order.id] || [];
          
          return (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderInfo>
                  <OrderNumber>Order #{order.id}</OrderNumber>
                  <OrderDate>Placed on {formatDate(order.created_at)}</OrderDate>
                  <OrderTotal>Total: ${parseFloat(order.total_amount || 0).toFixed(2)}</OrderTotal>
                </OrderInfo>
                <OrderStatusBadge status={order.status}>
                  {formatStatus(order.status)}
                </OrderStatusBadge>
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
                  padding: '16px',
                  background: '#fee2e2',
                  borderRadius: '8px',
                  color: '#991b1b',
                  margin: '20px 0'
                }}>
                  <FaTimesCircle />
                  <span style={{ fontWeight: '600' }}>This order has been cancelled</span>
                </div>
              )}

              {items.length > 0 && (
                <OrderItems>
                  <OrderItemsTitle>Order Items ({items.length})</OrderItemsTitle>
                  {items.map((item, index) => (
                    <OrderItem key={index}>
                      <ItemImage>
                        {item.design_url ? (
                          <img 
                            src={item.design_url.startsWith('http') ? item.design_url : `http://localhost:3001${item.design_url}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FaBox style={{ color: '#9ca3af' }} />
                        )}
                      </ItemImage>
                      <ItemInfo>
                        <ItemName>{item.name || 'Product'}</ItemName>
                        <ItemDetails>
                          Size: {item.size} • Quantity: {item.quantity}
                        </ItemDetails>
                      </ItemInfo>
                      <ItemPrice>${parseFloat(item.total_price || 0).toFixed(2)}</ItemPrice>
                    </OrderItem>
                  ))}
                </OrderItems>
              )}

              <div style={{ 
                marginTop: '20px', 
                paddingTop: '20px', 
                borderTop: '1px solid #e5e7eb',
                fontSize: '0.9rem',
                color: '#6b7280',
                marginBottom: '16px'
              }}>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </div>

              <ViewDetailsButton to={`/orders/${order.id}`}>
                <FaEye />
                View Order Details
              </ViewDetailsButton>
            </OrderCard>
          );
        })}
      </OrdersList>
    </OrdersContainer>
  );
};

export default OrdersPage;

