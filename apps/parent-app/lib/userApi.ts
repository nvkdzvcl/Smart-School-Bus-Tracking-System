import type { IParent } from "@/types/data-types";
import apiClient from "./api";

export async function getUserById(id: string) {
  return await apiClient.get(`/users/${id}`);
}

export async function updateParentInfo(
  parentId: string,
  parent: Partial<IParent>
) {
  return await apiClient.put(`/users/${parentId}`, {
    fullName: parent.fullName,
    phone: parent.phone,
    email: parent.email,
  });
}
