import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  padding: 20px;
`;

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
`;

const Header = styled.h2`
  color: #4a4a4a;
  text-align: center;
  margin-bottom: 20px;
  font-size: 28px;
`;

const SectionHeader = styled.h3`
  color: #4a4a4a;
  margin-bottom: 15px;
  font-size: 22px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
`;

const Button = styled.button`
  background-color: #6e8efb;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #5c7cfa;
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  width: 100%;
`;

const ListItem = styled.li`
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
`;

const EntryList = styled.ul`
  list-style-type: none;
  padding-left: 20px;
`;

const EntryItem = styled.li`
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 5px;
`;

const UserItem = styled(ListItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface Group {
  id: number;
  name: string;
  entries: string[];
}

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
  online: boolean;
}

const MachineDetails: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newEntryName, setNewEntryName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: Date.now(),
        name: newGroupName.trim(),
        entries: [],
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
    }
  };

  const handleCreateEntry = (groupId: number) => {
    if (newEntryName.trim()) {
      setGroups(groups.map(group => 
        group.id === groupId 
          ? { ...group, entries: [...group.entries, newEntryName.trim()] }
          : group
      ));
      setNewEntryName('');
    }
  };

  const toggleGroupExpansion = (groupId: number) => {
    setSelectedGroup(selectedGroup === groupId ? null : groupId);
  };

  const handleChangeUserRole = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: user.role === 'admin' ? 'user' : 'admin' }
        : user
    ));
  };

  return (
    <DetailsContainer>
      <Card>
        <Header>Machine Details (ID: {machineId})</Header>
        <SectionHeader>Groups</SectionHeader>
        <Input
          type="text"
          value={newGroupName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        <Button onClick={handleCreateGroup}>Create Group</Button>
        <List>
          {groups.map((group) => (
            <ListItem key={group.id}>
              <div onClick={() => toggleGroupExpansion(group.id)}>
                {group.name} ({group.entries.length} entries)
              </div>
              {selectedGroup === group.id && (
                <EntryList>
                  {group.entries.map((entry, index) => (
                    <EntryItem key={index}>{entry}</EntryItem>
                  ))}
                  <li>
                    <Input
                      type="text"
                      value={newEntryName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEntryName(e.target.value)}
                      placeholder="Enter entry name"
                    />
                    <Button onClick={() => handleCreateEntry(group.id)}>Add Entry</Button>
                  </li>
                </EntryList>
              )}
            </ListItem>
          ))}
        </List>
      </Card>
      <Card>
        <SectionHeader>Users</SectionHeader>
        <List>
          {users.map((user) => (
            <UserItem key={user.id}>
              <span>{user.name} - {user.role} ({user.online ? 'Online' : 'Offline'})</span>
              <Button onClick={() => handleChangeUserRole(user.id)}>
                Change to {user.role === 'admin' ? 'User' : 'Admin'}
              </Button>
            </UserItem>
          ))}
        </List>
      </Card>
      <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
    </DetailsContainer>
  );
};

export default MachineDetails;