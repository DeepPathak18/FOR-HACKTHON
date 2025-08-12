import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUserCircle, FaEnvelope, FaUserTag, FaIdBadge, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { getProfile, updateProfile } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/profile'; // Change if needed


// --- MODIFICATION START ---
// The getUserId function is updated to use 'email' as a fallback.
// This is a workaround for when the user object in localStorage is missing the '_id' field.
// This will only work if your backend API can fetch a profile using an email address as the ID.
// The best long-term solution is to save the user's '_id' to localStorage during login.
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User object from localStorage:', user); // Debug log
    
    // Try to get _id, then id, and finally fall back to email.
    return user?._id || user?.id || user?.email || null;
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return null;
  }
};
// --- MODIFICATION END ---


const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', phoneNumber: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = getUserId();
  const navigate = useNavigate();

  console.log('UserId used for profile fetch:', userId); // Debug log

  useEffect(() => {
    if (!userId) {
      setError('No user ID found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getProfile(userId)
      .then(data => {
        if (!data) {
          throw new Error('No profile data returned from API.');
        }
        setUser(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          username: data.username || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Profile API error:', err); // Debug log
        setError('Failed to load profile. Please try again later.');
        setLoading(false);
      });
  }, [userId]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await updateProfile(userId, form);
      setUser(updated);
      // IMPORTANT: After updating, ensure the full user object (with _id) is saved back
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setLoading(false);
    } catch (err) {
      setError('Failed to update profile.');
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileContainer><ProfileCard>Loading...</ProfileCard></ProfileContainer>;
  }

  if (error) {
    return <ProfileContainer><ProfileCard>{error}</ProfileCard></ProfileContainer>;
  }

  if (!user) {
    return <ProfileContainer><ProfileCard>Could not load user profile.</ProfileCard></ProfileContainer>;
  }

  return (
    <ProfileContainer>
      <ProfileCard>
        <img
          src={user?.avatar || 'defaultAvatar.png'}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <UserName>{`${user.firstName} ${user.lastName}`}</UserName>
        <UserHandle>@{user.username || 'username'}</UserHandle>
        <ProfileInfo>
          <InfoRow><IconWrapper><FaUserTag /></IconWrapper><div><InfoLabel>Username</InfoLabel><InfoValue>{user.username || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaIdBadge /></IconWrapper><div><InfoLabel>Full Name</InfoLabel><InfoValue>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaEnvelope /></IconWrapper><div><InfoLabel>Email</InfoLabel><InfoValue>{user.email || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaUserCircle /></IconWrapper><div><InfoLabel>Phone</InfoLabel><InfoValue>{user.phoneNumber || '-'}</InfoValue></div></InfoRow>
          <InfoRow><IconWrapper><FaUserCircle /></IconWrapper><div><InfoLabel>Gender</InfoLabel><InfoValue>{user.gender || '-'}</InfoValue></div></InfoRow>
        </ProfileInfo>
        {!editMode && <EditButton onClick={handleEdit}><FaEdit /> Edit Profile</EditButton>}
        <LogoutButton onClick={() => { localStorage.removeItem('user'); navigate('/'); }}>
          <FaUserCircle /> Logout
        </LogoutButton>
        {editMode && (
          <EditModal>
            <ModalTitle>Edit Profile</ModalTitle>
            <ModalForm>
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
              <SaveButton onClick={handleSave}><FaSave /> Save</SaveButton>
              <CancelButton onClick={handleCancel}><FaTimes /> Cancel</CancelButton>
            </ModalActions>
          </EditModal>
        )}
      </ProfileCard>
    </ProfileContainer>
  );
};

// --- Styled Components (No changes needed here) ---
const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e133a, #3c2a6b);
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;
const ProfileCard = styled.div`
  background: #2c2250;
  padding: 40px 30px;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  width: 100%;
  max-width: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #a78bfa;
  color: #fff;
`;
// ... (The rest of your styled-components code remains the same)
const Avatar = styled.div`/* ... */`;
const UserName = styled.h1`/* ... */`;
const UserHandle = styled.p`/* ... */`;
const ProfileInfo = styled.div`/* ... */`;
const InfoRow = styled.div`/* ... */`;
const IconWrapper = styled.div`/* ... */`;
const InfoLabel = styled.span`/* ... */`;
const InfoValue = styled.span`/* ... */`;
const EditButton = styled.button`/* ... */`;
const LogoutButton = styled.button`/* ... */`;
const EditModal = styled.div`/* ... */`;
const ModalTitle = styled.h2`/* ... */`;
const ModalForm = styled.div`/* ... */`;
const ModalInput = styled.input`/* ... */`;
const ModalSelect = styled.select`/* ... */`;
const ModalActions = styled.div`/* ... */`;
const SaveButton = styled.button`/* ... */`;
const CancelButton = styled.button`/* ... */`;

export default Profile;