"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import * as yup from "yup";
import { login, register } from "../../utils/axios"; 
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { toast } from "sonner"; // Importação do toast da biblioteca sonner

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const router = useRouter();

  const loginSchema = yup.object().shape({
    email: yup.string().email("O email não é válido").required("O email é obrigatório"),
    password: yup.string().required("A senha é obrigatória"),
  });

  const registerSchema = yup.object().shape({
    name: yup.string().required("O nome é obrigatório"),
    email: yup.string().email("O email não é válido").required("O email é obrigatório"),
    password: yup
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("A senha é obrigatória"),
  });

  const validateLogin = async () => {
    try {
      await loginSchema.validate({ email: loginEmail, password: loginPassword }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      if (validationErrors instanceof yup.ValidationError) {
        const fieldErrors: { [key: string]: string } = {};
        validationErrors.inner.forEach((error) => {
          if (error.path) fieldErrors[error.path] = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const validateRegister = async () => {
    try {
      await registerSchema.validate(
        { name: registerName, email: registerEmail, password: registerPassword },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (validationErrors) {
      if (validationErrors instanceof yup.ValidationError) {
        const fieldErrors: { [key: string]: string } = {};
        validationErrors.inner.forEach((error) => {
          if (error.path) fieldErrors[error.path] = error.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      const isValid = await validateLogin();
      if (!isValid) {
        return;
      }
      const user = await login(loginEmail, loginPassword);
      if (user.message === "Usuario nao encontrado") {
        setErrors({ email: "Usuário não encontrado" });
        toast.error("Usuário não encontrado");
        return;
      }
      const token = user.token;
      setCookie(undefined, "authFlowToken", token, {
        maxAge: 60 * 60 * 1, // 1 hora
      });
      toast.success("Login realizado com sucesso!");
      router.push("/tasks");
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
      setErrors({ general: "Não foi possível realizar o login" });
      toast.error("Erro ao realizar login. Tente novamente.");
    }
  };

  const handleRegister = async () => {
    try {
      const isValid = await validateRegister();
      if (!isValid) {
        return;
      }
      const registerUser = await register(registerName, registerEmail, registerPassword);
      if (registerUser.message === "Email ja cadastrado") {
        setErrors({ email: "Usuário já existe" });
        toast.error("Usuário já existe");
        return;
      }
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      setActiveTab("login");
    } catch (error: any) {
      console.error("Erro ao fazer cadastro: ", error);
      setErrors({ email: "Não foi possível fazer o cadastro" });
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setErrors({});
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
        <TabsList className="w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Cadastro</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Login</CardTitle>
              <CardDescription>Acesse sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button className="max-w- w-full cursor-pointer" onClick={handleLogin}>
                Entrar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Cadastro</CardTitle>
              <CardDescription>Crie sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button className="max-w- w-full cursor-pointer" onClick={handleRegister}>
                Cadastrar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}