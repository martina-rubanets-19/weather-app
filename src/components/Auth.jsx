import { useState } from "react";

import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "../firebase";

export default function Auth({ user }) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  if (user) {
    return (
      <div className="authBox">
        <div className="authUser">
          👋 {user.email}
        </div>

        <button
          className="authBtn"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="authBox">
      <h3 className="authTitle">
        {isLogin ? "Login" : "Register"}
      </h3>

      <form onSubmit={handleSubmit} className="authForm">
        <input
          className="authInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="authInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="authError">
            {error}
          </div>
        )}

        <button className="authBtn" type="submit">
          {isLogin ? "Login" : "Create account"}
        </button>
      </form>

      <button
        className="authSwitch"
        onClick={() => setIsLogin(!isLogin)}
        type="button"
      >
        {isLogin
          ? "No account? Register"
          : "Already have account?"}
      </button>
    </div>
  );
}