import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LogOut, ChevronRight, Plus, Pencil, Trash, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import Modal from './Modal';
import axios from 'axios';

interface Machine {
  id: string;
  name: string;
  groups: Group[];
}

interface Group {
  id: string;
  name: string;
  entries: Entry[];
}

interface Entry {
  id: string;
  name: string;
  filterable: boolean;
}

const DashboardContainer = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDark
    ? `linear-gradient(to bottom, #1a202c, #2d3748)`
    : `linear-gradient(to bottom, #e0f2fe, #bfdbfe)`};
  color: ${props => props.isDark ? 'white' : '#333'};
`;

const Header = styled.header<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.isDark ? '#4a5568' : '#e5e7eb'};
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ isDark: boolean }>`
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s;
  color: ${props => props.isDark ? 'white' : '#333'};

  &:hover {
    background-color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const Title = styled.h1<{ isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.isDark ? 'white' : '#333'};
`;

const MainContent = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2<{ isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.isDark ? 'white' : '#333'};
`;

const AddButton = styled(IconButton)<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? '#3b82f6' : '#2563eb'};
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.isDark ? '#2563eb' : '#1d4ed8'};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const MachineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MachineCard = styled.div<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
`;

const MachineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MachineName = styled.button<{ isDark: boolean }>`
  font-size: 1.125rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  color: ${props => props.isDark ? 'white' : '#333'};

  &:hover {
    color: #3b82f6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const GroupList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GroupCard = styled.div<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? 'rgba(45, 55, 72, 0.8)' : 'rgba(243, 244, 246, 0.8)'};
  border-radius: 0.5rem;
  padding: 1rem;
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GroupName = styled.button<{ isDark: boolean }>`
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s;
  color: ${props => props.isDark ? 'white' : '#333'};

  &:hover {
    color: #3b82f6;
  }
`;

const GroupContent = styled.div`
  margin-top: 1rem;
  padding-left: 1rem;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ToggleSwitch = styled.button<{ checked: boolean; isDark: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  transition: background-color 0.2s;
  background-color: ${props => props.checked ? '#3b82f6' : props.isDark ? '#4a5568' : '#e5e7eb'};
  cursor: pointer;
  border: none;
  padding: 0;
  margin-right: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.checked ? '1.125rem' : '0.125rem'};
    width: 1rem;
    height: 1rem;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const ModalInput = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.isDark ? '#4a5568' : '#d1d5db'};
  background-color: ${props => props.isDark ? '#2d3748' : 'white'};
  color: ${props => props.isDark ? 'white' : '#333'};
  border-radius: 0.25rem;
`;

// Add a new styled component for the right side of the header
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Update the ThemeToggle styled component
const ThemeToggle = styled(IconButton)`
  // Remove the absolute positioning
`;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [showCreateMachineModal, setShowCreateMachineModal] = useState(false);
  const [showEditMachineModal, setShowEditMachineModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newMachineName, setNewMachineName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateEntryModal, setShowCreateEntryModal] = useState(false);
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [newEntryName, setNewEntryName] = useState('');

  useEffect(() => {
    fetchMachines();
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDarkMode);
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.post('/api/admin-dashboard', { action: 'getMachines' });
      const machinesData = response.data;

      const machinesWithGroupsAndEntries = await Promise.all(machinesData.map(async (machine: Machine) => {
        const groupsResponse = await axios.post('/api/admin-dashboard', { action: 'getGroups', machineId: machine.id });
        const groups = await Promise.all(groupsResponse.data.map(async (group: Group) => {
          const entriesResponse = await axios.post('/api/admin-dashboard', { action: 'getEntries', groupId: group.id });
          return {
            ...group,
            entries: entriesResponse.data
          };
        }));
        return {
          ...machine,
          groups: groups
        };
      }));

      setMachines(machinesWithGroupsAndEntries);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleMachine = (machineId: string) => {
    setExpandedMachine(expandedMachine === machineId ? null : machineId);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleFilterable = async (machineId: string, groupId: string, entryId: string) => {
    try {
      const response = await axios.post('/api/admin-dashboard', { 
        action: 'toggleFilterable', 
        machineId, 
        groupId, 
        entryId 
      });
      setMachines(prev => prev.map(machine => {
        if (machine.id === machineId) {
          return {
            ...machine,
            groups: machine.groups.map(group => {
              if (group.id === groupId) {
                return {
                  ...group,
                  entries: group.entries.map(entry => {
                    if (entry.id === entryId) {
                      return { ...entry, filterable: response.data.filterable };
                    }
                    return entry;
                  })
                };
              }
              return group;
            })
          };
        }
        return machine;
      }));
    } catch (error) {
      console.error('Error toggling filterable:', error);
    }
  };

  const handleCreateMachine = async () => {
    if (newMachineName.trim()) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'createMachine', 
          name: newMachineName.trim() 
        });
        setMachines([...machines, response.data]);
        setNewMachineName('');
        setShowCreateMachineModal(false);
      } catch (error) {
        console.error('Error creating machine:', error);
      }
    }
  };

  const handleEditMachine = async () => {
    if (selectedMachine && newMachineName.trim()) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'updateMachine', 
          machineId: selectedMachine.id, 
          name: newMachineName.trim() 
        });
        setMachines(machines.map(machine =>
          machine.id === selectedMachine.id ? response.data : machine
        ));
        setNewMachineName('');
        setShowEditMachineModal(false);
      } catch (error) {
        console.error('Error editing machine:', error);
      }
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    try {
      await axios.post('/api/admin-dashboard', { action: 'deleteMachine', machineId });
      setMachines(machines.filter(machine => machine.id !== machineId));
    } catch (error) {
      console.error('Error deleting machine:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim() && selectedMachine) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'createGroup', 
          machineId: selectedMachine.id, 
          name: newGroupName.trim() 
        });
        setMachines(machines.map(machine =>
          machine.id === selectedMachine.id
            ? { 
                ...machine, 
                groups: Array.isArray(machine.groups) 
                  ? [...machine.groups, response.data]
                  : [response.data]
              }
            : machine
        ));
        setNewGroupName('');
        setShowCreateGroupModal(false);
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  };

  const handleEditGroup = async () => {
    if (selectedMachine && selectedGroup && newGroupName.trim()) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'updateGroup', 
          groupId: selectedGroup.id, 
          name: newGroupName.trim() 
        });
        setMachines(machines.map(machine =>
          machine.id === selectedMachine.id
            ? {
                ...machine,
                groups: machine.groups.map(group =>
                  group.id === selectedGroup.id ? response.data : group
                )
              }
            : machine
        ));
        setNewGroupName('');
        setShowEditGroupModal(false);
      } catch (error) {
        console.error('Error editing group:', error);
      }
    }
  };

  const handleDeleteGroup = async (machineId: string, groupId: string) => {
    try {
      await axios.post('/api/admin-dashboard', { action: 'deleteGroup', groupId });
      setMachines(machines.map(machine =>
        machine.id === machineId
          ? { ...machine, groups: machine.groups.filter(group => group.id !== groupId) }
          : machine
      ));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleCreateEntry = async () => {
    if (newEntryName.trim() && selectedMachine && selectedGroup) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'createEntry', 
          groupId: selectedGroup.id, 
          name: newEntryName.trim(),
          filterable: false
        });
        setMachines(machines.map(machine =>
          machine.id === selectedMachine.id
            ? {
                ...machine,
                groups: machine.groups.map(group =>
                  group.id === selectedGroup.id
                    ? { 
                        ...group, 
                        entries: Array.isArray(group.entries) 
                          ? [...group.entries, response.data]
                          : [response.data]
                      }
                    : group
                )
              }
            : machine
        ));
        setNewEntryName('');
        setShowCreateEntryModal(false);
      } catch (error) {
        console.error('Error creating entry:', error);
      }
    }
  };

  const handleEditEntry = async () => {
    if (selectedMachine && selectedGroup && selectedEntry && newEntryName.trim()) {
      try {
        const response = await axios.post('/api/admin-dashboard', { 
          action: 'updateEntry', 
          entryId: selectedEntry.id, 
          name: newEntryName.trim(),
          filterable: selectedEntry.filterable
        });
        setMachines(machines.map(machine =>
          machine.id === selectedMachine.id
            ? {
                ...machine,
                groups: machine.groups.map(group =>
                  group.id === selectedGroup.id
                    ? {
                        ...group,
                        entries: group.entries.map(entry =>
                          entry.id === selectedEntry.id ? response.data : entry
                        )
                      }
                    : group
                )
              }
            : machine
        ));
        setNewEntryName('');
        setShowEditEntryModal(false);
      } catch (error) {
        console.error('Error editing entry:', error);
      }
    }
  };

  const handleDeleteEntry = async (machineId: string, groupId: string, entryId: string) => {
    try {
      await axios.post('/api/admin-dashboard', { action: 'deleteEntry', entryId });
      setMachines(machines.map(machine =>
        machine.id === machineId
          ? {
              ...machine,
              groups: machine.groups.map(group =>
                group.id === groupId
                  ? { ...group, entries: group.entries.filter(entry => entry.id !== entryId) }
                  : group
              )
            }
          : machine
      ));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <DashboardContainer isDark={isDark}>
      <Header isDark={isDark}>
        <HeaderContent>
          <HeaderLeft>
            <Title isDark={isDark}>Admin Dashboard</Title>
          </HeaderLeft>
          <HeaderRight>
            <ThemeToggle isDark={isDark} onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </ThemeToggle>
            <IconButton isDark={isDark} onClick={() => navigate('/login')}>
              <LogOut size={20} />
            </IconButton>
          </HeaderRight>
        </HeaderContent>
      </Header>

      <MainContent>
        <SectionHeader>
          <SectionTitle isDark={isDark}>Machines</SectionTitle>
          <AddButton isDark={isDark} onClick={() => setShowCreateMachineModal(true)}>
            <Plus size={20} />
          </AddButton>
        </SectionHeader>

        <MachineList>
          {machines && machines.length > 0 ? (
            machines.map(machine => (
              <MachineCard key={machine.id} isDark={isDark}>
                <MachineHeader>
                  <MachineName isDark={isDark} onClick={() => toggleMachine(machine.id)}>
                    {machine.name}
                  </MachineName>
                  <ButtonGroup>
                    <IconButton isDark={isDark} onClick={() => toggleMachine(machine.id)}>
                      {expandedMachine === machine.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </IconButton>
                    <IconButton isDark={isDark} onClick={() => {
                      setSelectedMachine(machine);
                      setNewMachineName(machine.name);
                      setShowEditMachineModal(true);
                    }}>
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton isDark={isDark} onClick={() => handleDeleteMachine(machine.id)}>
                      <Trash size={16} />
                    </IconButton>
                    <IconButton 
                      isDark={isDark} 
                      onClick={() => {
                        setSelectedMachine(machine);
                        setShowCreateGroupModal(true);
                      }}
                    >
                      <Plus size={16} />
                    </IconButton>
                  </ButtonGroup>
                </MachineHeader>

                {expandedMachine === machine.id && (
                  <GroupList>
                    {machine.groups && machine.groups.length > 0 ? (
                      machine.groups.map(group => (
                        <GroupCard key={group.id} isDark={isDark}>
                          <GroupHeader>
                            <GroupName isDark={isDark} onClick={() => toggleGroup(group.id)}>
                              {group.name}
                            </GroupName>
                            <ButtonGroup>
                              <IconButton isDark={isDark} onClick={() => toggleGroup(group.id)}>
                                {expandedGroup.includes(group.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </IconButton>
                              <IconButton isDark={isDark} onClick={() => {
                                setSelectedMachine(machine);
                                setSelectedGroup(group);
                                setNewGroupName(group.name);
                                setShowEditGroupModal(true);
                              }}>
                                <Pencil size={16} />
                              </IconButton>
                              <IconButton isDark={isDark} onClick={() => handleDeleteGroup(machine.id, group.id)}>
                                <Trash size={16} />
                              </IconButton>
                              <IconButton isDark={isDark} onClick={() => {
                                setSelectedMachine(machine);
                                setSelectedGroup(group);
                                setShowCreateEntryModal(true);
                              }}>
                                <Plus size={16} />
                              </IconButton>
                            </ButtonGroup>
                          </GroupHeader>

                          {expandedGroup.includes(group.id) && (
                            <GroupContent>
                              {group.entries && group.entries.length > 0 ? (
                                group.entries.map(entry => (
                                  <SettingRow key={entry.id}>
                                    <span>{entry.name}</span>
                                    <ButtonGroup>
                                      <ToggleSwitch
                                        checked={entry.filterable}
                                        isDark={isDark}
                                        onClick={() => toggleFilterable(machine.id, group.id, entry.id)}
                                      />
                                      <IconButton isDark={isDark} onClick={() => {
                                        setSelectedMachine(machine);
                                        setSelectedGroup(group);
                                        setSelectedEntry(entry);
                                        setNewEntryName(entry.name);
                                        setShowEditEntryModal(true);
                                      }}>
                                        <Pencil size={16} />
                                      </IconButton>
                                      <IconButton isDark={isDark} onClick={() => handleDeleteEntry(machine.id, group.id, entry.id)}>
                                        <Trash size={16} />
                                      </IconButton>
                                    </ButtonGroup>
                                  </SettingRow>
                                ))
                              ) : (
                                <p>No entries found in this group.</p>
                              )}
                            </GroupContent>
                          )}
                        </GroupCard>
                      ))
                    ) : (
                      <p>No groups found for this machine.</p>
                    )}
                  </GroupList>
                )}
              </MachineCard>
            ))
          ) : (
            <p>No machines found.</p>
          )}
        </MachineList>
      </MainContent>

      <Modal
        isOpen={showCreateMachineModal}
        onClose={() => setShowCreateMachineModal(false)}
        title="Create New Machine"
        onSubmit={handleCreateMachine}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newMachineName}
          onChange={(e) => setNewMachineName(e.target.value)}
          placeholder="Enter machine name"
          isDark={isDark}
        />
      </Modal>

      <Modal
        isOpen={showEditMachineModal}
        onClose={() => setShowEditMachineModal(false)}
        title="Edit Machine"
        onSubmit={handleEditMachine}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newMachineName}
          onChange={(e) => setNewMachineName(e.target.value)}
          placeholder="Enter new machine name"
          isDark={isDark}
        />
      </Modal>

      <Modal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        title="Create New Group"
        onSubmit={handleCreateGroup}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter group name"
          isDark={isDark}
        />
      </Modal>

      <Modal
        isOpen={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        title="Edit Group"
        onSubmit={handleEditGroup}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter new group name"
          isDark={isDark}
        />
      </Modal>

      <Modal
        isOpen={showCreateEntryModal}
        onClose={() => setShowCreateEntryModal(false)}
        title="Create New Entry"
        onSubmit={handleCreateEntry}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newEntryName}
          onChange={(e) => setNewEntryName(e.target.value)}
          placeholder="Enter entry name"
          isDark={isDark}
        />
      </Modal>

      <Modal
        isOpen={showEditEntryModal}
        onClose={() => setShowEditEntryModal(false)}
        title="Edit Entry"
        onSubmit={handleEditEntry}
        isDark={isDark}
      >
        <ModalInput
          type="text"
          value={newEntryName}
          onChange={(e) => setNewEntryName(e.target.value)}
          placeholder="Enter new entry name"
          isDark={isDark}
        />
      </Modal>
    </DashboardContainer>
  );
};

export default AdminDashboard;