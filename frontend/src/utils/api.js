export const getProfile = async (userId) => {
  const res = await fetch(`http://localhost:5000/api/profile/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return await res.json();
};

export const updateProfile = async (userId, data) => {
  const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
};