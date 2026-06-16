import { usersApi } from "@/lib/api/users.api";

export default async function UsersPage() {
  try {
    const data = await usersApi.getAll();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  return <>users page</>;
}
