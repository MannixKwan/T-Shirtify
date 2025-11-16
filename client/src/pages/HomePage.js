import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';


const HomeContainer = styled.div`
  min-height: 100vh;
`;

const Jumbotron = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const JumbotronContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
`;

const JumbotronTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const JumbotronSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const Section = styled.section`
  padding: 80px 0;
  
  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 60px;
  color: #1e293b;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 40px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const CarouselContainer = styled.div`
  position: relative;
  margin-bottom: 60px;
`;

const CarouselTitle = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: #1e293b;
`;

const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${props => props.currentIndex * -100}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
`;

const CarouselContent = styled.div`
  max-width: 600px;
`;

const CarouselSlideTitle = styled.h4`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const CarouselSlideText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 24px;
  opacity: 0.9;
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }
  
  &:first-child {
    left: 20px;
  }
  
  &:last-child {
    right: 20px;
  }
`;

const CarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
`;

const CarouselDot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#667eea' : '#e5e7eb'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#d1d5db'};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  font-size: 1.1rem;
  padding: 40px;
`;

const HomePage = () => {
  const [hotProducts, setHotProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides = [
    {
      title: "Design Your Own T-Shirt",
      text: "Create unique designs and see them come to life on high-quality t-shirts. Our design editor makes it easy to bring your ideas to reality.",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Premium Quality Materials",
      text: "We use only the finest cotton and printing techniques to ensure your t-shirts look great and last long.",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Fast Shipping Worldwide",
      text: "Get your custom t-shirts delivered to your doorstep with our reliable and fast shipping service.",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [hotResponse, recommendedResponse] = await Promise.all([
        productsAPI.getHot(),
        productsAPI.getRecommended()
      ]);
      
      console.log('Hot products response:', hotResponse);
      console.log('Recommended products response:', recommendedResponse);
      
      setHotProducts(hotResponse.products || []);
      setRecommendedProducts(recommendedResponse.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, [carouselSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  if (loading) {
    return (
      <HomeContainer>
        <Jumbotron>
          <JumbotronContent>
            <JumbotronTitle>Welcome to T-Shirtify</JumbotronTitle>
            <JumbotronSubtitle>
              Create, design, and order your perfect custom t-shirts
            </JumbotronSubtitle>
            <CTAButton to="/products">Start Shopping</CTAButton>
          </JumbotronContent>
        </Jumbotron>
        <LoadingSpinner>
          <div className="spinner"></div>
        </LoadingSpinner>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Jumbotron>
        <JumbotronContent>
          <JumbotronTitle>Welcome to T-Shirtify</JumbotronTitle>
          <JumbotronSubtitle>
            Create, design, and order your perfect custom t-shirts. 
            From unique designs to premium quality materials, we've got everything you need.
          </JumbotronSubtitle>
          <CTAButton to="/products">Start Shopping</CTAButton>
        </JumbotronContent>
      </Jumbotron>

      <Section>
        <Container>
          <CarouselContainer>
            <CarouselTitle>Why Choose T-Shirtify?</CarouselTitle>
            <CarouselWrapper>
              <CarouselTrack currentIndex={currentSlide}>
                {carouselSlides.map((slide, index) => (
                  <CarouselSlide key={index} style={{ background: slide.color }}>
                    <CarouselContent>
                      <CarouselSlideTitle>{slide.title}</CarouselSlideTitle>
                      <CarouselSlideText>{slide.text}</CarouselSlideText>
                    </CarouselContent>
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              
              <CarouselButton onClick={prevSlide}>
                <FaArrowLeft />
              </CarouselButton>
              <CarouselButton onClick={nextSlide}>
                <FaArrowRight />
              </CarouselButton>
            </CarouselWrapper>
            
            <CarouselDots>
              {carouselSlides.map((_, index) => (
                <CarouselDot
                  key={index}
                  active={index === currentSlide}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </CarouselDots>
          </CarouselContainer>
        </Container>
      </Section>

      <Section style={{ background: '#f8fafc' }}>
        <Container>
          <SectionTitle>Hot Products</SectionTitle>
          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <ProductsGrid>
              {hotProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductsGrid>
          )}
        </Container>
      </Section>

      {recommendedProducts.length > 0 && (
        <Section>
          <Container>
            <SectionTitle>Recommended for You</SectionTitle>
            {error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <ProductsGrid>
                {recommendedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductsGrid>
            )}
          </Container>
        </Section>
      )}
    </HomeContainer>
  );
};

export default HomePage; 