import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt, FaCog, FaBox } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NavbarContainer = styled.nav`
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  
  &:hover {
    color: #5a67d8;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
  position: relative;
  
  @media (max-width: 768px) {
    margin: 0 20px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const CartButton = styled(NavButton)`
  font-size: 1.3rem;
  color: #667eea;
  
  &:hover {
    color: #5a67d8;
    background: #f0f4ff;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled(NavButton)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.2s ease;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #fef2f2;
  }
`;

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const cartItemCount = getCartItemCount();

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">T-Shirtify</Logo>
        
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search for T-shirts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </SearchContainer>
        
        <NavActions>
          {/* Cart icon - always visible, badge shows item count */}
          <CartButton as={Link} to="/cart" title="Shopping Cart">
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <CartBadge>{cartItemCount > 99 ? '99+' : cartItemCount}</CartBadge>
            )}
          </CartButton>
          
          {isAuthenticated ? (
            <UserMenu>
              <UserButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <FaUser />
                <span>{user?.name}</span>
              </UserButton>
              
              <DropdownMenu isOpen={isUserMenuOpen}>
                {isAdmin ? (
                  <>
                    <DropdownItem to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                      <FaCog />
                      Dashboard
                    </DropdownItem>
                    <DropdownItem to="/admin/design" onClick={() => setIsUserMenuOpen(false)}>
                      <FaCog />
                      Design Editor
                    </DropdownItem>
                    <DropdownItem to="/admin/products" onClick={() => setIsUserMenuOpen(false)}>
                      <FaCog />
                      Products
                    </DropdownItem>
                    <DropdownItem to="/admin/analytics" onClick={() => setIsUserMenuOpen(false)}>
                      <FaCog />
                      Analytics
                    </DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownItem to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                      <FaUser />
                      My Profile
                    </DropdownItem>
                    <DropdownItem to="/orders" onClick={() => setIsUserMenuOpen(false)}>
                      <FaBox />
                      My Orders
                    </DropdownItem>
                  </>
                )}
                <LogoutButton onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </LogoutButton>
              </DropdownMenu>
            </UserMenu>
          ) : (
            <NavButton as={Link} to="/login">
              <FaUser />
              <span>Login</span>
            </NavButton>
          )}
        </NavActions>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar; 