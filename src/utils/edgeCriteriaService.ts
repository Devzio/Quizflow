import edgeCriteriaData from '../config/edgeCriteriaOptions.json';

export interface EdgeCriterion {
  id: string;
  value: string;
  label: string;
}

// Add event emitter functionality
type Listener = () => void;
const listeners: Listener[] = [];

export const addChangeListener = (listener: Listener): void => {
  listeners.push(listener);
};

export const removeChangeListener = (listener: Listener): void => {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};

const notifyListeners = (): void => {
  // Notify all registered listeners when criteria change
  listeners.forEach(listener => setTimeout(listener, 0));
};

// API endpoints
const API_BASE_URL = 'http://localhost:3001/api';
const EDGE_CRITERIA_ENDPOINT = `${API_BASE_URL}/edge-criteria`;

// In-memory cache of the edge criteria
let edgeCriteria: EdgeCriterion[] = [...edgeCriteriaData];

// Sort criteria alphabetically by label
const sortCriteriaByLabel = (criteria: EdgeCriterion[]): EdgeCriterion[] => {
  return [...criteria].sort((a, b) => a.label.localeCompare(b.label));
};

// Initialize with sorted criteria
edgeCriteria = sortCriteriaByLabel(edgeCriteria);

// Get all edge criteria
export const getAllCriteria = (): EdgeCriterion[] => {
  return [...edgeCriteria];
};

// Save to server (updates the JSON file)
const saveToServer = async (): Promise<void> => {
  try {
    const response = await fetch(EDGE_CRITERIA_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edgeCriteria),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // Still save to localStorage as a fallback
    saveToLocalStorage();
  } catch (error) {
    console.error('Failed to update edge criteria on server:', error);
    // If server save fails, at least save to localStorage
    saveToLocalStorage();
  }
};

// Add a new criterion
export const addCriterion = (criterion: EdgeCriterion): void => {
  if (!criterion.id) {
    criterion.id = Date.now().toString();
  }
  edgeCriteria = sortCriteriaByLabel([...edgeCriteria, criterion]);
  saveToServer();
  notifyListeners();
};

// Update an existing criterion
export const updateCriterion = (criterion: EdgeCriterion): void => {
  edgeCriteria = sortCriteriaByLabel(edgeCriteria.map(item => 
    item.id === criterion.id ? criterion : item
  ));
  saveToServer();
  notifyListeners();
};

// Delete a criterion
export const deleteCriterion = (id: string): void => {
  edgeCriteria = sortCriteriaByLabel(edgeCriteria.filter(item => item.id !== id));
  saveToServer();
  notifyListeners();
};

// Save to localStorage for persistence (as a fallback)
const saveToLocalStorage = (): void => {
  localStorage.setItem('edgeCriteria', JSON.stringify(edgeCriteria));
};

// Load from server or fallback to localStorage
export const loadFromServerOrLocal = async (): Promise<void> => {
  try {
    // Try to fetch from the server first
    const response = await fetch(EDGE_CRITERIA_ENDPOINT);
    
    if (response.ok) {
      const data = await response.json();
      edgeCriteria = sortCriteriaByLabel(data);
      // Update localStorage with the latest data
      saveToLocalStorage();
      notifyListeners();
      return;
    }
    
    throw new Error(`Server responded with status: ${response.status}`);
  } catch (error) {
    console.error('Failed to fetch edge criteria from server, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const savedCriteria = localStorage.getItem('edgeCriteria');
    if (savedCriteria) {
      edgeCriteria = sortCriteriaByLabel(JSON.parse(savedCriteria));
    } else {
      edgeCriteria = sortCriteriaByLabel(edgeCriteriaData);
    }
    notifyListeners();
  }
};

// Initialize by loading from server or localStorage
loadFromServerOrLocal();