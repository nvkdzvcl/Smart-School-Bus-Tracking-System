import apiClient from './api';

export async function getSchedule(id: string, from: string, to: string) {
  return await apiClient.get(`/trips/student/${id}/schedule`, {
    params: { from, to },
  });
}
