import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCreditCard, FaSave, FaArrowLeft, FaImage, FaEdit } from 'react-icons/fa';
import { authAPI, designersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfileContainer = styled.div`
  max-width: 900px;
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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const ProfileIcon = styled.div`
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

const ProfileTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProfileForm = styled.form`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
`;

const FormSection = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 24px 0;
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
  
  &:disabled {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
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

const SaveButton = styled.button`
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
  margin-top: 32px;
  
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

const SuccessMessage = styled.div`
  background: #d1fae5;
  color: #065f46;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 0.95rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
`;

const DesignerSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const DesignerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BannerPreview = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #9ca3af;
  width: 100%;
  height: 100%;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.95rem;
  width: fit-content;
  
  &:hover {
    background: #5a67d8;
  }
`;

const DesignerTextArea = styled(TextArea)`
  min-height: 120px;
`;

const ProfilePage = () => {
  const { user, setUser, isMerchant } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDesigner, setSavingDesigner] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [designerError, setDesignerError] = useState(null);
  const [designerSuccess, setDesignerSuccess] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    payment_method: 'credit_card'
  });
  
  const [designerData, setDesignerData] = useState({
    description: '',
    banner: null,
    bannerPreview: null
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getMe();
      const userData = response.user || {};
      
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zip_code: userData.zip_code || '',
        country: userData.country || 'United States',
        payment_method: userData.payment_method || 'credit_card'
      });
      
      // Load designer profile if merchant
      if (isMerchant && userData.id) {
        try {
          const designerResponse = await designersAPI.getDesigner(userData.id);
          const bannerUrl = designerResponse.designer.banner 
            ? (designerResponse.designer.banner.startsWith('http') 
                ? designerResponse.designer.banner 
                : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${designerResponse.designer.banner}`)
            : null;
          setDesignerData({
            description: designerResponse.designer.description || '',
            banner: null,
            bannerPreview: bannerUrl
          });
        } catch (err) {
          console.error('Error loading designer profile:', err);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear success message when user starts typing
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Update user in context
      if (response.user) {
        setUser(response.user);
      }
      
      setSuccess('Profile updated successfully! Your information will be pre-filled on checkout.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDesignerSubmit = async (e) => {
    e.preventDefault();
    if (!isMerchant || !user?.id) return;
    
    setSavingDesigner(true);
    setDesignerError(null);
    setDesignerSuccess(null);
    
    try {
      await designersAPI.updateDesignerProfile(user.id, {
        description: designerData.description
      }, designerData.banner);
      
      setDesignerSuccess('Designer profile updated successfully!');
      setDesignerData(prev => ({ ...prev, banner: null }));
      
      // Reload profile to get updated banner URL
      await loadProfile();
      
      setTimeout(() => setDesignerSuccess(null), 5000);
    } catch (err) {
      console.error('Error updating designer profile:', err);
      setDesignerError(err.response?.data?.error || 'Failed to update designer profile. Please try again.');
    } finally {
      setSavingDesigner(false);
    }
  };
  
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesignerData({
        ...designerData,
        banner: file,
        bannerPreview: URL.createObjectURL(file)
      });
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingContainer>Loading profile...</LoadingContainer>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back
      </BackButton>

      <ProfileHeader>
        <ProfileIcon>
          <FaUser />
        </ProfileIcon>
        <ProfileTitle>My Profile</ProfileTitle>
      </ProfileHeader>

      {isMerchant && (
        <DesignerSection>
          <SectionTitle>
            <FaEdit />
            Designer Profile
          </SectionTitle>
          <DesignerForm onSubmit={handleDesignerSubmit}>
            <FormGroup>
              <Label htmlFor="banner">Banner Image</Label>
              <BannerPreview>
                {designerData.bannerPreview ? (
                  <BannerImage 
                    src={designerData.bannerPreview}
                    alt="Banner preview"
                  />
                ) : (
                  <BannerPlaceholder>
                    <FaImage size={40} />
                    <span>No banner uploaded</span>
                  </BannerPlaceholder>
                )}
              </BannerPreview>
              <FileInput
                type="file"
                id="banner"
                accept="image/*"
                onChange={handleBannerChange}
              />
              <FileInputLabel htmlFor="banner">
                <FaImage /> Choose Banner Image
              </FileInputLabel>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <DesignerTextArea
                id="description"
                value={designerData.description}
                onChange={(e) => setDesignerData({ ...designerData, description: e.target.value })}
                placeholder="Tell customers about your design style, inspiration, and what makes your work unique..."
              />
            </FormGroup>
            
            {designerSuccess && <SuccessMessage>{designerSuccess}</SuccessMessage>}
            {designerError && <ErrorMessage>{designerError}</ErrorMessage>}
            
            <SaveButton type="submit" disabled={savingDesigner}>
              <FaSave />
              {savingDesigner ? 'Saving...' : 'Save Designer Profile'}
            </SaveButton>
          </DesignerForm>
        </DesignerSection>
      )}

      <ProfileForm onSubmit={handleSubmit}>
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormSection>
          <SectionTitle>
            <FaUser />
            Personal Information
          </SectionTitle>
          
          <FormGroup>
            <Label>Full Name *</Label>
            <Input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled
              title="Email cannot be changed"
            />
          </FormGroup>

          <FormGroup>
            <Label>Phone</Label>
            <Input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaMapMarkerAlt />
            Shipping Address
          </SectionTitle>
          
          <FormGroup>
            <Label>Street Address</Label>
            <TextArea
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              placeholder="123 Main Street, Apt 4B"
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>City</Label>
              <Input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleInputChange}
                placeholder="New York"
              />
            </FormGroup>

            <FormGroup>
              <Label>State</Label>
              <Input
                type="text"
                name="state"
                value={profileData.state}
                onChange={handleInputChange}
                placeholder="NY"
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>ZIP Code</Label>
              <Input
                type="text"
                name="zip_code"
                value={profileData.zip_code}
                onChange={handleInputChange}
                placeholder="10001"
              />
            </FormGroup>

            <FormGroup>
              <Label>Country</Label>
              <Input
                type="text"
                name="country"
                value={profileData.country}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Row>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaCreditCard />
            Payment Method
          </SectionTitle>
          
          <FormGroup>
            <Label>Preferred Payment Method</Label>
            <Select
              name="payment_method"
              value={profileData.payment_method}
              onChange={handleInputChange}
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </Select>
            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6b7280' }}>
              This will be pre-selected on the checkout page
            </p>
          </FormGroup>
        </FormSection>

        <SaveButton type="submit" disabled={saving}>
          <FaSave />
          {saving ? 'Saving...' : 'Save Profile'}
        </SaveButton>
      </ProfileForm>
    </ProfileContainer>
  );
};

export default ProfilePage;

