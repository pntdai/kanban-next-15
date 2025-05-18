import { useState } from "react";
import { Button } from "../ui/Button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserProfileProps {
  initialUser: User;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ initialUser, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(user);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Profile</h2>
        {!isEditing ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Name</span>
            <p>{user.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Email</span>
            <p>{user.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Role</span>
            <p>{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
