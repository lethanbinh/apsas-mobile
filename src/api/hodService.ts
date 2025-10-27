// --- INTERFACES ---

import { ApiService } from '../utils/ApiService';

export interface HoDData {
  accountId: number;
  accountCode: string;
}

export interface HoDListData {
  accountId: number;
  hoDId: string;
  accountCode: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  fullName: string | null;
  avatar: string | null;
  address: string | null;
  gender: number | null;
  dateOfBirth: string | null;
  role: number;
}

// --- FUNCTIONS ---

export const fetchHoDDetails = async (hodId: string): Promise<HoDData> => {
  try {
    const response = await ApiService.get<HoDData>(`/api/HoD/${hodId}`);
    if (response.result) return response.result;
    throw new Error(`HoD details not found for ID ${hodId}.`);
  } catch (error: any) {
    console.error(`Failed to fetch HOD ${hodId}:`, error);
    throw error;
  }
};

export const fetchHoDList = async (): Promise<HoDListData[]> => {
  try {
    const response = await ApiService.get<HoDListData[]>('/api/HoD/list');
    if (response.result) {
      return response.result;
    }
    throw new Error('No HOD list data found.');
  } catch (error: any) {
    console.error('Failed to fetch HOD list:', error);
    throw error;
  }
};

export const findHoDByAccountId = async (
  accountId: string | number,
): Promise<HoDListData | null> => {
  try {
    const response = await ApiService.get<HoDListData[]>(`/api/HoD/list`);
    if (response.result) {
      const hod = response.result.find(
        h => String(h.accountId) === String(accountId),
      );
      return hod || null;
    }
    throw new Error('No HOD list data found.');
  } catch (error: any) {
    console.error(`Failed to find HOD by account ID ${accountId}:`, error);
    throw error;
  }
};
