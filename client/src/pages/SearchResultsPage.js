import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const SearchContainer = styled.div`
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

const SearchHeader = styled.div`
  margin-bottom: 40px;
`;

const SearchTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SearchQuery = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0 0 24px 0;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled.span`
  font-weight: 600;
  color: #374151;
`;

const CategoryFilter = styled.select`
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ResultsSection = styled.div`
  margin-top: 40px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const ResultsCount = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
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
  background: #fef2f2;
  border-radius: 8px;
  margin: 20px 0;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const NoResultsIcon = styled.div`
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

const NoResultsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const NoResultsText = styled.p`
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const SearchSuggestions = styled.div`
  margin-top: 20px;
`;

const SuggestionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
`;

const SuggestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SuggestionItem = styled.li`
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
    color: #334155;
  }
`;

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [totalResults, setTotalResults] = useState(0);

  // Get search query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    const cat = urlParams.get('category') || '';
    
    setSearchQuery(query);
    setCategory(cat);
    
    if (query) {
      performSearch(query, cat);
    }
  }, [location.search]);

  const performSearch = async (query, cat = '', sort = 'relevance') => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.search(query, {
        category: cat,
        limit: 50
      });
      
      console.log('Search response:', response);
      
      let sortedProducts = [...(response.products || [])];
      
      // Apply sorting
      switch (sort) {
        case 'price-low':
          sortedProducts.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
          break;
        case 'price-high':
          sortedProducts.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
          break;
        case 'popularity':
          sortedProducts.sort((a, b) => b.quantity_sold - a.quantity_sold);
          break;
        case 'newest':
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        default: // relevance
          // Already sorted by relevance from backend
          break;
      }
      
      setProducts(sortedProducts);
      setTotalResults(response.total || sortedProducts.length);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search products. Please try again.');
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (category) params.set('category', category);
      
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (newCategory) params.set('category', newCategory);
      
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    performSearch(searchQuery, category, newSort);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    const params = new URLSearchParams();
    params.set('q', suggestion);
    if (category) params.set('category', category);
    
    navigate(`/search?${params.toString()}`);
  };

  const suggestions = [
    'Vintage Rock', 'Tech Geek', 'Minimalist Art', 'Nature Explorer',
    'Abstract Geometry', 'Retro Gaming', 'Urban Street', 'Ocean Waves'
  ];

  return (
    <SearchContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Products
      </BackButton>

      <SearchHeader>
        <SearchTitle>Search Results</SearchTitle>
        {searchQuery && (
          <SearchQuery>
            Showing results for: <strong>"{searchQuery}"</strong>
          </SearchQuery>
        )}
        
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search for T-shirts, designers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit">
            <FaSearch />
            Search
          </SearchButton>
        </SearchForm>

        <FilterSection>
          <FilterLabel>Filter by Category:</FilterLabel>
          <CategoryFilter value={category} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="vintage">Vintage</option>
            <option value="tech">Tech</option>
            <option value="art">Art</option>
            <option value="nature">Nature</option>
            <option value="gaming">Gaming</option>
            <option value="urban">Urban</option>
          </CategoryFilter>
        </FilterSection>
      </SearchHeader>

      {loading ? (
        <LoadingSpinner>
          <div className="spinner"></div>
        </LoadingSpinner>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : products.length === 0 && searchQuery ? (
        <NoResults>
          <NoResultsIcon>
            <FaSearch />
          </NoResultsIcon>
          <NoResultsTitle>No results found</NoResultsTitle>
          <NoResultsText>
            We couldn't find any products matching "{searchQuery}".
            Try adjusting your search terms or browse our categories.
          </NoResultsText>
          
          <SearchSuggestions>
            <SuggestionTitle>Try searching for:</SuggestionTitle>
            <SuggestionList>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem 
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionList>
          </SearchSuggestions>
        </NoResults>
      ) : (
        <ResultsSection>
          <ResultsHeader>
            <ResultsCount>
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
            </ResultsCount>
            <SortSelect value={sortBy} onChange={handleSortChange}>
              <option value="relevance">Sort by Relevance</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Sort by Newest</option>
            </SortSelect>
          </ResultsHeader>

          <ProductsGrid>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductsGrid>
        </ResultsSection>
      )}
    </SearchContainer>
  );
};

export default SearchResultsPage;