import { useState, type FormEvent } from "react";
import { LogIn, UserPlus, Ticket } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Auth() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    if (loginEmail.trim() === "" || loginPassword.trim() === "") {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        email: loginEmail,
        password: loginPassword,
      };

      const loginResponse = await axiosClient.post("/auth/login", data);

      const token = (loginResponse.data as { token?: string })?.token;
      if (!token) {
        toast.error("Login failed: token missing from response");
        return;
      }

      window.localStorage.setItem("token", token);
      window.localStorage.setItem("userEmail", loginEmail);
      setUser({ email: loginEmail });
      toast.success("Login successful!");
      navigate("/events");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred during login",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    setIsLoading(true);

    try {
      if (registerUsername.trim() === "") {
        toast.error("Username is required");
        setIsLoading(false);
        return;
      }

      if (registerEmail.trim() === "") {
        toast.error("Email is required");
        setIsLoading(false);
        return;
      }

      if (registerPassword.trim().length < 6) {
        toast.error("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      const data = {
        name: registerUsername,
        password: registerPassword,
        email: registerEmail,
      };

      await axiosClient.post("/auth/register", data);

      window.localStorage.setItem("userEmail", registerEmail);
      window.localStorage.setItem("userName", registerUsername);

      Swal.fire({
        icon: "success",
        title: "Signup Successful",
        text: "Your account has been created successfully!",
        confirmButtonText: "Proceed to Login",
      }).then(() => {
        navigate("/login");
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ticket className="h-12 w-12 text-white" />
            <h1 className="text-4xl font-bold text-white">Event Ticketing</h1>
          </div>
          <p className="text-white/90">Book your favorite events with ease</p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full  ">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login to your account to continue
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <LogIn className="h-4 w-4 mr-2" />
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register to start booking events
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username *</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Choose a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
