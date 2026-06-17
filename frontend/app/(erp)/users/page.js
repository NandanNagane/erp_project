import UserListing from "@/components/users/userListing";
import { usersApi } from "@/lib/api/users.api";

export default async function UsersPage() {
  let users = null;
  try {
    const res = await usersApi.getAll();
    users = res.data?.data;
  } catch (error) {
    console.log(error);
  }
  return (
    <>
      <UserListing users={users} />
    </>
  );
}
