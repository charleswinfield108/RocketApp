import apiClient from './api';

export interface ApiAccountRoleDTO {
  id: number;
  phone: string;
  email: string;
  address: string;
}

export interface ApiAccountDTO {
  id: number;
  name: string;
  email: string;
  customer: ApiAccountRoleDTO | null;
  courier: ApiAccountRoleDTO | null;
}

export interface ApiUpdateAccountDTO {
  email: string;
  phone: string;
}

export const accountService = {
  getAccount: (userId: number, type: 'customer' | 'courier') =>
    apiClient.get<{ data: ApiAccountDTO }>(`/api/account/${userId}?type=${type}`),

  updateAccount: (
    userId: number,
    type: 'customer' | 'courier',
    data: ApiUpdateAccountDTO
  ) =>
    apiClient.put<{ data: ApiAccountDTO }>(
      `/api/account/${userId}?type=${type}`,
      data
    ),
};
