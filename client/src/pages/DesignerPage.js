import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaTshirt, FaStar, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { designersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const DesignerContainer = styled.div`
  min-height: 100vh;
`;

const BannerSection = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 40px 20px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 15px 15px;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const DesignerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const DesignerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 40px;
  margin-top: -80px;
  position: relative;
  z-index: 5;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -60px;
    gap: 20px;
  }
`;

const DesignerAvatar = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 6px solid white;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    border-width: 4px;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DesignerInfo = styled.div`
  flex: 1;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const DesignerName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const DesignerDescription = styled.p`
  font-size: 1.1rem;
  color: #6b7280;
  line-height: 1.8;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductsSection = styled.div`
  margin-top: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
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
  margin: 20px;
  text-align: center;
`;

const EmptyProducts = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const EmptyProductsIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #9ca3af;
  font-size: 2rem;
`;

const EmptyProductsText = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
`;

const DesignerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isMerchant } = useAuth();
  const [designer, setDesigner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDesigner();
  }, [id]);

  const loadDesigner = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await designersAPI.getDesigner(id);
      setDesigner(response.designer);
      setProducts(response.products || []);
    } catch (err) {
      console.error('Error loading designer:', err);
      setError(err.response?.data?.error || 'Failed to load designer information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DesignerContainer>
        <LoadingContainer>Loading designer profile...</LoadingContainer>
      </DesignerContainer>
    );
  }

  if (error || !designer) {
    return (
      <DesignerContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </BackButton>
        <ErrorMessage>{error || 'Designer not found'}</ErrorMessage>
      </DesignerContainer>
    );
  }

  // Check if current user is the owner of this designer profile
  const isOwner = user && designer && (user.id === parseInt(id) || user.role === 'admin');
  
  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + (parseInt(p.quantity_sold) || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + parseFloat(p.total_revenue || 0), 0);
  const avgRating = products.length > 0 
    ? (products.reduce((sum, p) => sum + parseFloat(p.rating || 0), 0) / products.length).toFixed(1)
    : '0.0';

  return (
    <DesignerContainer>
      <BannerSection>
        {designer.banner ? (
          <BannerImage 
            src={designer.banner.startsWith('http') ? designer.banner : `${API_BASE_URL}${designer.banner}`}
            alt={`${designer.name} banner`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        <BannerOverlay>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft />
            Back
          </BackButton>
        </BannerOverlay>
      </BannerSection>

      <DesignerContent>
        <DesignerHeader>
          <DesignerAvatar>
            <AvatarImage 
              src={designer.avatar?.startsWith('http') ? designer.avatar : designer.avatar ? `${API_BASE_URL}${designer.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(designer.name || 'Designer')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
              alt={designer.name}
            />
          </DesignerAvatar>
          <DesignerInfo>
            <DesignerName>{designer.name}</DesignerName>
            {designer.description ? (
              <DesignerDescription>{designer.description}</DesignerDescription>
            ) : (
              <DesignerDescription style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                No description available yet.
              </DesignerDescription>
            )}
          </DesignerInfo>
        </DesignerHeader>

        {isOwner && (
          <StatsSection>
            <StatCard>
              <StatValue>{totalProducts}</StatValue>
              <StatLabel>Products</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalSales}</StatValue>
              <StatLabel>Total Sales</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>${totalRevenue.toFixed(2)}</StatValue>
              <StatLabel>Total Revenue</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>
                <FaStar style={{ color: '#fbbf24', marginRight: '4px' }} />
                {avgRating}
              </StatValue>
              <StatLabel>Avg Rating</StatLabel>
            </StatCard>
          </StatsSection>
        )}
        
        {!isOwner && (
          <StatsSection>
            <StatCard>
              <StatValue>
                <FaStar style={{ color: '#fbbf24', marginRight: '4px' }} />
                {avgRating}
              </StatValue>
              <StatLabel>Avg Rating</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{totalProducts}</StatValue>
              <StatLabel>Products Available</StatLabel>
            </StatCard>
          </StatsSection>
        )}

        <ProductsSection>
          <SectionTitle>
            <FaTshirt />
            Products by {designer.name}
          </SectionTitle>
          
          {products.length === 0 ? (
            <EmptyProducts>
              <EmptyProductsIcon>
                <FaTshirt />
              </EmptyProductsIcon>
              <EmptyProductsText>
                {designer.name} hasn't published any products yet.
              </EmptyProductsText>
            </EmptyProducts>
          ) : (
            <ProductsGrid>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductsGrid>
          )}
        </ProductsSection>
      </DesignerContent>
    </DesignerContainer>
  );
};

export default DesignerPage;

