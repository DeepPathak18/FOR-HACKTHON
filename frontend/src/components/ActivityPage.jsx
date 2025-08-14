import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';

const ActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/profile/activity', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }
                const data = await response.json();
                setActivities(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) {
        return <Container><p>Loading activities...</p></Container>;
    }

    return (
        <Container>
            <Header>
                <FaBell />
                <h1>Your Activity</h1>
            </Header>
            <ActivityList>
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <ActivityItem key={activity._id}>
                            <ActivityInfo>
                                <ActivityType>{activity.activityType.replace('_', ' ')}</ActivityType>
                                <ActivityDescription>{activity.description}</ActivityDescription>
                            </ActivityInfo>
                            <ActivityTimestamp>
                                {new Date(activity.createdAt).toLocaleString()}
                            </ActivityTimestamp>
                        </ActivityItem>
                    ))
                ) : (
                    <p>No recent activity.</p>
                )}
            </ActivityList>
        </Container>
    );
};

export default ActivityPage;

const Container = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 2rem auto;
    background-color: var(--card-bg);
    color: var(--text-primary);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    transition: background-color 0.5s ease, color 0.5s ease;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
`;

const ActivityList = styled.ul`
    list-style: none;
    padding: 0;
`;

const ActivityItem = styled.li`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid transparent;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        border-color: var(--primary-blue);
    }
`;

const ActivityInfo = styled.div``;

const ActivityType = styled.h3`
    text-transform: capitalize;
    margin: 0 0 0.5rem 0;
    color: var(--accent-blue);
`;

const ActivityDescription = styled.p`
    margin: 0;
    color: var(--text-secondary);
`;

const ActivityTimestamp = styled.span`
    color: var(--text-muted);
    font-size: 0.9rem;
    white-space: nowrap;
    margin-left: 1rem;
`;
