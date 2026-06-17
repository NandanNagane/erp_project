import UserListing from "@/components/users/userListing";
import { usersApi } from "@/lib/api/users.api";

export default async function UsersPage({ searchParams }) {
  const { page = "1", limit = "10" } = await searchParams;
  let response = null;
  try {
    response = await usersApi.getAll({ page, limit });
  } catch (error) {
    console.log(error);
  }
  return (
    <>
      <UserListing response={response} />
    </>
  );
}
