import axiosClient from "@/api/axiosClient";
import { useAuthStore } from "@/auth/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");

  const update = async () => {
    const res = await axiosClient.put("/auth/profile", {
      name,
      email,
      phone,
      location,
    });
    setToken(res.data.accessToken);
  };

  return (
    <div className="p-6 container px-4 lg:px-8 mx-auto ">
      <h1 className="text-2xl mb-6">Profile</h1>
      <div className="bg-secondary p-6 rounded-md max-w-xl">
        <div className="flex gap-4 border-b pb-4 mb-4 items-center">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h3>{user?.name}</h3> <h4>{user?.email}</h4>
          </div>
        </div>
        <div>
          <div className="flex gap-2 items-center justify-center">
            <Label>Name</Label>
            <Input
              className="border p-2 w-full mt-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center justify-center">
            <Label>email</Label>
            <Input
              className="border p-2 w-full mt-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center justify-center">
            <Label>Phone</Label>
            <Input
              className="border p-2 w-full mt-4"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center justify-center">
            <Label>Location</Label>
            <Input
              className="border p-2 w-full mt-4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <Button className="e px-4 py-2 mt-4" onClick={update}>
          Update Profile
        </Button>
      </div>
    </div>
  );
}
