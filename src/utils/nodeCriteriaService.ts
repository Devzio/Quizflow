import { EdgeCriterion } from './edgeCriteriaService';

// Define our node criterion interface (similar to EdgeCriterion for consistency)
export interface NodeCriterion {
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
const NODE_CRITERIA_ENDPOINT = `${API_BASE_URL}/node-criteria`;

// Default node criteria
const defaultNodeCriteria: NodeCriterion[] = [
  { id: "1", value: "address", label: "Address" },
  { id: "2", value: "allergies", label: "Allergies" },
  { id: "3", value: "currently_on_pill", label: "Currently on pill" },
  { id: "4", value: "demographic_dob", label: "Date of Birth" },
  { id: "5", value: "demographic_full_name", label: "Full Name" },
  { id: "6", value: "demographic_gender", label: "Gender" },
  { id: "7", value: "dva", label: "Department of Veterans' Affairs Number" },
  { id: "8", value: "email", label: "Email" },
  { id: "9", value: "eScript_only", label: "eScript only" },
  { id: "10", value: "ethnicity", label: "ethnicity" },
  { id: "11", value: "family_history", label: "Family History" },
  { id: "12", value: "medical_history", label: "Medical History" },
  { id: "13", value: "medicare", label: "Medicare" },
  { id: "14", value: "medication", label: "Medication" },
  { id: "15", value: "mobile", label: "Mobile" },
  { id: "16", value: "nib_membership_number", label: "NIB Membership Number" },
  { id: "17", value: "observation_alcohol", label: "Alcohol Consumption" },
  { id: "18", value: "observation_bp", label: "Blood pressure" },
  { id: "19", value: "observation_height", label: "Height" },
  { id: "20", value: "observation_smoking", label: "Smoking Status" },
  { id: "21", value: "observation_waist", label: "Waist Measurement" },
  { id: "22", value: "observation_weight", label: "Weight" },
  { id: "23", value: "payment", label: "Payment" },
  { id: "24", value: "preferred_product", label: "Preferred product" },
  { id: "25", value: "previously_on_pill", label: "Previously on pill" },
  { id: "26", value: "recently_on_medication", label: "Recently on medication" }
];

// In-memory cache of the node criteria
let nodeCriteria: NodeCriterion[] = [...defaultNodeCriteria];

// Sort criteria alphabetically by label
const sortCriteriaByLabel = (criteria: NodeCriterion[]): NodeCriterion[] => {
  return [...criteria].sort((a, b) => a.label.localeCompare(b.label));
};

// Initialize with sorted criteria
nodeCriteria = sortCriteriaByLabel(nodeCriteria);

// Get all node criteria
export const getAllCriteria = (): NodeCriterion[] => {
  return [...nodeCriteria];
};

// Save to server (updates the JSON file)
const saveToServer = async (): Promise<void> => {
  try {
    const response = await fetch(NODE_CRITERIA_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeCriteria),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // Still save to localStorage as a fallback
    saveToLocalStorage();
  } catch (error) {
    console.error('Failed to update node criteria on server:', error);
    // If server save fails, at least save to localStorage
    saveToLocalStorage();
  }
};

// Add a new criterion
export const addCriterion = (criterion: NodeCriterion): void => {
  if (!criterion.id) {
    criterion.id = Date.now().toString();
  }
  nodeCriteria = sortCriteriaByLabel([...nodeCriteria, criterion]);
  saveToServer();
  notifyListeners();
};

// Update an existing criterion
export const updateCriterion = (criterion: NodeCriterion): void => {
  nodeCriteria = sortCriteriaByLabel(nodeCriteria.map(item => 
    item.id === criterion.id ? criterion : item
  ));
  saveToServer();
  notifyListeners();
};

// Delete a criterion
export const deleteCriterion = (id: string): void => {
  nodeCriteria = sortCriteriaByLabel(nodeCriteria.filter(item => item.id !== id));
  saveToServer();
  notifyListeners();
};

// Save to localStorage for persistence (as a fallback)
const saveToLocalStorage = (): void => {
  localStorage.setItem('nodeCriteria', JSON.stringify(nodeCriteria));
};

// Load from server or fallback to localStorage
export const loadFromServerOrLocal = async (): Promise<void> => {
  try {
    // Try to fetch from the server first
    const response = await fetch(NODE_CRITERIA_ENDPOINT);
    
    if (response.ok) {
      const data = await response.json();
      nodeCriteria = sortCriteriaByLabel(data);
      // Update localStorage with the latest data
      saveToLocalStorage();
      notifyListeners();
      return;
    }
    
    throw new Error(`Server responded with status: ${response.status}`);
  } catch (error) {
    console.error('Failed to fetch node criteria from server, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const savedCriteria = localStorage.getItem('nodeCriteria');
    if (savedCriteria) {
      nodeCriteria = sortCriteriaByLabel(JSON.parse(savedCriteria));
    } else {
      nodeCriteria = sortCriteriaByLabel(defaultNodeCriteria);
    }
    notifyListeners();
  }
};

// Initialize by loading from server or localStorage
loadFromServerOrLocal();
