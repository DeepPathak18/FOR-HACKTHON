import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaUserCircle, FaEnvelope, FaUserTag, FaIdBadge, FaEdit, FaSave, FaTimes, FaPhone, FaVenusMars, FaCamera } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

// Real API functions
const getProfile = async (email) => {
    try {
        console.log('🔍 Fetching profile for email:', email);
        // Temporarily use full URL to test if proxy is working
        const response = await fetch(`http://localhost:5000/api/profile/me?email=${encodeURIComponent(email)}`);
        console.log('📡 Profile API response status:', response.status);
        console.log('📡 Profile API response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('📊 Profile data received:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        throw error;
    }
};

const updateProfile = async (email, formData) => {
    try {
        console.log('🔄 Updating profile for email:', email);
        console.log('📝 Update data:', formData);
        // Temporarily use full URL to test if proxy is working
        const response = await fetch('http://localhost:5000/api/profile/me/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                ...formData
            })
        });
        
        console.log('📡 Update API response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }
        
        const result = await response.json();
        console.log('✅ Profile update successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
    }
};


const getUserEmail = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('👤 User from localStorage:', user);
    const email = user?.email;
    console.log('📧 Extracted email:', email);
    return email;
  } catch (err) {
    console.error('❌ Error parsing user from localStorage:', err);
    return null;
  }
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', phoneNumber: '', gender: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/signin');
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
        setForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          username: userData.username || '',
          phoneNumber: userData.phoneNumber || '',
          gender: userData.gender || '',
        });
        setAvatarPreview(userData.avatar || '');
        setLoading(false);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEdit = () => {
    // Reset form and avatar preview to current user state when opening modal
    setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
    });
    setAvatarPreview(user.avatar || '');
    setAvatarFile(null);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Clean up preview URL
    if (avatarFile) {
        URL.revokeObjectURL(avatarPreview);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditMode(false);
      setShowSuccessToast(true); // Show success notification
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ProfileContainer><Loader /></ProfileContainer>;
  }

  if (error && !editMode) {
    return <ProfileContainer><ErrorCard>{error}</ErrorCard></ProfileContainer>;
  }

  if (!user) {
    return <ProfileContainer><ErrorCard>Could not load user profile.</ErrorCard></ProfileContainer>;
  }

  return (
    <ProfileContainer>
      {showSuccessToast && (
        <Toast
          message="Profile updated successfully!"
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={5000}
        />
      )}
      
      <ProfileCard>
        <AvatarContainer>
            <Avatar src={user?.avatar || 'https://placehold.co/150x150/E0F7FA/01579B?text=User'} alt="Avatar" />
            <AvatarOverlay onClick={() => setEditMode(true)}>
                <FaCamera />
            </AvatarOverlay>
        </AvatarContainer>
        <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
        <UserHandle>@{user.username || 'username'}</UserHandle>
        
        <ProfileInfo>
          <InfoRow><IconWrapper><FaUserTag /></IconWrapper><div><InfoLabel>Username</InfoLabel><InfoValue>{user.username || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaIdBadge /></IconWrapper><div><InfoLabel>Full Name</InfoLabel><InfoValue>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaEnvelope /></IconWrapper><div><InfoLabel>Email</InfoLabel><InfoValue>{user.email || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaPhone /></IconWrapper><div><InfoLabel>Phone</InfoLabel><InfoValue>{user.phoneNumber || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaVenusMars /></IconWrapper><div><InfoLabel>Gender</InfoLabel><InfoValue>{user.gender || '-'}</InfoValue></div></InfoRow>
        </ProfileInfo>
        
        <ButtonGroup>
          <EditButton onClick={handleEdit}><FaEdit /> Edit Profile</EditButton>
          <LogoutButton onClick={() => { localStorage.removeItem('user'); navigate('/'); }}>
             Logout
          </LogoutButton>
        </ButtonGroup>
      </ProfileCard>

      {editMode && (
        <ModalOverlay>
            <EditModal>
                <ModalTitle>Edit Profile</ModalTitle>
                {error && <ErrorText>{error}</ErrorText>}
                <ModalForm>
                    <AvatarUploadContainer>
                        <img src={avatarPreview || 'https://placehold.co/150x150/E0F7FA/01579B?text=User'} alt="Avatar Preview" className="preview-avatar" />
                        <UploadButton onClick={() => fileInputRef.current.click()}>
                            <FaCamera /> Change Photo
                        </UploadButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </AvatarUploadContainer>
                    <ModalInput name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
                    <ModalInput name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
                    <ModalInput name="email" value={form.email} onChange={handleChange} placeholder="Email" />
                    <ModalInput name="username" value={form.username} onChange={handleChange} placeholder="Username" />
                    <ModalInput name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" />
                    <ModalSelect name="gender" value={form.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </ModalSelect>
                </ModalForm>
                <ModalActions>
                    <SaveButton onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <SmallLoader/> : <><FaSave /> Save</>}
                    </SaveButton>
                    <CancelButton onClick={handleCancel}><FaTimes /> Cancel</CancelButton>
                </ModalActions>
            </EditModal>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
};

// --- Styled Components (Blue & White Theme) ---

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%);
  padding: 20px;
  font-family: 'Inter', sans-serif;
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
`;

const ProfileCard = styled.div`
  background: #ffffff;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #01579b;
  animation: ${fadeIn} 0.5s ease-out;
  border: 1px solid #e0e0e0;
`;

const AvatarContainer = styled.div`
    position: relative;
    margin-bottom: 20px;
    cursor: pointer;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #0288d1;
  box-shadow: 0 4px 15px rgba(2, 136, 209, 0.2);
  transition: filter 0.3s ease;
`;

const AvatarOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    ${AvatarContainer}:hover & {
        opacity: 1;
    }
`;

const UserName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #01579b;
`;

const UserHandle = styled.p`
  font-size: 1rem;
  color: #0288d1;
  margin-top: 4px;
  margin-bottom: 24px;
`;

const ProfileInfo = styled.div`
  width: 100%;
  text-align: left;
  margin-bottom: 30px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.95rem;
  &:last-child { margin-bottom: 0; }
`;

const IconWrapper = styled.div`
  color: #0288d1;
  font-size: 1.2rem;
  margin-right: 15px;
  width: 25px;
  text-align: center;
`;

const InfoLabel = styled.span`
  display: block;
  color: #546e7a;
  font-size: 0.8rem;
  margin-bottom: 2px;
`;

const InfoValue = styled.span`
  display: block;
  color: #01579b;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    width: 100%;
`;

const baseButton = `
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
`;

const EditButton = styled.button`
  ${baseButton}
  background-color: #0288d1;
  color: #ffffff;
  &:hover {
    background-color: #01579b;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(2, 136, 209, 0.3);
  }
`;

const LogoutButton = styled.button`
  ${baseButton}
  background-color: transparent;
  color: #d32f2f;
  border: 1px solid #d32f2f;
  &:hover {
    background-color: #d32f2f;
    color: #fff;
  }
`;

// --- Modal Styles ---

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease;
`;

const EditModal = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ModalTitle = styled.h2`
  text-align: center;
  color: #01579b;
  margin-top: 0;
  margin-bottom: 25px;
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AvatarUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 12px;

    .preview-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #e0e0e0;
    }
`;

const UploadButton = styled.button`
    ${baseButton}
    width: auto;
    padding: 8px 16px;
    font-size: 0.9rem;
    background-color: #546e7a;
    color: white;
    &:hover {
        background-color: #37474f;
    }
`;

const baseInput = `
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #cfd8dc;
  background-color: #f8f9fa;
  color: #01579b;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  
  &::placeholder { color: #90a4ae; }
  &:focus {
      outline: none;
      border-color: #0288d1;
      box-shadow: 0 0 0 3px rgba(2, 136, 209, 0.2);
  }
`;

const ModalInput = styled.input` ${baseInput} `;
const ModalSelect = styled.select` ${baseInput} appearance: none; `;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const SaveButton = styled.button`
  ${baseButton}
  width: auto;
  min-width: 120px;
  background-color: #2e7d32;
  color: #ffffff;
  &:hover { background-color: #1b5e20; }
  &:disabled { background-color: #9e9e9e; cursor: not-allowed; }
`;

const CancelButton = styled.button`
  ${baseButton}
  width: auto;
  min-width: 120px;
  background-color: #d32f2f;
  color: #ffffff;
  &:hover { background-color: #c62828; }
`;

// --- Loader and Error Styles ---

const spin = keyframes` to { transform: rotate(360deg); } `;

const Loader = styled.div`
  border: 5px solid rgba(2, 136, 209, 0.2);
  border-top: 5px solid #0288d1;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const SmallLoader = styled(Loader)`
    width: 20px;
    height: 20px;
    border-width: 3px;
    border-top-color: #ffffff;
    border-left-color: rgba(255,255,255,0.3);
    border-bottom-color: rgba(255,255,255,0.3);
    border-right-color: rgba(255,255,255,0.3);
`;

const ErrorCard = styled(ProfileCard)`
  border-color: #d32f2f;
  color: #d32f2f;
`;

const ErrorText = styled.p`
    color: #d32f2f;
    text-align: center;
    margin: -10px 0 15px 0;
    font-size: 0.9rem;
`;

export default Profile;
