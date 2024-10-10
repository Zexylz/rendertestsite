import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LogOut, ChevronRight, Plus, ChevronDown, Sun, Moon } from 'lucide-react';
import Modal from './Modal';
import axios from 'axios';

// Styled components
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

const Title = styled.h1<{ isDark: boolean }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.isDark ? 'white' : '#333'};
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

const GroupCard = styled.div<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? 'rgba(45, 55, 72, 0.8)' : 'rgba(243, 244, 246, 0.8)'};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;

const GroupName = styled.h3<{ isDark: boolean }>`
  font-weight: 500;
  color: ${props => props.isDark ? 'white' : '#333'};
  margin-bottom: 0.5rem;
`;

const GroupContent = styled.div`
  margin-top: 1rem;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CreateFormulaButton = styled(IconButton)`
  margin-top: 1rem;
`;

const JobTitle = styled.h3<{ isDark: boolean }>`
  font-size: 1.2rem;
  color: ${props => props.isDark ? '#e2e8f0' : '#4b5563'};
  margin-bottom: 1rem;
`;

const EntryValue = styled.input<{ isDark: boolean }>`
  width: 120px; // Reduced width
  padding: 0.5rem;
  border: 1px solid ${props => props.isDark ? '#4b5563' : '#d1d5db'};
  border-radius: 0.25rem;
  background-color: ${props => props.isDark ? '#374151' : '#f9fafb'};
  color: ${props => props.isDark ? '#f3f4f6' : '#1f2937'};
`;

const ThemeToggle = styled(IconButton)`
  font-size: 1.25rem;
`;

const Input = styled.input<{ isDark: boolean }>`
  width: 100%;
  max-width: 300px; // Limit the maximum width
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.isDark ? '#4b5563' : '#d1d5db'};
  background-color: ${props => props.isDark ? '#374151' : '#f9fafb'};
  color: ${props => props.isDark ? '#f3f4f6' : '#1f2937'};
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? '#3b82f6' : '#2563eb'};
    box-shadow: 0 0 0 2px ${props => props.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'};
  }
`;

const FormulaDisplay = styled.div<{ isDark: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.isDark ? '#374151' : '#f3f4f6'};
  border-radius: 0.5rem;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
`;

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
  value?: string;
}

interface Formula {
  id: string;
  jobName: string;
  entries: Entry[];
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showCreateFormulaModal, setShowCreateFormulaModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [jobName, setJobName] = useState('');
  const [formulas, setFormulas] = useState<Formula[]>([]);

  useEffect(() => {
    fetchMachines();
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDarkMode);
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.post('/api/user-dashboard', { action: 'getMachines' });
      console.log('Fetched machines:', response.data);
      if (Array.isArray(response.data)) {
        setMachines(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setMachines([]);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      setMachines([]);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleMachine = (machineId: string) => {
    setExpandedMachine(expandedMachine === machineId ? null : machineId);
  };

  const handleCreateFormula = async () => {
    if (jobName && selectedMachine) {
      try {
        const newFormula: Formula = {
          id: Date.now().toString(),
          jobName,
          entries: selectedMachine.groups.flatMap(group => 
            group.entries
              .filter(entry => entry.filterable)
              .map(entry => ({ ...entry, value: '' }))
          )
        };
        const response = await axios.post('/api/user-dashboard', { 
          action: 'createFormula',
          machineId: selectedMachine.id,
          formula: newFormula
        });
        setFormulas([...formulas, response.data]);
        setJobName('');
        setShowCreateFormulaModal(false);
      } catch (error) {
        console.error('Error creating formula:', error);
      }
    }
  };

  const handleEntryValueChange = async (formulaId: string, entryId: string, value: string) => {
    try {
      await axios.post('/api/user-dashboard', {
        action: 'updateEntryValue',
        formulaId,
        entryId,
        value
      });
      setFormulas(formulas.map(formula => 
        formula.id === formulaId
          ? {
              ...formula,
              entries: formula.entries.map(entry =>
                entry.id === entryId ? { ...entry, value } : entry
              )
            }
          : formula
      ));
    } catch (error) {
      console.error('Error updating entry value:', error);
    }
  };

  const renderFormulaDisplay = (formula: Formula) => {
    const parts = [formula.jobName];
    formula.entries.forEach(entry => {
      if (entry.value) {
        parts.push(entry.value);
      }
    });
    return parts.join(' - ');
  };

  return (
    <DashboardContainer isDark={isDark}>
      <Header isDark={isDark}>
        <HeaderContent>
          <HeaderLeft>
            <Title isDark={isDark}>User Dashboard</Title>
          </HeaderLeft>
          <ThemeToggle isDark={isDark} onClick={toggleTheme}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </ThemeToggle>
          <IconButton isDark={isDark} onClick={() => navigate('/login')}>
            <LogOut size={20} />
          </IconButton>
        </HeaderContent>
      </Header>

      <MainContent>
        <SectionHeader>
          <SectionTitle isDark={isDark}>Machines</SectionTitle>
        </SectionHeader>

        <MachineList>
          {machines.map(machine => (
            <MachineCard key={machine.id} isDark={isDark}>
              <MachineHeader>
                <MachineName isDark={isDark} onClick={() => toggleMachine(machine.id)}>
                  {machine.name}
                </MachineName>
                <IconButton isDark={isDark} onClick={() => toggleMachine(machine.id)}>
                  {expandedMachine === machine.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </IconButton>
              </MachineHeader>

              {expandedMachine === machine.id && (
                <>
                  <CreateFormulaButton 
                    isDark={isDark} 
                    onClick={() => {
                      setSelectedMachine(machine);
                      setShowCreateFormulaModal(true);
                    }}
                  >
                    <Plus size={20} /> Create Formula
                  </CreateFormulaButton>

                  {formulas.filter(formula => 
                    formula.entries.some(entry => 
                      machine.groups.some(group => 
                        group.entries.some(groupEntry => groupEntry.id === entry.id)
                      )
                    )
                  ).map(formula => (
                    <GroupCard key={formula.id} isDark={isDark}>
                      <JobTitle isDark={isDark}>{formula.jobName}</JobTitle>
                      {machine.groups.map(group => (
                        <div key={group.id}>
                          <GroupName isDark={isDark}>{group.name}</GroupName>
                          <GroupContent>
                            {group.entries.filter(entry => entry.filterable).map(entry => {
                              const formulaEntry = formula.entries.find(e => e.id === entry.id);
                              return (
                                <SettingRow key={entry.id}>
                                  <span>{entry.name}</span>
                                  <EntryValue
                                    isDark={isDark}
                                    value={formulaEntry?.value || ''}
                                    onChange={(e) => handleEntryValueChange(formula.id, entry.id, e.target.value)}
                                    placeholder="Enter value"
                                  />
                                </SettingRow>
                              );
                            })}
                          </GroupContent>
                        </div>
                      ))}
                      <FormulaDisplay isDark={isDark}>
                        {renderFormulaDisplay(formula)}
                      </FormulaDisplay>
                    </GroupCard>
                  ))}
                </>
              )}
            </MachineCard>
          ))}
        </MachineList>
      </MainContent>

      <Modal
        isOpen={showCreateFormulaModal}
        onClose={() => setShowCreateFormulaModal(false)}
        title="Create New Formula"
        onSubmit={handleCreateFormula}
        isDark={isDark}
      >
        <Input
          type="text"
          value={jobName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJobName(e.target.value)}
          placeholder="Enter job name"
          isDark={isDark}
        />
      </Modal>
    </DashboardContainer>
  );
};

export default UserDashboard;