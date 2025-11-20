import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaStar, FaHeart, FaShare, FaCheck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  background: #f8fafc;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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

const CardActions = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: white;
    color: #667eea;
    transform: scale(1.1);
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

const ProductTitle = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  text-decoration: none;
  margin-bottom: 8px;
  display: block;
  line-height: 1.4;
  
  &:hover {
    color: #667eea;
  }
`;

const ProductDescription = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Price = styled.span`
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fbbf24;
  font-size: 0.9rem;
`;

const StarIcon = styled(FaStar)`
  font-size: 0.8rem;
`;

const ReviewCount = styled.span`
  color: #9ca3af;
  font-size: 0.8rem;
  margin-left: 4px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const AuthorAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorName = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const AddToCartButton = styled.button`
  width: 100%;
  background: ${props => props.added ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  min-height: 40px;
  
  &:hover {
    transform: ${props => props.added ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.added ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(102, 126, 234, 0.3)'};
  }
  
  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    position: relative;
  }
  
  .default-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: ${props => props.added ? '0' : '1'};
    transform: ${props => props.added ? 'translateX(-15px)' : 'translateX(0)'};
    position: ${props => props.added ? 'absolute' : 'relative'};
    width: 100%;
  }
  
  .success-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: ${props => props.added ? '1' : '0'};
    transform: ${props => props.added ? 'translateX(0)' : 'translateX(15px)'};
    position: ${props => props.added ? 'relative' : 'absolute'};
    width: 100%;
  }
  
  .icon {
    transition: transform 0.3s ease;
    transform: ${props => props.added ? 'scale(1.1)' : 'scale(1)'};
    flex-shrink: 0;
  }
`;

const SalesInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.8rem;
  color: #6b7280;
`;

const SalesItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SalesLabel = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SalesValue = styled.span`
  font-weight: 600;
  color: #374151;
`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Add error boundary for product data
  if (!product || !product.id) {
    return null; // Don't render if product is invalid
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    setAddedToCart(false);
    
    try {
      const result = await addToCart(
        product.id,
        1,
        'M', // Default size M
        {
          price: product.price,
          name: product.name,
          design_url: product.design_url,
          design_position: product.design_position
        }
      );
      
      // Show success animation if addToCart succeeded
      // addToCart returns { success: true } on success or throws error
      setAddedToCart(true);
      // Reset after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    // Navigate to product page
    navigate(`/product/${product.id}`);
  };

  return (
    <CardContainer onClick={handleCardClick}>
      <ImageContainer>
        <TshirtImage 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDI1MCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02Mi41IDQxLjc1SDE4Ny41VjIwOC4yNUg2Mi41VjQxLjc1WiIgZmlsbD0iI0YxRjVGOSIvPgo8cGF0aCBkPSJNNzUuNSA1MEgxMDAuNVYxOTVINzUuNVY1MFoiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTEyNSA1MEgxNzUuNVYxOTVIMTI1VjUwWiIgZmlsbD0iI0YzRjRGNiIvPgo8L3N2Zz4="
          alt="T-shirt"
        />
        {product.design_url && (
          <DesignOverlay 
            src={product.design_url?.startsWith('http') ? product.design_url : `${API_BASE_URL}${product.design_url}`}
            alt={product.name}
            style={{
              left: product.design_position?.x ? `${product.design_position.x}%` : '50%',
              top: product.design_position?.y ? `${product.design_position.y}%` : '50%',
              width: product.design_position?.width ? `${product.design_position.width}%` : '60%',
              height: product.design_position?.height ? `${product.design_position.height}%` : '60%'
            }}
          />
        )}
        <CardActions>
          <ActionButton title="Add to Wishlist">
            <FaHeart />
          </ActionButton>
          <ActionButton title="Share">
            <FaShare />
          </ActionButton>
        </CardActions>
      </ImageContainer>
      
      <CardContent>
        <ProductTitle to={`/product/${product.id}`}>
          {product.name}
        </ProductTitle>
        
        <ProductDescription>
          {product.description}
        </ProductDescription>
        
        <ProductMeta>
          <Price>${parseFloat(product.price || 0).toFixed(2)}</Price>
          <Rating>
            <StarIcon />
            <span>{product.rating || 0}</span>
            <ReviewCount>({product.review_count || 0})</ReviewCount>
          </Rating>
        </ProductMeta>
        
        <SalesInfo>
          <SalesItem>
            <SalesLabel>Sold</SalesLabel>
            <SalesValue>{product.quantity_sold || 0}</SalesValue>
          </SalesItem>
          <SalesItem>
            <SalesLabel>Revenue</SalesLabel>
            <SalesValue>${parseFloat(product.total_revenue || 0).toFixed(2)}</SalesValue>
          </SalesItem>
        </SalesInfo>
        
        <AuthorInfo as={Link} to={product.author_id ? `/designer/${product.author_id}` : '#'} onClick={(e) => e.stopPropagation()}>
          <AuthorAvatar 
            src={product.author_avatar?.startsWith('http') ? product.author_avatar : product.author_avatar ? `${API_BASE_URL}${product.author_avatar}` : `https://via.placeholder.com/24x24/667eea/ffffff?text=${product.author_name?.charAt(0) || 'A'}`} 
            alt={product.author_name} 
          />
          <AuthorName>{product.author_name || 'Unknown Designer'}</AuthorName>
        </AuthorInfo>
        
        <AddToCartButton 
          onClick={handleAddToCart} 
          disabled={isAdding} 
          added={addedToCart}
        >
          <div className="button-content">
            <div className="default-content">
              <FaShoppingCart className="icon" />
              <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
            </div>
            <div className="success-content">
              <FaCheck className="icon" />
              <span>Added!</span>
            </div>
          </div>
        </AddToCartButton>
      </CardContent>
    </CardContainer>
  );
};

export default ProductCard;