import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaStar, FaHeart, FaShare, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';


const ProductContainer = styled.div`
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

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    height: 400px;
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

const ImageActions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProductHeader = styled.div``;

const ProductTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const Price = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
`;

const StarIcon = styled(FaStar)`
  color: #fbbf24;
`;

const ReviewCount = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
`;

const SalesInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SalesItem = styled.div`
  text-align: center;
`;

const SalesLabel = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
`;

const SalesValue = styled.div`
  font-weight: bold;
  color: #10b981;
`;

const ProductDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 20px;
`;

const DesignerSection = styled(Link)`
  display: block;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #f0f4ff;
    border-left-color: #5a67d8;
    transform: translateX(4px);
  }
`;

const DesignerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const DesignerAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const DesignerInfo = styled.div``;

const DesignerName = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
`;

const DesignerBio = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OptionGroup = styled.div``;

const OptionLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 8px;
`;

const SizeButton = styled.button`
  padding: 12px 8px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
  background: ${props => props.selected ? '#667eea' : 'white'};
  color: ${props => props.selected ? 'white' : '#374151'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: ${props => props.selected ? '#667eea' : '#f8fafc'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
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
  width: 60px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  background: ${props => props.added ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  position: relative;
  min-height: 54px;
  
  &:hover {
    transform: ${props => props.added ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.added ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 8px 25px rgba(102, 126, 234, 0.3)'};
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
    gap: 12px;
    width: 100%;
    position: relative;
  }
  
  .default-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: ${props => props.added ? '0' : '1'};
    transform: ${props => props.added ? 'translateX(-20px)' : 'translateX(0)'};
    position: ${props => props.added ? 'absolute' : 'relative'};
    width: 100%;
  }
  
  .success-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    opacity: ${props => props.added ? '1' : '0'};
    transform: ${props => props.added ? 'translateX(0)' : 'translateX(20px)'};
    position: ${props => props.added ? 'relative' : 'absolute'};
    width: 100%;
  }
  
  .icon {
    transition: transform 0.3s ease;
    transform: ${props => props.added ? 'scale(1.1)' : 'scale(1)'};
    flex-shrink: 0;
  }
`;

const SizeError = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ProductDetails = styled.div`
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #e5e7eb;
`;

const DetailsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 20px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  color: #6b7280;
`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setError(null);
        const response = await productsAPI.getById(id);
        console.log('Product API response:', response);
        if (response && response.product) {
          console.log('Product author_id:', response.product.author_id);
          setProduct(response.product);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3000);
      return;
    }

    setSizeError(false);
    setIsLoading(true);
    setAddedToCart(false);
    
    try {
      const result = await addToCart(
        product.id,
        quantity,
        selectedSize,
        {
          price: product.price,
          name: product.name,
          design_url: product.design_url,
          design_position: product.design_position
        }
      );
      
      if (result.success) {
        setAddedToCart(true);
        setCartError(null);
        // Reset after 2 seconds
        setTimeout(() => {
          setAddedToCart(false);
        }, 2000);
      } else {
        // Show error state briefly
        setCartError(result.error || 'Failed to add to cart');
        setTimeout(() => setCartError(null), 3000);
      }
    } catch (error) {
      setCartError('Failed to add to cart. Please try again.');
      setTimeout(() => setCartError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loadingProduct) {
    return (
      <ProductContainer>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Back to Products
        </BackButton>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </ProductContainer>
    );
  }

  if (error || !product) {
    return (
      <ProductContainer>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Back to Products
        </BackButton>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </ProductContainer>
    );
  }

  return (
    <ProductContainer>
      <BackButton onClick={handleBack}>
        <FaArrowLeft />
        Back to Products
      </BackButton>

      <ProductGrid>
        {/* Left Side - Image */}
        <ImageSection>
          <MainImage>
            <TshirtImage 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTY3SDM3NVYzMzNIMTI1VjE2N1oiIGZpbGw9IiNGMUY1RjkiLz4KPHBhdGggZD0iTTEzMyAxODBIMTY3VjMxMEgxMzNWMTgwWiIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMzAwIDE4MEgzMzNWMzEwSDMwMFYxODBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
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
            <ImageActions>
              <ActionButton>
                <FaHeart />
              </ActionButton>
              <ActionButton>
                <FaShare />
              </ActionButton>
            </ImageActions>
          </MainImage>
        </ImageSection>

        {/* Right Side - Product Info */}
        <InfoSection>
          <ProductHeader>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductMeta>
                <Price>${parseFloat(product.price).toFixed(2)}</Price>
              <Rating>
                <StarIcon />
                <span>{product.rating}</span>
                <ReviewCount>({product.review_count} reviews)</ReviewCount>
              </Rating>
            </ProductMeta>
            <SalesInfo>
              <SalesItem>
                <SalesLabel>Sold</SalesLabel>
                <SalesValue>{product.quantity_sold}</SalesValue>
              </SalesItem>
              <SalesItem>
                <SalesLabel>Revenue</SalesLabel>
                <SalesValue>${parseFloat(product.total_revenue || 0).toFixed(2)}</SalesValue>
              </SalesItem>
            </SalesInfo>
          </ProductHeader>

          <ProductDescription>{product.description}</ProductDescription>

            {product.author_id ? (
              <DesignerSection to={`/designer/${product.author_id}`} onClick={(e) => {
                console.log('Navigating to designer:', product.author_id);
              }}>
                <DesignerHeader>
                  <DesignerAvatar 
                    src={product.author_avatar?.startsWith('http') ? product.author_avatar : product.author_avatar ? `${API_BASE_URL}${product.author_avatar}` : `https://via.placeholder.com/60x60/667eea/ffffff?text=${product.author_name?.charAt(0) || 'A'}`} 
                    alt={product.author_name} 
                  />
                  <DesignerInfo>
                    <DesignerName>{product.author_name}</DesignerName>
                    <span style={{ fontSize: '0.85rem', color: '#667eea' }}>View Designer Profile →</span>
                  </DesignerInfo>
                </DesignerHeader>
              </DesignerSection>
            ) : (
              <DesignerSection as="div" style={{ cursor: 'default', opacity: 0.6 }}>
                <DesignerHeader>
                  <DesignerAvatar 
                    src={product.author_avatar?.startsWith('http') ? product.author_avatar : product.author_avatar ? `${API_BASE_URL}${product.author_avatar}` : `https://via.placeholder.com/60x60/667eea/ffffff?text=${product.author_name?.charAt(0) || 'A'}`} 
                    alt={product.author_name} 
                  />
                  <DesignerInfo>
                    <DesignerName>{product.author_name || 'Unknown Designer'}</DesignerName>
                  </DesignerInfo>
                </DesignerHeader>
              </DesignerSection>
            )}

          <OptionsSection>
            <OptionGroup>
              <OptionLabel>Size</OptionLabel>
              <SizeGrid>
                {(product.sizes ? (() => {
              // If sizes is already an array, return it
              if (Array.isArray(product.sizes)) {
                return product.sizes;
              }
              // If it's a string, try to parse as JSON first
              try {
                return JSON.parse(product.sizes);
              } catch (e) {
                // If JSON parsing fails, treat as comma-separated string
                return product.sizes.split(',').map(s => s.trim());
              }
            })() : ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map(size => (
                  <SizeButton
                    key={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </SizeButton>
                ))}
              </SizeGrid>
            </OptionGroup>

            <OptionGroup>
              <OptionLabel>Quantity</OptionLabel>
              <QuantitySelector>
                <QuantityButton
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </QuantityButton>
                <QuantityInput
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
                <QuantityButton
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                >
                  +
                </QuantityButton>
              </QuantitySelector>
            </OptionGroup>

            <AddToCartButton 
              onClick={handleAddToCart} 
              disabled={isLoading || (!selectedSize && !addedToCart)} 
              added={addedToCart}
            >
              <div className="button-content">
                <div className="default-content">
                  <FaShoppingCart className="icon" />
                  <span>
                    {isLoading ? 'Adding...' : `Add to Cart - $${(parseFloat(product.price || 0) * quantity).toFixed(2)}`}
                  </span>
                </div>
                <div className="success-content">
                  <FaCheck className="icon" />
                  <span>Added to Cart!</span>
                </div>
              </div>
            </AddToCartButton>
            {sizeError && (
              <SizeError>
                <FaShoppingCart />
                Please select a size before adding to cart
              </SizeError>
            )}
            {cartError && (
              <SizeError style={{ background: '#fee2e2', color: '#dc2626' }}>
                <FaShoppingCart />
                {cartError}
              </SizeError>
            )}
          </OptionsSection>
        </InfoSection>
      </ProductGrid>

      <ProductDetails>
        <DetailsTitle>Product Details</DetailsTitle>
        <DetailsGrid>
          <DetailItem>
            <DetailLabel>Material</DetailLabel>
            <DetailValue>{product.material}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Care Instructions</DetailLabel>
            <DetailValue>{product.care_instructions}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Available Colors</DetailLabel>
                <DetailValue>{product.colors ? (() => {
                  // If colors is already an array, join it
                  if (Array.isArray(product.colors)) {
                    return product.colors.join(', ');
                  }
                  // If it's a string, try to parse as JSON first
                  try {
                    return JSON.parse(product.colors).join(', ');
                  } catch (e) {
                    // If JSON parsing fails, return as is
                    return product.colors;
                  }
                })() : 'Various'}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Availability</DetailLabel>
            <DetailValue>{product.in_stock ? 'In Stock' : 'Out of Stock'}</DetailValue>
          </DetailItem>
        </DetailsGrid>
      </ProductDetails>
    </ProductContainer>
  );
};

export default ProductPage; 