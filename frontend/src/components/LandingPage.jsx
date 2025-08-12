import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaRocket, FaUserCircle, FaSignOutAlt, FaHome, FaInfoCircle, FaCalendarAlt, FaTrophy, FaUsers, FaCode, FaLightbulb } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserData(JSON.parse(userData));
    }
    
    // Trigger animations
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    // Show logout success message
    setTimeout(() => {
      alert('Logout successful!');
    }, 100);
  };

  const handleNavigation = (path) => {
    // Add page transition animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.95)';
    document.body.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      navigate(path);
      document.body.style.opacity = '1';
      document.body.style.transform = 'scale(1)';
    }, 300);
  };

  return (
    <Container>
      {/* Floating Particles */}
      <ParticleContainer>
        {[...Array(20)].map((_, i) => (
          <Particle key={i} delay={i * 0.1} />
        ))}
      </ParticleContainer>

      {/* Header */}
      <Header>
        <Logo>
          <LogoIcon>
            <FaRocket />
          </LogoIcon>
          <span>TECH-TONIC</span>
        </Logo>
        
        {userData && (
          <UserSection>
            <UserInfo>
              <span>Welcome, {userData.firstName || 'User'}!</span>
              <span className="email">{userData.email}</span>
            </UserInfo>
            <UserAvatar>
              {userData.profilePicture ? (
                <img src={userData.profilePicture} alt="Profile" />
              ) : (
                <FaUserCircle />
              )}
            </UserAvatar>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt />
            </LogoutButton>
          </UserSection>
        )}
      </Header>

      {/* Main Content */}
      <MainContent>
        {/* Hero Section */}
        <HeroSection $isVisible={isVisible}>
          <HeroContent>
            <HeroBadge>
              <FaRocket />
              <span>Welcome to Tech-Tonic Hackathon!</span>
            </HeroBadge>
            
            <HeroTitle>
              Transform Ideas, <GradientText>Build Future</GradientText>
            </HeroTitle>
            
            <HeroSubtitle>
              Experience the most comprehensive hackathon designed for developers who want to push boundaries and create meaningful impact.
            </HeroSubtitle>

            <StatsGrid>
              <StatCard>
                <StatNumber>8</StatNumber>
                <StatLabel>Hours</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>100+</StatNumber>
                <StatLabel>Teams</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>15K</StatNumber>
                <StatLabel>In Prizes</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>5</StatNumber>
                <StatLabel>Domains</StatLabel>
              </StatCard>
            </StatsGrid>

            <ActionButtons>
              <PrimaryButton onClick={() => handleNavigation('/signin')}>
                Get Started
              </PrimaryButton>
              <SecondaryButton onClick={() => handleNavigation('/signup')}>
                Join Now
              </SecondaryButton>
            </ActionButtons>
          </HeroContent>
        </HeroSection>

        {/* Features Section */}
        <FeaturesSection $isVisible={isVisible}>
          <SectionHeader>
            <SectionTitle>Why <GradientText>Tech-Tonic?</GradientText></SectionTitle>
            <SectionSubtitle>Discover what makes our hackathon unique</SectionSubtitle>
          </SectionHeader>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>
                <FaCode />
              </FeatureIcon>
              <FeatureTitle>Industry Focus</FeatureTitle>
              <FeatureDescription>
                Tackle challenges in AI, blockchain, sustainability, and emerging technologies.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaUsers />
              </FeatureIcon>
              <FeatureTitle>Expert Mentors</FeatureTitle>
              <FeatureDescription>
                Get guidance from industry leaders, successful entrepreneurs, and technical experts.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaTrophy />
              </FeatureIcon>
              <FeatureTitle>Real Impact</FeatureTitle>
              <FeatureDescription>
                Build solutions for real-world problems with potential for continued development.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaRocket />
              </FeatureIcon>
              <FeatureTitle>Prizes & Swags</FeatureTitle>
              <FeatureDescription>
                Compete for 15,000 INR in prizes, including cash, tech gear, and opportunities.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaUsers />
              </FeatureIcon>
              <FeatureTitle>Networking</FeatureTitle>
              <FeatureDescription>
                Connect with like-minded developers, designers, and entrepreneurs.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <FaLightbulb />
              </FeatureIcon>
              <FeatureTitle>Team Building</FeatureTitle>
              <FeatureDescription>
                Intensive coding marathon with mentorship, workshops, and unlimited coffee.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        {/* Quick Actions */}
        <QuickActionsSection $isVisible={isVisible}>
          <SectionHeader>
            <SectionTitle>Quick <GradientText>Actions</GradientText></SectionTitle>
            <SectionSubtitle>Get started with your hackathon journey</SectionSubtitle>
          </SectionHeader>
          
          <ActionsGrid>
            <ActionCard onClick={() => handleNavigation('/signin')}>
              <ActionIcon>
                <FaUserCircle />
              </ActionIcon>
              <ActionTitle>Sign In</ActionTitle>
              <ActionDescription>Access your account and dashboard</ActionDescription>
            </ActionCard>

            <ActionCard onClick={() => handleNavigation('/signup')}>
              <ActionIcon>
                <FaRocket />
              </ActionIcon>
              <ActionTitle>Register</ActionTitle>
              <ActionDescription>Create your account and join the event</ActionDescription>
            </ActionCard>

            <ActionCard onClick={() => handleNavigation('/profile')}>
              <ActionIcon>
                <FaInfoCircle />
              </ActionIcon>
              <ActionTitle>Profile</ActionTitle>
              <ActionDescription>Manage your profile and preferences</ActionDescription>
            </ActionCard>

            <ActionCard onClick={() => handleNavigation('/dashboard')}>
              <ActionIcon>
                <FaCalendarAlt />
              </ActionIcon>
              <ActionTitle>Dashboard</ActionTitle>
              <ActionDescription>View your hackathon progress</ActionDescription>
            </ActionCard>
          </ActionsGrid>
        </QuickActionsSection>
      </MainContent>
    </Container>
  );
};

export default LandingPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: #fff;
  position: relative;
  overflow-x: hidden;
`;

const ParticleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const Particle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: ${float} 6s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
  
  &:nth-child(odd) {
    left: ${props => Math.random() * 100}%;
    animation-duration: 8s;
  }
  
  &:nth-child(even) {
    right: ${props => Math.random() * 100}%;
    animation-duration: 10s;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
`;

const LogoIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  animation: ${pulse} 2s infinite ease-in-out;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
  
  .email {
    opacity: 0.7;
    font-size: 0.8rem;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const LogoutButton = styled.button`
  background: rgba(239, 68, 68,